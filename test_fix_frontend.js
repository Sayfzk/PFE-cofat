// test_fix_frontend.js - Test de la correction frontend
console.log('🔧 Test de la correction frontend...\n');

const fs = require('fs');

// Test 1: Vérifier que le fichier CofatGroupHr.js existe (pas CofatGroupHR.js)
const testFileRename = () => {
  const newFile = './Cofat_Capacity_front/src/components/user/pages/CofatGroupHr.js';
  const oldFile = './Cofat_Capacity_front/src/components/user/pages/CofatGroupHR.js';
  
  const newExists = fs.existsSync(newFile);
  const oldExists = fs.existsSync(oldFile);
  
  console.log('📁 Test du renommage de fichier :');
  console.log(`${newExists ? '✅' : '❌'} CofatGroupHr.js existe`);
  console.log(`${!oldExists ? '✅' : '❌'} CofatGroupHR.js supprimé`);
  
  return newExists && !oldExists;
};

// Test 2: Vérifier les imports dans App.js
const testAppImports = () => {
  const appPath = './Cofat_Capacity_front/src/App.js';
  
  if (!fs.existsSync(appPath)) {
    console.log('❌ App.js non trouvé');
    return false;
  }
  
  const content = fs.readFileSync(appPath, 'utf8');
  
  const hasCorrectImport = content.includes("import CofatGroupHr from './components/user/pages/CofatGroupHr';");
  const hasCorrectUsage = content.includes('<CofatGroupHr />');
  const hasNoOldImport = !content.includes('CofatGroupHR');
  
  console.log('\\n📦 Test des imports App.js :');
  console.log(`${hasCorrectImport ? '✅' : '❌'} Import correct: CofatGroupHr`);
  console.log(`${hasCorrectUsage ? '✅' : '❌'} Usage correct: <CofatGroupHr />`);
  console.log(`${hasNoOldImport ? '✅' : '❌'} Pas d'ancien import CofatGroupHR`);
  
  return hasCorrectImport && hasCorrectUsage && hasNoOldImport;
};

// Test 3: Vérifier l'export du composant
const testComponentExport = () => {
  const componentPath = './Cofat_Capacity_front/src/components/user/pages/CofatGroupHr.js';
  
  if (!fs.existsSync(componentPath)) {
    console.log('❌ CofatGroupHr.js non trouvé');
    return false;
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  const hasComponentDeclaration = content.includes('const CofatGroupHr = () => {');
  const hasCorrectExport = content.includes('export default CofatGroupHr;');
  const hasReactImport = content.includes('import React');
  
  console.log('\\n🧩 Test du composant CofatGroupHr :');
  console.log(`${hasComponentDeclaration ? '✅' : '❌'} Déclaration: const CofatGroupHr = () => {`);
  console.log(`${hasCorrectExport ? '✅' : '❌'} Export: export default CofatGroupHr;`);
  console.log(`${hasReactImport ? '✅' : '❌'} Import React`);
  
  return hasComponentDeclaration && hasCorrectExport && hasReactImport;
};

// Exécuter tous les tests
const runFixTests = () => {
  console.log('🔧 Test des corrections frontend');
  console.log('=====================================');
  
  const fileOk = testFileRename();
  const appOk = testAppImports();
  const componentOk = testComponentExport();
  
  console.log('\\n📊 RÉSULTATS :');
  console.log('=====================================');
  
  const allTests = [fileOk, appOk, componentOk];
  const passed = allTests.filter(Boolean).length;
  
  console.log(`✅ Tests réussis : ${passed}/3`);
  
  if (passed === 3) {
    console.log('\\n🎉 TOUTES LES CORRECTIONS APPLIQUÉES !');
    console.log('\\n📋 Corrections effectuées :');
    console.log('   ✅ Fichier renommé: CofatGroupHR.js → CofatGroupHr.js');
    console.log('   ✅ Import corrigé dans App.js: CofatGroupHR → CofatGroupHr');
    console.log('   ✅ Usage corrigé: <CofatGroupHR /> → <CofatGroupHr />');
    console.log('   ✅ Export correct: export default CofatGroupHr;');
    console.log('\\n🚀 La page blanche devrait être résolue !');
    console.log('\\n🧪 Prochaines étapes :');
    console.log('1. Redémarrez le frontend (Ctrl+C puis npm start)');
    console.log('2. Ouvrez http://localhost:4000');
    console.log('3. Connectez-vous et testez l\\'application');
    console.log('4. Testez CofatGroup → Space et HR');
  } else {
    console.log(`\\n⚠️  ${3-passed} correction(s) nécessitent encore une attention.`);
    
    if (!fileOk) {
      console.log('   🔧 Renommage de fichier nécessaire');
    }
    if (!appOk) {
      console.log('   🔧 Imports App.js nécessitent des corrections');
    }
    if (!componentOk) {
      console.log('   🔧 Composant CofatGroupHr nécessite des corrections');
    }
  }
};

runFixTests();
