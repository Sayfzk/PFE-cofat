// routes/siteRoutes.js
const express = require('express');
const router = express.Router();
const { Site } = require('../models'); // Adjust path to your models/index.js

// GET all sites (root '/' makes full URL /api/sites)
router.get('/', async (req, res) => {
  try {
    const sites = await Site.findAll({
      attributes: ['id', 'nom', 'code', 'description', 'pays', 'actif', 'createdAt', 'updatedAt'], // Include all fields
      order: [['nom', 'ASC']] // Sort by name
    });
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('❌ Erreur de récupération des sites:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des sites', details: error.message });
  }
});

module.exports = router;