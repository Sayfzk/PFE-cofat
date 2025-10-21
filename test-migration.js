// Script pour tester la migration des données 2027
const fetch = require('node-fetch');

const API_BASE_URL = 'http://172.20.79.39:3001';

async function testMigration() {
  try {
    console.log('🔄 Test de migration des données 2027...');
    
    const response = await fetch(`${API_BASE_URL}/api/equipment-planning/migrate-2027`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('📊 Résultat migration:', result);

    if (result.success) {
      console.log(`✅ Migration réussie: ${result.deletedCount} entrées supprimées`);
    } else {
      console.log('❌ Migration échouée:', result.error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testMigration();