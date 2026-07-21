// routers/hrRoutes.js
const express = require('express');
const router = express.Router();
const { Site, HR } = require('../models');
const { compatibleAuthOptional, compatibleAuth } = require('../middlewares/compatibleAuth');
const { notifySave, notifyDelete } = require('../middlewares/notificationMiddleware');

// GET /api/hr/site/:siteCode - Load HR data per site
router.get('/site/:siteCode', async (req, res) => {
  try {
    const { siteCode } = req.params;
    console.log(`🌐 GET /api/hr/site/${siteCode} - Recherche du site HR...`);
    
    const site = await Site.findOne({ where: { code: siteCode } });
    if (!site) {
      console.log(`❌ Site non trouvé pour le code HR: ${siteCode}`);
      return res.status(404).json({ success: false, error: 'Site not found' });
    }
    
    console.log(`✅ Site HR trouvé: ${site.nom} (ID: ${site.id})`);

    const hrData = await HR.findAll({
      where: { siteId: site.id },
      order: [['rowOrder', 'ASC'], ['type', 'ASC'], ['year', 'ASC'], ['month', 'ASC']]
    });
    
    console.log(`📊 Données HR trouvées pour ${siteCode}: ${hrData.length} entrées`);
    if (hrData.length > 0) {
      console.log(`🔍 Aperçu des données HR:`, hrData.slice(0, 3).map(item => ({ type: item.type, year: item.year, month: item.month, count: item.count })));
    }

    res.json({ success: true, data: hrData, site: { id: site.id, code: site.code, nom: site.nom } });
  } catch (err) {
    console.error('Erreur HR GET:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/hr/save - Save uploaded or edited HR data
router.post('/save', compatibleAuth, notifySave('HR Management', (data) => {
  return `${data.summary?.processed || 0} entrées HR`;
}), async (req, res) => {
  try {
    const { siteCode, hrData } = req.body;
    console.log(`💾 POST /api/hr/save - Site: ${siteCode}, Entrées: ${hrData?.length || 0}`);
    
    const site = await Site.findOne({ where: { code: siteCode } });
    if (!site) {
      console.log(`❌ Site non trouvé pour la sauvegarde HR: ${siteCode}`);
      return res.status(404).json({ success: false, error: 'Site not found' });
    }
    
    console.log(`✅ Sauvegarde HR pour le site: ${site.nom} (ID: ${site.id})`);
    console.log(`🔍 Aperçu des données HR à sauvegarder:`, hrData.slice(0, 3));

    // Traiter toutes les entrées avec leur ordre
    const upsertPromises = hrData.map(entry => HR.upsert({
      siteId: site.id,
      type: entry.type,
      category: entry.category || 'HR', // Catégorie par défaut si non spécifiée
      year: entry.year,
      month: entry.month,
      count: entry.count || 0,
      rowOrder: entry.rowOrder !== undefined ? entry.rowOrder : 0 // Préserver l'ordre
    }));

    await Promise.all(upsertPromises);
    console.log(`✅ ${hrData.length} entrées HR sauvegardées avec succès pour ${siteCode}`);
    
    res.json({ 
      success: true, 
      message: 'HR data saved successfully',
      hrData: hrData,
      summary: { processed: hrData.length }
    });
  } catch (err) {
    console.error('Erreur HR save:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/hr/delete/:siteCode - Delete all HR data for a site
router.delete('/delete/:siteCode', compatibleAuth, notifyDelete('HR Management', (data) => {
  return `Données HR supprimées pour 1 site`;
}), async (req, res) => {
  try {
    const { siteCode } = req.params;
    console.log(`🗑️ DELETE /api/hr/delete/${siteCode} - Suppression des données HR...`);
    
    const site = await Site.findOne({ where: { code: siteCode } });
    if (!site) {
      console.log(`❌ Site non trouvé pour la suppression HR: ${siteCode}`);
      return res.status(404).json({ success: false, error: 'Site not found' });
    }
    
    console.log(`✅ Suppression HR pour le site: ${site.nom} (ID: ${site.id})`);

    const deletedCount = await HR.destroy({
      where: { siteId: site.id }
    });

    console.log(`✅ ${deletedCount} entrées HR supprimées avec succès pour ${siteCode}`);
    res.json({ 
      success: true, 
      message: 'HR data deleted successfully',
      deletedCount: deletedCount
    });
  } catch (err) {
    console.error('Delete HR error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;