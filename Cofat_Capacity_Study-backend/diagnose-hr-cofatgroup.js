/**
 * Diagnostic: Vérifier les données HR par site
 * node diagnose-hr-cofatgroup.js
 */
const sequelize = require('./db');
const { Site, HR } = require('./models');

async function diagnose() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    const sites = await Site.findAll({ order: [['nom', 'ASC']] });
    console.log('=== SITES EN BASE ===');
    sites.forEach(s => console.log(`  [${s.code}] ${s.nom} (id=${s.id}, actif: ${s.actif})`));

    console.log('\n=== NOMBRE D\'ENTREES HR PAR SITE ===');
    for (const site of sites) {
      // FIX: Use siteId instead of siteCode
      const count = await HR.count({ where: { siteId: site.id } });
      console.log(`  ${site.nom} (${site.code}, id=${site.id}): ${count} entrées HR`);
    }

    const nogalesSite = sites.find(s => s.nom === 'Nogales' || s.code === 'NOG');
    if (nogalesSite) {
      const nogalesData = await HR.findAll({ where: { siteId: nogalesSite.id }, limit: 5 });
      console.log(`\n=== DONNÉES HR NOGALES (id=${nogalesSite.id}, code=${nogalesSite.code}) ===`);
      if (nogalesData.length === 0) {
        console.log('  ✅ AUCUNE donnée HR pour Nogales — correct, rien n\'a été importé.');
      } else {
        console.log(`  ⚠️  ${nogalesData.length} entrées trouvées (inattendu):`);
        nogalesData.forEach(d => console.log(`     ${JSON.stringify(d.toJSON())}`));
      }
    }

    console.log('\n=== TOTAUX GLOBAUX HR ===');
    const totalCount = await HR.count();
    console.log(`  Total entrées HR en base: ${totalCount}`);

    const hrSample = await HR.findAll({
      include: [{ model: Site, attributes: ['nom', 'code'] }],
      limit: 10,
      order: [['siteId', 'ASC'], ['year', 'ASC'], ['month', 'ASC']],
    });

    if (hrSample.length > 0) {
      console.log('\n=== ÉCHANTILLON HR (10 premières entrées) ===');
      hrSample.forEach(entry => {
        const site = entry.Site ? entry.Site.nom : '???';
        console.log(`  [${site}] ${entry.year}-${entry.month} | type="${entry.type}" | categ="${entry.category}" | count=${entry.count}`);
      });
    }

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Connexion fermée.');
  }
}

diagnose();
