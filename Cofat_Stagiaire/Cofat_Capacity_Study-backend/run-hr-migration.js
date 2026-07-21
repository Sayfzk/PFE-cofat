// Script pour exécuter la migration HR rowOrder
const sequelize = require('./db');
const migration = require('./migrations/add-rowOrder-to-hr');

async function runMigration() {
  try {
    console.log('🔄 Démarrage de la migration HR rowOrder...');
    
    // Exécuter la migration
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Migration HR rowOrder terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

runMigration();
