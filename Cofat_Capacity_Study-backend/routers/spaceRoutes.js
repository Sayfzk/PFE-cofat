// routers/spaceRoutes.js
const express = require('express');
const router = express.Router();
const { Site, Spaces } = require('../models'); // Changé de Space à Spaces
const { compatibleAuthOptional, compatibleAuth } = require('../middlewares/compatibleAuth');
const { notifySave, notifyDelete } = require('../middlewares/notificationMiddleware');

// GET /api/space/site/:siteCode - Load data per site
router.get('/site/:siteCode', async (req, res) => {
  try {
    const { siteCode } = req.params;
    console.log(`🌐 GET /api/space/site/${siteCode} - Recherche du site...`);

    const site = await Site.findOne({ where: { code: siteCode } });
    if (!site) {
      console.log(`❌ Site non trouvé pour le code: ${siteCode}`);
      return res.status(404).json({ success: false, error: 'Site not found' });
    }

    console.log(`✅ Site trouvé: ${site.nom} (ID: ${site.id})`);

    const spaceData = await Spaces.findAll({ // Changé de Space à Spaces
      where: { siteId: site.id },
      order: [['rowOrder', 'ASC'], ['type', 'ASC'], ['year', 'ASC'], ['month', 'ASC']]
    });

    console.log(`📊 Données Space trouvées pour ${siteCode}: ${spaceData.length} entrées`);
    if (spaceData.length > 0) {
      console.log(`🔍 Aperçu des données:`, spaceData.slice(0, 3).map(item => ({ type: item.type, year: item.year, month: item.month, area: item.area })));
    }

    res.json({ success: true, data: spaceData, site: { id: site.id, code: site.code, nom: site.nom } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/space/save - Save uploaded or edited data
router.post('/save', compatibleAuth, notifySave('Space Management', (data) => {
  return `${data.summary?.processed || 0} entrées d'espace`;
}), async (req, res) => {
  try {
    const { siteCode, spaceData } = req.body;
    console.log(`💾 POST /api/space/save - Site: ${siteCode}, Entrées: ${spaceData?.length || 0}`);

    const site = await Site.findOne({ where: { code: siteCode } });
    if (!site) {
      console.log(`❌ Site non trouvé pour la sauvegarde: ${siteCode}`);
      return res.status(404).json({ success: false, error: 'Site not found' });
    }

    console.log(`✅ Sauvegarde pour le site: ${site.nom} (ID: ${site.id})`);
    console.log(`🔍 Aperçu des données à sauvegarder:`, spaceData.slice(0, 3));

    const upsertPromises = spaceData.map(entry => Spaces.upsert({ // Changé de Space à Spaces
      siteId: site.id,
      type: entry.type,
      category: entry.category || 'SPACE',
      year: entry.year,
      month: entry.month,
      area: entry.area || 0,
      rowOrder: entry.rowOrder !== undefined ? entry.rowOrder : 0
    }));

    await Promise.all(upsertPromises);
    console.log(`✅ ${spaceData.length} entrées sauvegardées avec succès pour ${siteCode}`);
    res.json({
      success: true,
      message: 'Data saved',
      spaceData: spaceData,
      summary: { processed: spaceData.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/space/delete/:siteCode - Delete all data for a site
router.delete('/delete/:siteCode', compatibleAuth, notifyDelete('Space Management', (data) => {
  return `Données Space supprimées pour 1 site`;
}), async (req, res) => {
  try {
    const { siteCode } = req.params;
    console.log(`🗑️ [DEBUG] DELETE /api/space/delete/${siteCode} - Début suppression`);

    const site = await Site.findOne({ where: { code: siteCode } });
    if (!site) {
      console.log(`❌ [DEBUG] Site non trouvé pour le code: "${siteCode}"`);
      return res.status(404).json({ success: false, error: `Site with code '${siteCode}' not found` });
    }

    console.log(`✅ [DEBUG] Site trouvé: ${site.nom} (ID: ${site.id})`);

    const deletedCount = await Spaces.destroy({
      where: { siteId: site.id }
    });

    console.log(`✅ [DEBUG] Deletion result: ${deletedCount} entrées supprimées`);

    const responseData = {
      success: true,
      message: 'Data deleted successfully',
      deletedCount: deletedCount
    };

    console.log(`📤 [DEBUG] Envoi réponse JSON:`, responseData);
    res.json(responseData);
  } catch (err) {
    console.error('🔥 [DEBUG] Delete error in spaceRoutes:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
