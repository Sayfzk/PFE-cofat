const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const NonIndustrialBudget = sequelize.define('NonIndustrialBudget', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  department: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['IT', 'HR', 'QUALITY', 'BUILDING', 'LOGISTICS', 'MAINTENANCE', 'PRODUCTION']]
    }
  },
  area: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  equipment: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'USD',
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
    },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
    },
  },
  createdBy: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'NonIndustrialBudget',
  timestamps: true,
  indexes: [
    {
      fields: ['department'],
      name: 'budget_department_index'
    },
    {
      fields: ['department', 'equipment'],
      name: 'budget_dept_equipment_index'
    }
  ],
  hooks: {
    // Automatically calculate totalPrice before save
    beforeValidate: (budget) => {
      if (budget.qty && budget.unitPrice) {
        budget.totalPrice = parseFloat(budget.qty) * parseFloat(budget.unitPrice);
      }
    },
    beforeUpdate: (budget) => {
      if (budget.changed('qty') || budget.changed('unitPrice')) {
        budget.totalPrice = parseFloat(budget.qty) * parseFloat(budget.unitPrice);
      }
    }
  }
});

module.exports = NonIndustrialBudget;
