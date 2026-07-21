/**
 * Script de création de la table StandardInvestments_V2 via Sequelize
 * À exécuter UNE SEULE FOIS avant l'import des données
 *
 * Usage : node scripts/04_create_table_v2.js
 */
'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const StandardInvestmentV2 = sequelize.define('StandardInvestmentV2', {
  id:                     { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
  code_eq:                { type: DataTypes.STRING(100),  allowNull: true },
  operation_prefix:       { type: DataTypes.INTEGER,      allowNull: true },
  operation:              { type: DataTypes.TEXT,          allowNull: true },
  equipment_reference:    { type: DataTypes.TEXT,          allowNull: true },
  supplier_technology:    { type: DataTypes.TEXT,          allowNull: true },
  equipment_type:         { type: DataTypes.STRING(50),    allowNull: true },
  calculation_method:     { type: DataTypes.TEXT,          allowNull: true },
  daily_capacity:         { type: DataTypes.STRING(500),   allowNull: true },
  capacity_unit:          { type: DataTypes.STRING(100),   allowNull: true },
  lifetime:               { type: DataTypes.STRING(200),   allowNull: true },
  cost_euro:              { type: DataTypes.STRING(200),   allowNull: true },
  cost_mexican_peso:      { type: DataTypes.STRING(200),   allowNull: true },
  cost_brazil_real:       { type: DataTypes.STRING(200),   allowNull: true },
  workstation_dimensions: { type: DataTypes.STRING(300),   allowNull: true },
  reference_cdc:          { type: DataTypes.STRING(200),   allowNull: true },
  reference_pr:           { type: DataTypes.STRING(200),   allowNull: true },
  QTY:                    { type: DataTypes.INTEGER,        allowNull: false, defaultValue: 1 },
  row_index:              { type: DataTypes.INTEGER,        allowNull: true },
  version:                { type: DataTypes.STRING(20),     allowNull: false, defaultValue: 'v15' },
  source_file:            { type: DataTypes.STRING(500),    allowNull: true },
  import_date:            { type: DataTypes.DATE,           allowNull: false, defaultValue: DataTypes.NOW },
  is_active:              { type: DataTypes.BOOLEAN,        allowNull: false, defaultValue: true },
}, {
  tableName: 'StandardInvestments_V2',
  timestamps: true,
});

async function createTable() {
  try {
    console.log('\n🔗 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie.');

    console.log('\n🏗️  Synchronisation de la table StandardInvestments_V2...');
    // { force: false } = ne détruit PAS si la table existe déjà
    await StandardInvestmentV2.sync({ force: false, alter: false });
    console.log('✅ Table [StandardInvestments_V2] prête (créée ou déjà existante).');

    // Vérification
    const count = await StandardInvestmentV2.count();
    console.log(`   Lignes actuelles dans la table : ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur :', error.message);
    process.exit(1);
  }
}

createTable();
