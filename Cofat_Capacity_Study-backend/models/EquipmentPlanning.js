const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const EquipmentPlanning = sequelize.define('EquipmentPlanning', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  machineNeed: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  availableMachine: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  toOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  load: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sites',  // Doit correspondre exactement au nom de table
      key: 'id'
    }
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Equipment',
      key: 'id'
    }
  }
}, {
  tableName: 'EquipmentPlanning',
  timestamps: false, // Disable createdAt and updatedAt
  dialectOptions: {
    useUTC: false,
    dateStrings: true
  },
  indexes: [  // Add this to enforce the unique constraint
    {
      unique: true,
      fields: ['siteId', 'equipmentId', 'year', 'month'],
      name: 'unique_planning_entry'  // Name for the index/constraint
    }
  ]
});

module.exports = EquipmentPlanning;