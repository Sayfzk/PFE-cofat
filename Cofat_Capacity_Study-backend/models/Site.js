const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Site = sequelize.define('Site', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // ❌ Le champ 'siteId' a été supprimé car il est redondant avec 'id'.
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pays: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
  // Les champs createdAt et updatedAt sont gérés automatiquement par `timestamps: true`
}, {
  tableName: 'Sites',
  timestamps: true // ✅ Gère createdAt et updatedAt automatiquement
  // ❌ Le bloc 'hooks' a été supprimé car il est inutile.
});

module.exports = Site;