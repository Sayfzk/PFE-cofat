// Script pour augmenter la taille de la colonne category de 50 à 150 caractères
const sequelize = require('./db');

async function fixCategoryLength() {
  try {
    console.log('🔄 Modification de la taille de la colonne category...');
    
    // Augmenter la taille de VARCHAR(50) à VARCHAR(150)
    await sequelize.query(`
      ALTER TABLE Spaces ALTER COLUMN category NVARCHAR(150) NULL;
    `);
    
    console.log('✅ Colonne category modifiée en NVARCHAR(150) avec succès!');
    console.log('');
    console.log('🔄 Redémarrez le backend: npm start');
    console.log('');
    console.log('✅ Vous pouvez maintenant sauvegarder des catégories longues comme:');
    console.log('   "OTHERS (WAREHOUSE, OFFICE + GOODS AISLE, ETC.)"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('');
    console.log('⚠️ Si l\'erreur persiste, exécutez ce SQL manuellement:');
    console.log('');
    console.log('ALTER TABLE Spaces ALTER COLUMN category NVARCHAR(150) NULL;');
    console.log('');
    process.exit(1);
  }
}

fixCategoryLength();
