const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const StandardEquipment = require('../models/StandardEquipment');
const { compatibleAuthOptional, compatibleAuth } = require('../middlewares/compatibleAuth');
const { notifySave, notifyDelete, notifyAdd } = require('../middlewares/notificationMiddleware');

// GET all equipments with optional filters: operations (comma-separated codes) and search term
router.get('/', async (req, res) => {
  try {
    const { operations, search } = req.query;
    const where = {};

    if (operations) {
      const codes = operations.split(',').map(code => code.trim());
      // Correction : créer des patterns pour chaque opération sélectionnée
      const prefixes = codes.map(code => `${code}.`); // Ex: ["2."] pour opération 2
      
      where.Code_Eq = {
        [Op.or]: prefixes.map(prefix => ({
          [Op.like]: `${prefix}%`
        }))
      };
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { Code_Eq: { [Op.like]: searchTerm } },
        { Operations: { [Op.like]: searchTerm } },
        { Equipment_Reference: { [Op.like]: searchTerm } },
        { Supplier_Technology: { [Op.like]: searchTerm } },
        { Type: { [Op.like]: searchTerm } },
        { Calculation_Method: { [Op.like]: searchTerm } },
        { Workstation_Dimensions: { [Op.like]: searchTerm } },
        { Reference_CDC: { [Op.like]: searchTerm } },
        { Reference_PR: { [Op.like]: searchTerm } }
      ];
    }

    const equipment = await StandardEquipment.findAll({
      where,
      order: [['Code_Eq', 'ASC']]
    });

    // Debug: afficher la structure des données
    if (equipment.length > 0) {
      console.log('Structure du premier équipement:', {
        id: equipment[0].id,
        Code_Eq: equipment[0].Code_Eq,
        Equipment_Reference: equipment[0].Equipment_Reference,
        allFields: Object.keys(equipment[0].dataValues)
      });
    }

    res.json({
      success: true,
      data: equipment,
      total: equipment.length
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des équipements:', err.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des équipements',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET a specific equipment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID est requis' });
    }

    const equipment = await StandardEquipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({ 
        success: false,
        error: 'Équipement non trouvé' 
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'équipement:', err.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération de l\'équipement',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// UPDATE a specific equipment by ID
router.put('/:id', compatibleAuth, notifySave('Standard Equipment', (data) => {
  return `1 équipement standard modifié`;
}), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'ID et données de mise à jour sont requis' });
    }

    const equipment = await StandardEquipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ 
        success: false,
        error: 'Équipement non trouvé' 
      });
    }

    // Vérifier les permissions selon le rôle
    const userRole = req.body.role;
    
    if (userRole === 'Achat') {
      // Le rôle Achat ne peut modifier que Estimated_Cost_EUR
      const allowedFields = ['Estimated_Cost_EUR', 'role'];
      const attemptedFields = Object.keys(updateData).filter(field => field !== 'role');
      const unauthorizedFields = attemptedFields.filter(field => !allowedFields.includes(field));
      
      if (unauthorizedFields.length > 0) {
        return res.status(403).json({ 
          success: false,
          error: `Le rôle Achat ne peut modifier que le coût estimé. Champs non autorisés: ${unauthorizedFields.join(', ')}` 
        });
      }
    }

    await equipment.update(updateData);
    const updatedEquipment = await StandardEquipment.findByPk(id);

    res.json({
      success: true,
      message: 'Équipement mis à jour avec succès',
      data: updatedEquipment
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'équipement:', err.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la mise à jour de l\'équipement',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// BATCH UPDATE multiple equipments
router.put('/batch/update', compatibleAuth, notifySave('Standard Equipment', (data) => {
  return `${data.data?.length || 0} équipements standards modifiés`;
}), async (req, res) => {
  try {
    const { equipments } = req.body;

    if (!Array.isArray(equipments) || equipments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Un tableau d\'équipements est requis'
      });
    }

    const updatedEquipments = [];
    const errors = [];

    for (const equipmentData of equipments) {
      try {
        const { id, role, ...updateFields } = equipmentData;

        if (!id) {
          errors.push('ID manquant pour un équipement');
          continue;
        }

        const equipment = await StandardEquipment.findByPk(id);
        if (!equipment) {
          errors.push(`Équipement avec ID ${id} non trouvé`);
          continue;
        }

        // Vérifier les permissions selon le rôle
        if (role === 'Achat') {
          // Le rôle Achat ne peut modifier que Estimated_Cost_EUR
          const allowedFields = ['Estimated_Cost_EUR'];
          const attemptedFields = Object.keys(updateFields);
          const unauthorizedFields = attemptedFields.filter(field => !allowedFields.includes(field));
          
          if (unauthorizedFields.length > 0) {
            errors.push(`Le rôle Achat ne peut modifier que le coût estimé pour l'équipement ${id}. Champs non autorisés: ${unauthorizedFields.join(', ')}`);
            continue;
          }
        }

        await equipment.update(updateFields);
        updatedEquipments.push(await StandardEquipment.findByPk(id));

      } catch (err) {
        errors.push(`Erreur lors de la mise à jour de l'équipement ${equipmentData.id}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `${updatedEquipments.length} équipements mis à jour`,
      data: updatedEquipments,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour batch:', err.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la mise à jour des équipements',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// BATCH DELETE multiple equipments
router.delete('/batch/delete', compatibleAuth, notifyDelete('Standard Equipment', (data) => {
  return `${data.deletedCount || 0} équipements standards supprimés`;
}), async (req, res) => {
  try {
    const { ids, role } = req.body;
    
    // Vérifier que l'utilisateur n'est pas Achat
    if (role === 'Achat') {
      return res.status(403).json({
        success: false,
        error: 'Le rôle Achat n\'est pas autorisé à supprimer des équipements'
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Un tableau d\'IDs est requis'
      });
    }

    const deletedCount = await StandardEquipment.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });

    res.json({
      success: true,
      message: `${deletedCount} équipements supprimés`,
      deletedCount
    });
  } catch (err) {
    console.error('Erreur lors de la suppression batch:', err.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la suppression des équipements',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// CREATE a new equipment (ajout manuel)
router.post('/', compatibleAuth, notifyAdd('Standard Equipment', (data) => {
  return `1 nouvel équipement standard ajouté`;
}), async (req, res) => {
  try {
    const { role, ...equipmentData } = req.body;
    
    // Vérifier que l'utilisateur n'est pas Achat
    if (role === 'Achat') {
      return res.status(403).json({
        success: false,
        error: 'Le rôle Achat n\'est pas autorisé à ajouter des équipements'
      });
    }

    // Vérifier que tous les champs obligatoires sont présents (à adapter selon ton modèle)
    // Exemple : if (!equipmentData.Code_Eq || !equipmentData.Equipment_Reference) { ... }

    const newEquipment = await StandardEquipment.create(equipmentData);

    res.json({
      success: true,
      message: 'Équipement ajouté avec succès',
      data: newEquipment
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de l\'équipement:', err.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de l\'ajout de l\'équipement',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;