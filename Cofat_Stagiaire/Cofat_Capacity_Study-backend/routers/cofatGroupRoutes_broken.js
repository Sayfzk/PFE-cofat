// routes/cofatGroupRoutes.js
const express = require('express');
const router = express.Router();
const { Site, Equipment, EquipmentPlanning, Spaces, HR } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../db');
const { compatibleAuthOptional } = require('../middlewares/compatibleAuth');

// GET /api/cofat-group/consolidated - Récupérer les données consolidées par équipement
router.get('/consolidated', compatibleAuthOptional, async (req, res) => {
  try {
    console.log('🔄 CofatGroup - Début récupération données consolidées...');

    // Récupérer tous les équipements avec leurs données de planning
    const consolidatedData = await EquipmentPlanning.findAll({
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
        [Equipment, 'nom', 'ASC'],
        ['year', 'ASC'],
        ['month', 'ASC'],
        [Site, 'nom', 'ASC'],
      ],
    });

    console.log(`📊 CofatGroup - ${consolidatedData.length} entrées récupérées depuis la base`);

    // Grouper les données par equipmentId pour agrégation
    const groupedByEquipment = consolidatedData.reduce((acc, entry) => {
      const equipmentKey = entry.Equipment.equipmentId;
      const periodKey = `${entry.year}-${entry.month}`;
      
      if (!acc[equipmentKey]) {
        acc[equipmentKey] = {
          equipment: {
            id: entry.Equipment.id,
            equipmentId: entry.Equipment.equipmentId,
            equipmentCode: entry.Equipment.equipmentCode,
            nom: entry.Equipment.nom,
            imagePath: entry.Equipment.imagePath,
            referenceEquipment: entry.Equipment.referenceEquipment
          },
          sites: new Set(),
          periods: {},
          totalSites: 0
        };
      }

      // Ajouter le site à la liste
      acc[equipmentKey].sites.add(entry.Site.nom);

      // Initialiser la période si elle n'existe pas
      if (!acc[equipmentKey].periods[periodKey]) {
        acc[equipmentKey].periods[periodKey] = {
          year: entry.year,
          month: entry.month,
          machineNeed: 0,
          availableMachine: 0,
          toOrder: 0,
          load: 0,
          sitesCount: 0,
          siteDetails: []
        };
      }

      // Additionner les valeurs
      const period = acc[equipmentKey].periods[periodKey];
      period.machineNeed += entry.machineNeed || 0;
      period.availableMachine += entry.availableMachine || 0;
      period.toOrder += entry.toOrder || 0;
      period.load += entry.load || 0;
      period.sitesCount += 1;
      
      // Ajouter les détails du site pour cette période
      period.siteDetails.push({
        siteName: entry.Site.nom,
        siteCode: entry.Site.code,
        machineNeed: entry.machineNeed || 0,
        availableMachine: entry.availableMachine || 0,
        toOrder: entry.toOrder || 0,
        load: entry.load || 0
      });

      return acc;
    }, {});

    // Transformer en format final pour le frontend
    const consolidatedEquipments = Object.keys(groupedByEquipment).map(equipmentKey => {
      const equipmentData = groupedByEquipment[equipmentKey];
      
      // Convertir Set en Array et compter les sites uniques
      const uniqueSites = Array.from(equipmentData.sites);
      equipmentData.totalSites = uniqueSites.length;

      // Calculer la charge moyenne pour chaque période
      Object.keys(equipmentData.periods).forEach(periodKey => {
        const period = equipmentData.periods[periodKey];
        // Moyenne pondérée de la charge
        if (period.sitesCount > 0) {
          period.load = period.load / period.sitesCount;
        }
      });

      return {
        equipment: equipmentData.equipment,
        sites: uniqueSites,
        totalSites: equipmentData.totalSites,
        periods: equipmentData.periods
      };
    });

    console.log(`✅ CofatGroup - ${consolidatedEquipments.length} équipements consolidés`);
    console.log('🔍 Aperçu des équipements consolidés:', 
      consolidatedEquipments.slice(0, 3).map(eq => ({
        nom: eq.equipment.nom,
        sites: eq.totalSites,
        periods: Object.keys(eq.periods).length
      }))
    );

    res.json({
      success: true,
      data: consolidatedEquipments,
      count: consolidatedEquipments.length,
      summary: {
        totalEquipments: consolidatedEquipments.length,
        totalSites: await Site.count(),
        totalPlanningEntries: consolidatedData.length
      }
    });

  } catch (err) {
    console.error('❌ Erreur CofatGroup consolidation:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la consolidation des données', 
      details: err.message 
    });
  }
});

// GET /api/cofat-group/equipment/:equipmentId/details - Détails d'un équipement spécifique
router.get('/equipment/:equipmentId/details', compatibleAuthOptional, async (req, res) => {
  try {
    const { equipmentId } = req.params;
    console.log(`🔍 CofatGroup - Détails pour équipement: ${equipmentId}`);

    // Récupérer toutes les données de planning pour cet équipement
    const equipmentDetails = await EquipmentPlanning.findAll({
      include: [
        {
          model: Equipment,
          where: { equipmentId },
          attributes: ['id', 'equipmentId', 'equipmentCode', 'nom', 'imagePath', 'referenceEquipment'],
        },
        {
          model: Site,
          attributes: ['id', 'code', 'nom'],
        },
      ],
      order: [
        [Site, 'nom', 'ASC'],
        ['year', 'ASC'],
        ['month', 'ASC'],
      ],
    });

    if (equipmentDetails.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: `Aucune donnée trouvée pour l'équipement ${equipmentId}` 
      });
    }

    const equipment = equipmentDetails[0].Equipment;
    
    // Organiser les données par site et période
    const detailsBySite = equipmentDetails.reduce((acc, entry) => {
      const siteKey = entry.Site.code;
      const periodKey = `${entry.year}-${entry.month}`;
      
      if (!acc[siteKey]) {
        acc[siteKey] = {
          site: {
            id: entry.Site.id,
            code: entry.Site.code,
            nom: entry.Site.nom
          },
          periods: {}
        };
      }

      acc[siteKey].periods[periodKey] = {
        year: entry.year,
        month: entry.month,
        machineNeed: entry.machineNeed || 0,
        availableMachine: entry.availableMachine || 0,
        toOrder: entry.toOrder || 0,
        load: entry.load || 0
      };

      return acc;
    }, {});

    console.log(`✅ CofatGroup - Détails récupérés pour ${equipmentId}: ${Object.keys(detailsBySite).length} sites`);

    res.json({
      success: true,
      equipment,
      sites: detailsBySite,
      totalEntries: equipmentDetails.length
    });

  } catch (err) {
    console.error('❌ Erreur CofatGroup détails:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des détails', 
      details: err.message 
    });
  }
});

// GET /api/cofat-group/summary - Résumé statistique global
router.get('/summary', compatibleAuthOptional, async (req, res) => {
  try {
    console.log('📊 CofatGroup - Génération résumé statistique...');

    // Requête pour obtenir les statistiques globales
    const stats = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT e.equipmentId) as totalUniqueEquipments,
        COUNT(DISTINCT ep.siteId) as totalActiveSites,
        COUNT(*) as totalPlanningEntries,
        SUM(ep.machineNeed) as totalMachineNeed,
        SUM(ep.availableMachine) as totalAvailableMachines,
        SUM(ep.toOrder) as totalToOrder,
        AVG(ep.load) as avgLoad
      FROM EquipmentPlanning ep
      JOIN Equipment e ON ep.equipmentId = e.id
    `, { 
      type: sequelize.QueryTypes.SELECT 
    });

    // Équipements les plus présents (sur plusieurs sites)
    const topEquipments = await sequelize.query(`
      SELECT 
        e.equipmentId,
        e.nom,
        COUNT(DISTINCT ep.siteId) as siteCount,
        SUM(ep.machineNeed) as totalNeed,
        SUM(ep.availableMachine) as totalAvailable
      FROM EquipmentPlanning ep
      JOIN Equipment e ON ep.equipmentId = e.id
      GROUP BY e.equipmentId, e.nom
      HAVING COUNT(DISTINCT ep.siteId) > 1
      ORDER BY siteCount DESC, totalNeed DESC
      LIMIT 10
    `, { 
      type: sequelize.QueryTypes.SELECT 
    });

    const summary = {
      ...stats[0],
      topEquipments: topEquipments || []
    };

    console.log('✅ CofatGroup - Résumé généré:', {
      equipments: summary.totalUniqueEquipments,
      sites: summary.totalActiveSites,
      entries: summary.totalPlanningEntries
    });

    res.json({
      success: true,
      data: consolidatedHR,
      count: consolidatedHR.length,
      summary: {
        totalTypes: consolidatedHR.length,
        totalSites: await Site.count(),
        totalEntries: hrData.length
      }
    });

  } catch (err) {
    console.error('❌ Erreur CofatGroup HR:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la consolidation HR', 
      details: err.message 
    });
  }
});

module.exports = router;