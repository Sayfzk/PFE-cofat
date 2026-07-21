// Migration pour ajouter la colonne QTY à la table Investments (StandardEquipment)
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Investments', 'QTY', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'Quantité d\'équipements'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Investments', 'QTY');
  }
};
