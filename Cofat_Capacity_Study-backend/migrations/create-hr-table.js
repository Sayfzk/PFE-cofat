// migrations/create-hr-table.js
const sequelize = require('../db');
const HR = require('../models/HR');

async function createHRTable() {
  try {
    console.log('🔄 Création de la table HR...');
    
    // Forcer la synchronisation du modèle HR
    await HR.sync({ force: true });
    
    console.log('✅ Table HR créée avec succès!');
    console.log('📋 Structure de la table HR:');
    console.log('- id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)');
    console.log('- siteId (INTEGER, FOREIGN KEY vers Sites)');
    console.log('- type (STRING, types: Cutting area, Lead prep area, project1, project2, Production, Eng, Quality, Maintenance)');
    console.log('- category (STRING, categories: Direct, Assembly Direct, Indirect)');
    console.log('- year (INTEGER, 2025-2030)');
    console.log('- month (STRING, format: MO 01-12, Q 01-04)');
    console.log('- count (INTEGER, DEFAULT 0)');
    console.log('- createdAt, updatedAt (TIMESTAMPS)');
    console.log('📊 Index créés:');
    console.log('- unique_hr_entry (siteId, type, year, month)');
    console.log('- hr_site_index (siteId)');
    console.log('- hr_type_index (type)');
    console.log('- hr_period_index (year, month)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table HR:', error);
    process.exit(1);
  }
}

createHRTable();