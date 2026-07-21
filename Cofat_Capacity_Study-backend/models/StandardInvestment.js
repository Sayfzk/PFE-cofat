const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const StandardInvestment = sequelize.define('StandardInvestment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code_eq: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    operation: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    operation_code: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    equipment_reference: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    supplier_technology: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    equipment_type: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    calculation_method: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    daily_capacity: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    lifetime: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    cost_euro: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    cost_brazil_real: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    cost_mexican_peso: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    workstation_dimensions: {
        type: DataTypes.STRING(4000),
        allowNull: true,
    },
    reference_cdc: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    reference_pr: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    row_index: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    QTY: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    }
}, {
    tableName: 'StandardInvestments',
    timestamps: true,
});

module.exports = StandardInvestment;
