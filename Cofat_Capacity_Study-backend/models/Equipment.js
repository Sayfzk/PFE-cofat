// models/Equipment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  equipmentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  equipmentCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  referenceEquipment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Equipment',
  timestamps: true,
  // Configuration spécifique pour SQL Server
  dialectOptions: {
    options: {
      dateFirst: 1,
      useUTC: false, // Utiliser l'heure locale
    }
  },
  // Définir explicitement les noms des colonnes timestamp
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

module.exports = Equipment;