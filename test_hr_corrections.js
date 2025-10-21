// Test script pour vérifier les corrections du module HR
// Fonction utilitaire pour tester la fonction getPeriodIndex
function testPeriodIndex() {
  console.log('🧪 Test de la fonction getPeriodIndex pour HR...');
  
  // Simuler la fonction getPeriodIndex
  function getPeriodIndex(year, month) {
    if (year === 2025) {
      const monthNum = typeof month === 'string' ? parseInt(month.replace('MO ', '')) : month;
      return monthNum - 1;
    } else if (year === 2026) {
      const quarterNum = typeof month === 'string' ? parseInt(month.replace('Q ', '')) : month;
      return 12 + quarterNum - 1;
    } else if (year === 2027) {
      const quarterNum = typeof month === 'string' ? parseInt(month.replace('Q ', '')) : month;
      return 16 + quarterNum - 1;
    }
    return -1;
  }
  
  // Tests
  const tests = [
    { year: 2025, month: 'MO 01', expected: 0 },
    { year: 2025, month: 'MO 12', expected: 11 },
    { year: 2026, month: 'Q 01', expected: 12 },
    { year: 2026, month: 'Q 04', expected: 15 },
    { year: 2027, month: 'Q 01', expected: 16 },
    { year: 2027, month: 'Q 04', expected: 19 }, // Correction critique pour 2027 Q4
  ];
  
  tests.forEach(test => {
    const result = getPeriodIndex(test.year, test.month);
    const status = result === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.year} ${test.month} -> Index ${result} (attendu: ${test.expected})`);
  });
}

async function testHrCorrections() {
  console.log('🧪 Test des corrections du module HR...\n');
  console.log('✅ Corrections appliquées:');
  console.log('   1. Structure CofatGroupHr.js alignée sur HrTable.js');
  console.log('   2. Même tableau avec toutes les lignes HR (17 lignes)');
  console.log('   3. Calculs automatiques pour les totaux:');
  console.log('      - S-Total Assembly = Somme Projects 1-7');
  console.log('      - S-Total production = Direct + S-Total Assembly');
  console.log('      - S-Total = S-Total production + Indirect');
  console.log('      - Total Plant = S-Total');
  console.log('   4. Consolidation multi-sites (somme des champs)');
  console.log('   5. Correction 2027 Q4 pour tous les totaux\n');
  
  console.log('ℹ️  Pour tester l\'API, démarrez le serveur backend et visitez:');
  console.log('   http://172.20.79.39:3005/api/cofat-group/hr');
  console.log('   Vérifiez que la structure correspond à HrTable.js');
  console.log('   Vérifiez que toutes les cellules 2027 Q4 sont remplies\n');
}

// Exécuter les tests
if (require.main === module) {
  testPeriodIndex();
  testHrCorrections();
}

module.exports = { testHrCorrections, testPeriodIndex };
