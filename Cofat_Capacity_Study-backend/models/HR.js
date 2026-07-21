const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const HR = sequelize.define('HR', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sites',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    // Types possibles: 'Cutting area', 'Lead prep area', 'project1', 'project2', 'Production', 'Eng', 'Quality', 'Maintenance'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    // Categories: 'Direct', 'Assembly Direct', 'Indirect'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2025,
      max: 2030,
    },
  },
  month: {
    type: DataTypes.STRING(10),
    allowNull: false,
    // Format: 'MO 01'-'MO 12' pour 2025, 'Q 01'-'Q 04' pour 2026/2027
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  rowOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Order of the row in the table for display purposes'
  },
}, {
  tableName: 'HR',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['siteId', 'type', 'year', 'month'],
      name: 'unique_hr_entry'
    },
    {
      fields: ['siteId'],
      name: 'hr_site_index'
    },
    {
      fields: ['type'],
      name: 'hr_type_index'
    },
    {
      fields: ['year', 'month'],
      name: 'hr_period_index'
    },
    {
      fields: ['siteId', 'rowOrder'],
      name: 'hr_site_order_index'
    }
  ]
});

module.exports = HR;