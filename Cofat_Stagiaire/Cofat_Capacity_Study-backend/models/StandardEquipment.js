const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const StandardEquipment = sequelize.define('StandardEquipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Code_Eq: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'Code_Eq'
  },
  Operations: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Operations'
  },
  Equipment_Reference: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'Equipment_Reference'
  },
  Supplier_Technology: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'Supplier_Technology'
  },
  Type: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'Type'
  },
  Calculation_Method: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    field: 'Calculation_Method'
  },
  Daily_Capacity: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'Daily_Capacity'
  },
  Equipment_Lifespan: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'Equipment_Lifespan'
  },
  Estimated_Cost_EUR: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'Estimated_Cost_EUR'
  },
  Workstation_Dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'Workstation_Dimensions'
  },
  Reference_CDC: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'Reference_CDC'
  },
  Reference_PR: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'Reference_PR'
  },
  QTY: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    field: 'QTY'
  }
}, {
  tableName: 'Investments', // Nom de votre table dans la base de données
  timestamps: false, // Si vous n'avez pas de colonnes createdAt/updatedAt
  freezeTableName: true // Pour éviter que Sequelize pluralise le nom de table
});

module.exports = StandardEquipment;