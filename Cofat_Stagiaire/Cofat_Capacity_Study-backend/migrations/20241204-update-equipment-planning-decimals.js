// Migration pour permettre des valeurs décimales dans EquipmentPlanning
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('EquipmentPlanning', 'machineNeed', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
      comment: 'Machine need peut contenir des décimales'
    });

    await queryInterface.changeColumn('EquipmentPlanning', 'availableMachine', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
      comment: 'Available machine peut contenir des décimales'
    });

    await queryInterface.changeColumn('EquipmentPlanning', 'toOrder', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
      comment: 'To order peut contenir des décimales'
    });

    await queryInterface.changeColumn('EquipmentPlanning', 'load', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
      comment: 'Load (Occupation) reste en décimal'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('EquipmentPlanning', 'machineNeed', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('EquipmentPlanning', 'availableMachine', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('EquipmentPlanning', 'toOrder', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('EquipmentPlanning', 'load', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0
    });
  }
};
