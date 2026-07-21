// Script simple pour ajouter les colonnes category et rowOrder à la table Spaces
const sequelize = require('./db');

async function addSpaceColumns() {
  try {
    console.log('🔄 Ajout des colonnes category et rowOrder à la table Spaces...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Vérifier si les colonnes existent déjà
    const tableDescription = await queryInterface.describeTable('Spaces');
    
    // Ajouter category si elle n'existe pas
    if (!tableDescription.category) {
      await queryInterface.addColumn('Spaces', 'category', {
        type: sequelize.Sequelize.STRING(50),
        allowNull: true
      });
      console.log('✅ Colonne category ajoutée avec succès');
    } else {
      console.log('⚠️ La colonne category existe déjà dans la table Spaces');
    }
    
    // Ajouter rowOrder si elle n'existe pas
    if (!tableDescription.rowOrder) {
      await queryInterface.addColumn('Spaces', 'rowOrder', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
      console.log('✅ Colonne rowOrder ajoutée avec succès');
      
      // Ajouter l'index
      await queryInterface.addIndex('Spaces', ['siteId', 'rowOrder'], {
        name: 'space_site_order_index'
      });
      console.log('✅ Index space_site_order_index créé avec succès');
      
      // Mettre à jour les valeurs NULL à 0
      await sequelize.query('UPDATE Spaces SET rowOrder = 0 WHERE rowOrder IS NULL');
      console.log('✅ Valeurs rowOrder initialisées');
    } else {
      console.log('⚠️ La colonne rowOrder existe déjà dans la table Spaces');
    }
    
    console.log('✅ Migration Space terminée avec succès!');
    console.log('');
    console.log('🔄 Veuillez redémarrer le serveur backend maintenant.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration Space:', error.message);
    console.error('');
    console.error('Si l\'erreur indique que les colonnes existent déjà, c\'est normal.');
    console.error('Sinon, vous pouvez exécuter le script SQL manuellement.');
    process.exit(1);
  }
}

addSpaceColumns();
