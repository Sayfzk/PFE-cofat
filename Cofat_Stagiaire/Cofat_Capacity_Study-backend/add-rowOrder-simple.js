// Script simple pour ajouter la colonne rowOrder à la table HR
const sequelize = require('./db');

async function addRowOrderColumn() {
  try {
    console.log('🔄 Ajout de la colonne rowOrder à la table HR...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Vérifier si la colonne existe déjà
    const tableDescription = await queryInterface.describeTable('HR');
    
    if (tableDescription.rowOrder) {
      console.log('⚠️ La colonne rowOrder existe déjà dans la table HR');
      process.exit(0);
    }
    
    // Ajouter la colonne
    await queryInterface.addColumn('HR', 'rowOrder', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
    
    console.log('✅ Colonne rowOrder ajoutée avec succès');
    
    // Ajouter l'index
    await queryInterface.addIndex('HR', ['siteId', 'rowOrder'], {
      name: 'hr_site_order_index'
    });
    
    console.log('✅ Index hr_site_order_index créé avec succès');
    
    // Mettre à jour les valeurs NULL à 0
    await sequelize.query('UPDATE HR SET rowOrder = 0 WHERE rowOrder IS NULL');
    
    console.log('✅ Migration terminée avec succès!');
    console.log('');
    console.log('🔄 Veuillez redémarrer le serveur backend maintenant.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error('');
    console.error('Si l\'erreur indique que la colonne existe déjà, c\'est normal.');
    console.error('Sinon, vous pouvez exécuter le script SQL manuellement:');
    console.error('  - Ouvrir add-rowOrder-column.sql');
    console.error('  - Exécuter dans SQL Server Management Studio');
    process.exit(1);
  }
}

addRowOrderColumn();
