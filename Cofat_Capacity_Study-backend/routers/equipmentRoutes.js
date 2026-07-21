const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer.js');
const Equipment = require('../models/Equipment.js');
const { compatibleAuthOptional } = require('../middlewares/compatibleAuth');
const { notifyAdd } = require('../middlewares/notificationMiddleware');

// POST /api/equipment (créer un équipement)
router.post(
  '/',  // Changé de '/equipment' à '/'
  compatibleAuthOptional,
  upload.single('image'),
  notifyAdd('Equipment', (data) => {
    return `Équipement: ${data.data?.nom || 'Nouvel équipement'}`;
  }),
  async (req, res) => {
    try {
      const { equipmentId, equipmentCode, nom, referenceEquipment } = req.body;

      console.log('Body received (Equipment Creation):', req.body);
      console.log('File received (Image):', req.file);

      // Validation des champs requis
      if (!equipmentId || !equipmentCode || !nom || !referenceEquipment) {
        return res.status(400).json({
          success: false,
          message: 'Les champs Equipment ID, Code, Nom et Référence sont requis.',
        });
      }

      const imagePath = req.file?.path;
      if (!imagePath) {
        return res.status(400).json({
          success: false,
          message: 'Le fichier image est requis.',
        });
      }

      // Option 1: Requête SQL brute pour éviter les problèmes de timestamp
      const [results, metadata] = await Equipment.sequelize.query(`
        INSERT INTO Equipment (equipmentId, equipmentCode, nom, referenceEquipment, imagePath, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (:equipmentId, :equipmentCode, :nom, :referenceEquipment, :imagePath, GETDATE(), GETDATE())
      `, {
        replacements: {
          equipmentId,
          equipmentCode,
          nom,
          referenceEquipment,
          imagePath
        },
        type: Equipment.sequelize.QueryTypes.SELECT
      });

      const newEquipment = results[0];

      res.status(201).json({
        success: true,
        message: 'Équipement créé avec succès',
        data: newEquipment,
      });

    } catch (err) {
      console.error('Erreur lors de la création de l\'équipement:', err);

      if (err.original && err.original.number === 2627) { // SQL Server unique constraint error
        return res.status(400).json({
          success: false,
          message: 'Un équipement avec cet ID existe déjà. Veuillez utiliser un ID unique.',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur lors de l\'enregistrement de l\'équipement.',
        error: err.message,
      });
    }
  }
);

// Alternative avec timestamps désactivés
router.post(
  '/no-timestamps',  // Changé de '/equipment-no-timestamps' à '/no-timestamps'
  compatibleAuthOptional,
  upload.single('image'),
  notifyAdd('Equipment', (data) => {
    return `Équipement: ${data.data?.nom || 'Nouvel équipement'}`;
  }),
  async (req, res) => {
    try {
      const { equipmentId, equipmentCode, nom, referenceEquipment } = req.body;

      // Validation des champs requis
      if (!equipmentId || !equipmentCode || !nom || !referenceEquipment) {
        return res.status(400).json({
          success: false,
          message: 'Les champs Equipment ID, Code, Nom et Référence sont requis.',
        });
      }

      const imagePath = req.file?.path;
      if (!imagePath) {
        return res.status(400).json({
          success: false,
          message: 'Le fichier image est requis.',
        });
      }

      // Créer sans timestamps
      const newEquipment = await Equipment.create({
        equipmentId,
        equipmentCode,
        nom,
        referenceEquipment,
        imagePath,
      }, {
        timestamps: false // Désactiver les timestamps pour cette création
      });

      res.status(201).json({
        success: true,
        message: 'Équipement créé avec succès',
        data: newEquipment,
      });

    } catch (err) {
      console.error('Erreur lors de la création de l\'équipement:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
        error: err.message,
      });
    }
  }
);

// GET /api/equipment (récupérer tous les équipements)
router.get('/', async (req, res) => {  // Changé de '/equipment' à '/'
  try {
    const equipments = await Equipment.findAll({
      order: [['id', 'DESC']], // Utiliser id au lieu de createdAt si problème persiste
    });
    res.json({
      success: true,
      count: equipments.length,
      data: equipments,
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des équipements:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des équipements',
      error: err.message,
    });
  }
});

// GET /api/equipment/:id (récupérer un équipement par ID)
router.get('/:id', async (req, res) => {  // Changé de '/equipment/:id' à '/:id'
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }
    res.json({ success: true, data: equipment });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'équipement:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'équipement',
      error: err.message,
    });
  }
});

module.exports = router;