// Migration pour ajouter les champs category et rowOrder à la table Spaces
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter la colonne category
    await queryInterface.addColumn('Spaces', 'category', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Category of the space type (SPACE, Assembly, SUMMARY, etc.)'
    });
    
    console.log('✅ Colonne category ajoutée à Spaces');
    
    // Ajouter la colonne rowOrder
    await queryInterface.addColumn('Spaces', 'rowOrder', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Order of the row in the table for display purposes'
    });
    
    console.log('✅ Colonne rowOrder ajoutée à Spaces');
    
    // Ajouter l'index
    await queryInterface.addIndex('Spaces', ['siteId', 'rowOrder'], {
      name: 'space_site_order_index'
    });
    
    console.log('✅ Index space_site_order_index créé');
    console.log('✅ Migration Space terminée avec succès!');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Spaces', 'space_site_order_index');
    await queryInterface.removeColumn('Spaces', 'rowOrder');
    await queryInterface.removeColumn('Spaces', 'category');
    console.log('✅ Migration rollback: Champs category et rowOrder supprimés de Spaces');
  }
};
