// Migration pour ajouter le champ rowOrder à la table HR
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('HR', 'rowOrder', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Order of the row in the table for display purposes'
    });
    
    // Ajouter l'index
    await queryInterface.addIndex('HR', ['siteId', 'rowOrder'], {
      name: 'hr_site_order_index'
    });
    
    console.log('✅ Migration: Champ rowOrder ajouté à la table HR');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('HR', 'hr_site_order_index');
    await queryInterface.removeColumn('HR', 'rowOrder');
    console.log('✅ Migration rollback: Champ rowOrder supprimé de la table HR');
  }
};
