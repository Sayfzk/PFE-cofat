// Script pour changer le type de la colonne area de INT à FLOAT
const sequelize = require('./db');

async function fixAreaType() {
  try {
    console.log('🔄 Modification du type de la colonne area...');
    
    // Changer le type de INTEGER à FLOAT
    await sequelize.query(`
      ALTER TABLE Spaces ALTER COLUMN area FLOAT NULL;
    `);
    
    console.log('✅ Colonne area modifiée en FLOAT avec succès!');
    console.log('🔄 Redémarrez le backend: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('');
    console.log('⚠️ Si l\'erreur persiste, exécutez ce SQL manuellement:');
    console.log('');
    console.log('ALTER TABLE Spaces ALTER COLUMN area FLOAT NULL;');
    console.log('');
    process.exit(1);
  }
}

fixAreaType();
