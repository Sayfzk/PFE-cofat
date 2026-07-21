const express = require('express');
const router = express.Router();
const { Site, Equipment, EquipmentPlanning } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../db');

// Middleware pour vérifier le rôle Admin
const requireSuperAdmin = (req, res, next) => {
  // Pour l'instant, on vérifie dans le body ou header
  const userRole = req.body.role || req.headers['x-user-role'];

  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé. Ce tableau de bord est réservé aux administrateurs.'
    });
  }

  next();
};

// GET /api/dashboard/admin - Récupérer toutes les métriques du dashboard
router.get('/admin', requireSuperAdmin, async (req, res) => {
  try {
    console.log('🔍 Génération du dashboard admin...');

    // 1. Récupérer toutes les données de planification avec les relations
    const planningData = await EquipmentPlanning.findAll({
      include: [
        {
          model: Equipment,
          attributes: ['id', 'equipmentId', 'nom', 'equipmentCode']
        },
        {
          model: Site,
          attributes: ['id', 'code', 'nom']
        }
      ],
      order: [['year', 'ASC'], ['month', 'ASC']]
    });

    console.log(`📊 ${planningData.length} entrées de planification trouvées`);

    // 2. Calculer les métriques globales
    const metrics = planningData.reduce((acc, entry) => {
      acc.totalMachineNeed += entry.machineNeed || 0;
      acc.totalAvailable += entry.availableMachine || 0;
      acc.totalToOrder += entry.toOrder || 0;
      acc.totalEntries += 1;
      return acc;
    }, {
      totalMachineNeed: 0,
      totalAvailable: 0,
      totalToOrder: 0,
      totalEntries: 0
    });

    // Calculer le taux d'utilisation
    metrics.utilizationRate = metrics.totalMachineNeed > 0
      ? ((metrics.totalAvailable / metrics.totalMachineNeed) * 100).toFixed(2)
      : 0;

    // 3. Grouper par équipement
    const equipmentGroups = {};

    planningData.forEach(entry => {
      if (!entry.Equipment) return;

      const equipmentName = entry.Equipment.nom;
      const siteCode = entry.Site?.code || 'Unknown';
      const siteName = entry.Site?.nom || 'Site Inconnu';

      if (!equipmentGroups[equipmentName]) {
        equipmentGroups[equipmentName] = {
          equipment_name: equipmentName,
          sites: {},
          total_machine_need: 0,
          total_available: 0,
          total_to_order: 0,
          site_count: 0
        };
      }

      if (!equipmentGroups[equipmentName].sites[siteCode]) {
        equipmentGroups[equipmentName].sites[siteCode] = {
          site_name: siteName,
          entries: [],
          site_total_need: 0,
          site_total_available: 0,
          site_total_to_order: 0
        };
        equipmentGroups[equipmentName].site_count += 1;
      }

      // Ajouter l'entrée
      const entryData = {
        machine_need: entry.machineNeed || 0,
        available_machine: entry.availableMachine || 0,
        to_order: entry.toOrder || 0,
        load_occupation: entry.load || 0,
        year: entry.year,
        month: entry.month
      };

      equipmentGroups[equipmentName].sites[siteCode].entries.push(entryData);

      // Mettre à jour les totaux
      equipmentGroups[equipmentName].sites[siteCode].site_total_need += entryData.machine_need;
      equipmentGroups[equipmentName].sites[siteCode].site_total_available += entryData.available_machine;
      equipmentGroups[equipmentName].sites[siteCode].site_total_to_order += entryData.to_order;

      equipmentGroups[equipmentName].total_machine_need += entryData.machine_need;
      equipmentGroups[equipmentName].total_available += entryData.available_machine;
      equipmentGroups[equipmentName].total_to_order += entryData.to_order;
    });

    // 4. Préparer les données pour les graphiques
    const equipmentDistribution = Object.values(equipmentGroups).map(group => ({
      label: group.equipment_name,
      value: group.total_machine_need,
      available: group.total_available,
      to_order: group.total_to_order,
      sites: group.site_count
    })).sort((a, b) => b.value - a.value);

    // 5. Comparaison par sites
    const siteStats = {};

    planningData.forEach(entry => {
      const siteCode = entry.Site?.code || 'Unknown';
      const siteName = entry.Site?.nom || 'Site Inconnu';

      if (!siteStats[siteCode]) {
        siteStats[siteCode] = {
          site_name: siteName,
          equipment_count: 0,
          total_need: 0,
          total_available: 0,
          total_to_order: 0,
          equipment_types: new Set()
        };
      }

      siteStats[siteCode].equipment_count += 1;
      siteStats[siteCode].total_need += entry.machineNeed || 0;
      siteStats[siteCode].total_available += entry.availableMachine || 0;
      siteStats[siteCode].total_to_order += entry.toOrder || 0;

      if (entry.Equipment) {
        siteStats[siteCode].equipment_types.add(entry.Equipment.nom);
      }
    });

    // Convertir Set en nombre
    Object.values(siteStats).forEach(site => {
      site.equipment_types = site.equipment_types.size;
    });

    const siteComparison = Object.entries(siteStats).map(([code, data]) => ({
      label: data.site_name,
      need: data.total_need,
      available: data.total_available,
      to_order: data.total_to_order,
      equipment_types: data.equipment_types
    }));

    // 6. Tendances mensuelles
    const monthlyTrends = {};

    planningData.forEach(entry => {
      const period = `${entry.year}-${entry.month}`;

      if (!monthlyTrends[period]) {
        monthlyTrends[period] = {
          period,
          total_need: 0,
          total_available: 0,
          total_to_order: 0,
          equipment_entries: 0
        };
      }

      monthlyTrends[period].total_need += entry.machineNeed || 0;
      monthlyTrends[period].total_available += entry.availableMachine || 0;
      monthlyTrends[period].total_to_order += entry.toOrder || 0;
      monthlyTrends[period].equipment_entries += 1;
    });

    const sortedTrends = Object.values(monthlyTrends).sort((a, b) => a.period.localeCompare(b.period));

    // 7. Statistiques par année
    const yearStats = {};
    planningData.forEach(entry => {
      const year = entry.year;
      if (!yearStats[year]) {
        yearStats[year] = { count: 0, need: 0, available: 0, toOrder: 0 };
      }
      yearStats[year].count += 1;
      yearStats[year].need += entry.machineNeed || 0;
      yearStats[year].available += entry.availableMachine || 0;
      yearStats[year].toOrder += entry.toOrder || 0;
    });

    console.log('✅ Dashboard généré avec succès');
    console.log('📈 Métriques globales:', metrics);
    console.log('🏭 Nombre d\'équipements uniques:', Object.keys(equipmentGroups).length);
    console.log('📍 Nombre de sites:', Object.keys(siteStats).length);

    res.json({
      success: true,
      data: {
        // Métriques principales
        global_metrics: metrics,

        // Données des graphiques
        equipment_distribution: equipmentDistribution,
        site_comparison: siteComparison,
        monthly_trends: sortedTrends,

        // Données détaillées
        equipment_groups: Object.values(equipmentGroups),
        site_statistics: Object.values(siteStats),
        year_statistics: yearStats,

        // Métadonnées
        generated_at: new Date().toISOString(),
        total_records: planningData.length,
        unique_equipments: Object.keys(equipmentGroups).length,
        unique_sites: Object.keys(siteStats).length
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la génération du dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du dashboard',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/dashboard/admin/summary - Version simplifiée du dashboard
router.get('/admin/summary', requireSuperAdmin, async (req, res) => {
  try {
    // Métriques rapides
    const [totalEquipments, totalSites, totalPlanningEntries] = await Promise.all([
      Equipment.count(),
      Site.count(),
      EquipmentPlanning.count()
    ]);

    // Totaux rapides
    const totals = await EquipmentPlanning.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('machineNeed')), 'totalNeed'],
        [sequelize.fn('SUM', sequelize.col('availableMachine')), 'totalAvailable'],
        [sequelize.fn('SUM', sequelize.col('toOrder')), 'totalToOrder']
      ]
    });

    const summary = {
      equipments: totalEquipments,
      sites: totalSites,
      planning_entries: totalPlanningEntries,
      total_need: parseInt(totals[0]?.dataValues?.totalNeed || 0),
      total_available: parseInt(totals[0]?.dataValues?.totalAvailable || 0),
      total_to_order: parseInt(totals[0]?.dataValues?.totalToOrder || 0)
    };

    summary.utilization_rate = summary.total_need > 0
      ? ((summary.total_available / summary.total_need) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ Erreur lors du résumé dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du résumé',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;