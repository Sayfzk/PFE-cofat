// routes/equipmentplaningRoutes.js
const express = require('express');
const router = express.Router();
const { Site, Equipment, EquipmentPlanning } = require('../models');
const { Op } = require('sequelize');
const { compatibleAuthOptional, compatibleAuth } = require('../middlewares/compatibleAuth');
const { notifySave, notifyDelete, notifyAdd } = require('../middlewares/notificationMiddleware');

// Helper pour normaliser les nombres provenant du front
const normalizeNumber = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'nan') return null;
    // gérer séparateur décimal virgule éventuel
    const num = Number(trimmed.replace(',', '.'));
    return Number.isFinite(num) ? num : null;
  }
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  return null;
};


// GET /api/equipment-planning/sites - Lister tous les sites
router.get('/sites', async (req, res) => {
  try {
    const sites = await Site.findAll({
      order: [['nom', 'ASC']],
    });
    res.json({ success: true, data: sites });
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des sites:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur', details: err.message });
  }
});

// GET /api/equipment-planning/site/:siteCode - Récupérer les données de planning par site
router.get('/site/:siteCode', async (req, res) => {
  try {
    const { siteCode } = req.params;
    const site = await Site.findOne({ where: { code: siteCode } });

    if (!site) {
      return res.status(404).json({ success: false, error: `Site '${siteCode}' non trouvé` });
    }

    const planningData = await EquipmentPlanning.findAll({
      where: { siteId: site.id },
      include: [
        {
          model: Equipment,
          attributes: ['id', 'equipmentId', 'equipmentCode', 'nom', 'imagePath', 'referenceEquipment'],
        },
        {
          model: Site,
          attributes: ['id', 'code', 'nom'],
        },
      ],
      order: [
        ['year', 'ASC'],
        ['month', 'ASC'],
        [Equipment, 'nom', 'ASC'],
      ],
    });

    console.log(`📊 Données récupérées pour le site ${siteCode}:`, planningData.length, 'entrées');
    
    res.json({
      success: true,
      data: planningData,
      count: planningData.length,
      site: { id: site.id, code: site.code, nom: site.nom },
    });
  } catch (err) {
    console.error('❌ Erreur de récupération du planning:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur', details: err.message });
  }
});

// POST /api/equipment-planning/save - Sauvegarder les données de planning
router.post('/save', compatibleAuth, notifySave('Planning Equipment', (data) => {
  return `${data.summary?.processed || 0} entrées de planning`;
}), async (req, res) => {
  try {
    const { siteCode, planning } = req.body;

    console.log(`💾 Début de sauvegarde pour le site: ${siteCode}`);
    console.log(`📝 Nombre total d'entrées à sauvegarder: ${planning?.length || 0}`);

    // Validate siteCode
    const site = await Site.findOne({ where: { code: siteCode } });
    if (!site) {
      return res.status(404).json({ success: false, error: `Site '${siteCode}' non trouvé` });
    }

    // Validate planning data
    if (!Array.isArray(planning) || planning.length === 0) {
      return res.status(400).json({ success: false, error: 'Les données de planning sont invalides ou vides' });
    }

    // Débug: analyser les données par année
    const dataByYear = planning.reduce((acc, entry) => {
      acc[entry.year] = (acc[entry.year] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 Répartition des données par année:', dataByYear);

    // Validation et traitement améliorés
    let processedCount = 0;
    let errorCount = 0;
    const errors = [];

    const upsertPromises = planning.map(async (entry, index) => {
      try {
        const { equipmentId, year, month, machineNeed, availableMachine, toOrder, load } = entry;

        // Validation détaillée
        if (!equipmentId) {
          const error = `Entrée ${index}: equipmentId manquant`;
          errors.push(error);
          console.warn('⚠️', error);
          errorCount++;
          return null;
        }

        if (!year || year < 2025 || year > 2030) {
          const error = `Entrée ${index}: année invalide (${year})`;
          errors.push(error);
          console.warn('⚠️', error);
          errorCount++;
          return null;
        }

        if (!month) {
          const error = `Entrée ${index}: mois manquant`;
          errors.push(error);
          console.warn('⚠️', error);
          errorCount++;
          return null;
        }

        // Validate equipment exists
        const equipment = await Equipment.findOne({ where: { equipmentId } });
        if (!equipment) {
          const error = `Entrée ${index}: Équipement avec ID '${equipmentId}' non trouvé`;
          errors.push(error);
          console.warn('⚠️', error);
          errorCount++;
          return null;
        }

        // Log pour debug - particulièrement pour 2027
        if (year === 2027) {
          console.log(`🔧 Sauvegarde 2027 - Équipement: ${equipment.nom}, Mois: ${month}, Données: MN=${machineNeed}, AM=${availableMachine}, TO=${toOrder}, L=${load}`);
        }

        // Normaliser les valeurs numériques provenant du front
        const nMachineNeed = normalizeNumber(machineNeed);
        const nAvailableMachine = normalizeNumber(availableMachine);
        const nToOrder = normalizeNumber(toOrder);
        const nLoad = normalizeNumber(load);

        // Récupérer la ligne existante s'il y en a une (pour éviter d'écraser par des zéros ou des vides)
        const existingRow = await EquipmentPlanning.findOne({
          where: {
            siteId: site.id,
            equipmentId: equipment.id,
            year: parseInt(year),
            month: month.toString()
          }
        });

        const allNull = [nMachineNeed, nAvailableMachine, nToOrder, nLoad].every(v => v === null);
        const isExplicitZeros = [nMachineNeed, nAvailableMachine, nToOrder, nLoad].every(v => v === 0);

        // Ignorer les lignes vides
        if (allNull) {
          console.log(`↩️ Entrée ${index} ignorée (toutes valeurs vides) - ${year} ${month} ${equipmentId}`);
          return null;
        }

        // Protéger les données existantes non nulles contre un écrasement par des zéros
        // CORRECTIF: Permettre toutes les mises à jour pour toutes les années
        if (isExplicitZeros && existingRow && [existingRow.machineNeed, existingRow.availableMachine, existingRow.toOrder, existingRow.load].some(v => v !== 0)) {
          console.log(`🛡️ Entrée ${index} - Mise à jour forcée pour ${year} ${month} ${equipmentId}`);
          // On continue la sauvegarde au lieu d'ignorer
        }

        const payload = {
          siteId: site.id,
          equipmentId: equipment.id,
          year: parseInt(year),
          month: month.toString(),
          machineNeed: nMachineNeed !== null ? parseFloat(nMachineNeed) : (existingRow ? existingRow.machineNeed : 0),
          availableMachine: nAvailableMachine !== null ? parseFloat(nAvailableMachine) : (existingRow ? existingRow.availableMachine : 0),
          toOrder: nToOrder !== null ? parseFloat(nToOrder) : (existingRow ? existingRow.toOrder : 0),
          load: nLoad !== null ? parseFloat(nLoad) : (existingRow ? existingRow.load : 0.0),
        };

        const result = await EquipmentPlanning.upsert(payload);

        processedCount++;
        return result;

      } catch (entryError) {
        const error = `Erreur sur l'entrée ${index}: ${entryError.message}`;
        errors.push(error);
        console.error('❌', error);
        errorCount++;
        return null;
      }
    });

    const results = await Promise.all(upsertPromises);
    const successfulResults = results.filter(result => result !== null);

    console.log(`✅ Traitement terminé:`);
    console.log(`   - Entrées traitées avec succès: ${processedCount}`);
    console.log(`   - Erreurs: ${errorCount}`);
    console.log(`   - Résultats de base de données: ${successfulResults.length}`);

    if (errorCount > 0) {
      console.warn('⚠️ Erreurs rencontrées:', errors.slice(0, 5)); // Log first 5 errors
    }

    // Vérification post-sauvegarde pour 2027
    const count2027 = await EquipmentPlanning.count({
      where: {
        siteId: site.id,
        year: 2027
      }
    });
    console.log(`🔍 Vérification: ${count2027} entrées pour 2027 dans la base après sauvegarde`);

    if (processedCount === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucune donnée valide n\'a pu être sauvegardée',
        details: errors.slice(0, 10) // Return first 10 errors
      });
    }

    res.json({ 
      success: true, 
      message: `Données de planning sauvegardées avec succès (${processedCount}/${planning.length})`,
      summary: {
        processed: processedCount,
        errors: errorCount,
        dataByYear: dataByYear
      }
    });

  } catch (err) {
    console.error('❌ Erreur lors de la sauvegarde du planning:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur', details: err.message });
  }
});

// DELETE /api/equipment-planning/delete/:siteCode/:equipmentId - Supprimer les données de planning
router.delete('/delete/:siteCode/:equipmentId', compatibleAuth, notifyDelete('Planning Equipment', (data) => {
  return `Planning supprimé pour 1 équipement`;
}), async (req, res) => {
  try {
    const { siteCode, equipmentId } = req.params;

    // Validate siteCode
    const site = await Site.findOne({ where: { code: siteCode } });
    if (!site) {
      return res.status(404).json({ success: false, error: `Site '${siteCode}' non trouvé` });
    }

    // Validate equipmentId
    const equipment = await Equipment.findOne({ where: { equipmentId } });
    if (!equipment) {
      return res.status(404).json({ success: false, error: `Équipement avec ID '${equipmentId}' non trouvé` });
    }

    // Delete planning data
    const deletedCount = await EquipmentPlanning.destroy({
      where: {
        siteId: site.id,
        equipmentId: equipment.id,
      },
    });

    console.log(`🗑️ Supprimé ${deletedCount} entrées pour l'équipement ${equipmentId}`);

    res.json({ 
      success: true, 
      message: `Données de planning supprimées avec succès (${deletedCount} entrées)` 
    });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression du planning:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur', details: err.message });
  }
});

// POST /api/equipment-planning/migrate-2027 - Migrer les données 2027 existantes
router.post('/migrate-2027', async (req, res) => {
  try {
    console.log('🔄 Migration des données 2027...');
    
    // Supprimer toutes les données 2027 existantes pour recommencer proprement
    const deletedCount = await EquipmentPlanning.destroy({
      where: {
        year: 2027
      }
    });
    
    console.log(`🗑️ ${deletedCount} entrées 2027 supprimées pour migration`);
    
    res.json({
      success: true,
      message: `Migration terminée: ${deletedCount} entrées 2027 supprimées`,
      deletedCount
    });
    
  } catch (err) {
    console.error('❤️ Erreur lors de la migration 2027:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur', details: err.message });
  }
});

module.exports = router;
