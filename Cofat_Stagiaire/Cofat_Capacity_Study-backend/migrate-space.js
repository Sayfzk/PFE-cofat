// Script de migration pour ajouter category et rowOrder à Spaces
const sequelize = require('./db');

async function migrate() {
  try {
    console.log('🔄 Migration Space - Ajout de category et rowOrder...');
    
    // Ajouter category
    try {
      await sequelize.query(`
        ALTER TABLE Spaces ADD category NVARCHAR(50) NULL;
      `);
      console.log('✅ Colonne category ajoutée');
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('⚠️ Colonne category existe déjà');
      } else {
        throw err;
      }
    }
    
    // Ajouter rowOrder
    try {
      await sequelize.query(`
        ALTER TABLE Spaces ADD rowOrder INT NULL DEFAULT 0;
      `);
      console.log('✅ Colonne rowOrder ajoutée');
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('⚠️ Colonne rowOrder existe déjà');
      } else {
        throw err;
      }
    }
    
    // Créer l'index
    try {
      await sequelize.query(`
        CREATE INDEX space_site_order_index ON Spaces (siteId, rowOrder);
      `);
      console.log('✅ Index space_site_order_index créé');
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('⚠️ Index space_site_order_index existe déjà');
      } else {
        console.log('⚠️ Erreur index (peut-être déjà existant):', err.message);
      }
    }
    
    // Mettre à jour les valeurs NULL
    await sequelize.query(`
      UPDATE Spaces SET rowOrder = 0 WHERE rowOrder IS NULL;
    `);
    console.log('✅ Valeurs rowOrder initialisées');
    
    console.log('');
    console.log('✅ Migration Space terminée avec succès!');
    console.log('🔄 Redémarrez le backend: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur migration:', error.message);
    process.exit(1);
  }
}

migrate();
