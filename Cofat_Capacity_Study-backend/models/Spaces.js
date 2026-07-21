// models/Space.js (mise à jour pour inclure 'type' pour les lignes dynamiques)
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Space = sequelize.define('Space', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Category of the space type (SPACE, Assembly, SUMMARY, etc.)'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  area: {  // Valeur principale pour 'space need' ou 'area' par type/period
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  rowOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Order of the row in the table for display purposes'
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sites',
      key: 'id'
    }
  }
}, {
  tableName: 'Spaces',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['siteId', 'type', 'year', 'month']
    },
    {
      fields: ['siteId', 'rowOrder'],
      name: 'space_site_order_index'
    }
  ]
});

module.exports = Space;