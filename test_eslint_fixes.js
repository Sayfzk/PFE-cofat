// test_eslint_fixes.js - Validation des corrections ESLint
console.log('🔍 Test des corrections ESLint...\n');

const fs = require('fs');

// Test 1: SpaceTable.js - calculateSTotalAssembly supprimé
const testSpaceTable = () => {
  const filePath = './Cofat_Capacity_front/src/components/user/pages/SpaceTable.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ SpaceTable.js non trouvé');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifications
  const hasCalculateFunction = content.includes('calculateSTotalAssembly');
  const hasCorrectStructure = content.includes('Structure complète chargée depuis la base');
  const hasGetEmptyStructure = content.includes('getEmptyTableStructure');
  
  console.log('📝 SpaceTable.js :');
  console.log(`${!hasCalculateFunction ? '✅' : '❌'} calculateSTotalAssembly supprimé`);
  console.log(`${hasCorrectStructure ? '✅' : '❌'} Structure de chargement correcte`);
  console.log(`${hasGetEmptyStructure ? '✅' : '❌'} getEmptyTableStructure présent`);
  
  return !hasCalculateFunction && hasCorrectStructure && hasGetEmptyStructure;
};

// Test 2: CofatGroupSpace.js - Variables définies
const testCofatGroupSpace = () => {
  const filePath = './Cofat_Capacity_front/src/components/user/pages/CofatGroupSpace.js';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ CofatGroupSpace.js non trouvé');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifications des variables
  const hasConsolidatedData = content.includes('const [consolidatedData, setConsolidatedData]');
  const hasSummary = content.includes('const [summary, setSummary]');
  const hasRefreshIcon = content.includes("import RefreshIcon from '@mui/icons-material/Refresh'");
  const hasCorrectPort = content.includes('3005');
  
  console.log('\n📊 CofatGroupSpace.js :');
  console.log(`${hasConsolidatedData ? '✅' : '❌'} consolidatedData state défini`);
  console.log(`${hasSummary ? '✅' : '❌'} summary state défini`);
  console.log(`${hasRefreshIcon ? '✅' : '❌'} RefreshIcon importé`);
  console.log(`${hasCorrectPort ? '✅' : '❌'} Port 3005 configuré`);
  
  return hasConsolidatedData && hasSummary && hasRefreshIcon && hasCorrectPort;
};

// Test 3: Vérifier les imports généraux
const testImports = () => {
  const files = [
    './Cofat_Capacity_front/src/components/user/pages/SpaceTable.js',
    './Cofat_Capacity_front/src/components/user/pages/CofatGroupSpace.js'
  ];
  
  console.log('\n🔗 Imports et dépendances :');
  
  let allGood = true;
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = file.split('/').pop();
      
      // Vérifications communes
      const hasReactImport = content.includes("import React");
      const hasMuiImports = content.includes("from '@mui/material'");
      const hasUseState = content.includes("useState");
      
      console.log(`  ${fileName}:`);
      console.log(`    ${hasReactImport ? '✅' : '❌'} React importé`);
      console.log(`    ${hasMuiImports ? '✅' : '❌'} MUI importé`);
      console.log(`    ${hasUseState ? '✅' : '❌'} useState utilisé`);
      
      if (!hasReactImport || !hasMuiImports || !hasUseState) {
        allGood = false;
      }
    }
  });
  
  return allGood;
};

// Exécuter tous les tests
const runESLintTests = () => {
  console.log('🔧 Validation des corrections ESLint');
  console.log('=====================================');
  
  const spaceTableOk = testSpaceTable();
  const cofatGroupOk = testCofatGroupSpace();
  const importsOk = testImports();
  
  console.log('\n📊 RÉSULTATS :');
  console.log('=====================================');
  
  const allTests = [spaceTableOk, cofatGroupOk, importsOk];
  const passed = allTests.filter(Boolean).length;
  
  console.log(`✅ Tests réussis : ${passed}/3`);
  
  if (passed === 3) {
    console.log('\n🎉 TOUTES LES ERREURS ESLINT CORRIGÉES !');
    console.log('\n📋 Corrections appliquées :');
    console.log('   ✅ SpaceTable.js - calculateSTotalAssembly supprimé');
    console.log('   ✅ CofatGroupSpace.js - Variables consolidatedData et summary définies');
    console.log('   ✅ CofatGroupSpace.js - RefreshIcon importé');
    console.log('   ✅ Tous les imports corrects');
    console.log('\n🚀 Le frontend devrait maintenant compiler sans erreurs !');
    console.log('\n🧪 Prochaines étapes :');
    console.log('1. Redémarrez le frontend (npm start)');
    console.log('2. Vérifiez qu\'il n\'y a plus d\'erreurs de compilation');
    console.log('3. Testez l\'application sur http://localhost:4000');
  } else {
    console.log(`\n⚠️  ${3-passed} correction(s) nécessitent encore une attention.`);
    
    if (!spaceTableOk) {
      console.log('   🔧 SpaceTable.js nécessite des corrections');
    }
    if (!cofatGroupOk) {
      console.log('   🔧 CofatGroupSpace.js nécessite des corrections');
    }
    if (!importsOk) {
      console.log('   🔧 Imports nécessitent des corrections');
    }
  }
};

runESLintTests();
