// test_frontend_errors.js - Diagnostic des erreurs frontend
console.log('🔍 Diagnostic des erreurs frontend...\n');

const fs = require('fs');

// Test 1: Vérifier les exports des composants CofatGroup
const testCofatGroupExports = () => {
  const files = [
    {
      path: './Cofat_Capacity_front/src/components/user/pages/CofatGroupSpace.js',
      expectedComponent: 'CofatGroupSpace'
    },
    {
      path: './Cofat_Capacity_front/src/components/user/pages/CofatGroupHr.js',
      expectedComponent: 'CofatGroupHr'
    }
  ];
  
  console.log('📊 Test des exports CofatGroup :');
  let allGood = true;
  
  files.forEach(({ path, expectedComponent }) => {
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, 'utf8');
      const fileName = path.split('/').pop();
      
      // Vérifier la déclaration du composant
      const hasComponentDeclaration = content.includes(`const ${expectedComponent} = () => {`);
      
      // Vérifier l'export
      const hasCorrectExport = content.includes(`export default ${expectedComponent};`);
      
      // Vérifier les imports
      const hasReactImport = content.includes("import React");
      const hasMuiImports = content.includes("from '@mui/material'");
      
      // Vérifier la syntaxe de base
      const hasMatchingBraces = (content.match(/{/g) || []).length === (content.match(/}/g) || []).length;
      const hasMatchingParens = (content.match(/\\(/g) || []).length === (content.match(/\\)/g) || []).length;
      
      console.log(`  ${fileName}:`);
      console.log(`    ${hasComponentDeclaration ? '✅' : '❌'} Déclaration composant: const ${expectedComponent} = () => {`);
      console.log(`    ${hasCorrectExport ? '✅' : '❌'} Export correct: export default ${expectedComponent};`);
      console.log(`    ${hasReactImport ? '✅' : '❌'} Import React`);
      console.log(`    ${hasMuiImports ? '✅' : '❌'} Import MUI`);
      console.log(`    ${hasMatchingBraces ? '✅' : '❌'} Accolades équilibrées`);
      console.log(`    ${hasMatchingParens ? '✅' : '❌'} Parenthèses équilibrées`);
      
      if (!hasComponentDeclaration || !hasCorrectExport || !hasReactImport || !hasMuiImports || !hasMatchingBraces || !hasMatchingParens) {
        allGood = false;
      }
    } else {
      console.log(`  ❌ ${path.split('/').pop()} non trouvé`);
      allGood = false;
    }
  });
  
  return allGood;
};

// Test 2: Vérifier les imports dans les routes/navigation
const testRouteImports = () => {
  const routeFiles = [
    './Cofat_Capacity_front/src/App.js',
    './Cofat_Capacity_front/src/components/user/pages/Sidebar.js'
  ];
  
  console.log('\\n🔗 Test des imports dans les routes :');
  let allGood = true;
  
  routeFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = file.split('/').pop();
      
      // Vérifier les imports CofatGroup
      const hasCofatGroupSpaceImport = content.includes('CofatGroupSpace') || !content.includes('cofat-group');
      const hasCofatGroupHrImport = content.includes('CofatGroupHr') || !content.includes('cofat-group');
      
      console.log(`  ${fileName}:`);
      console.log(`    ${hasCofatGroupSpaceImport ? '✅' : '❌'} Import CofatGroupSpace correct`);
      console.log(`    ${hasCofatGroupHrImport ? '✅' : '❌'} Import CofatGroupHr correct`);
      
      if (!hasCofatGroupSpaceImport || !hasCofatGroupHrImport) {
        allGood = false;
      }
    } else {
      console.log(`  ❌ ${file.split('/').pop()} non trouvé`);
    }
  });
  
  return allGood;
};

// Test 3: Vérifier la syntaxe JavaScript de base
const testJavaScriptSyntax = () => {
  const jsFiles = [
    './Cofat_Capacity_front/src/components/user/pages/CofatGroupSpace.js',
    './Cofat_Capacity_front/src/components/user/pages/CofatGroupHr.js',
    './Cofat_Capacity_front/src/components/user/pages/SpaceTable.js'
  ];
  
  console.log('\\n🔧 Test de la syntaxe JavaScript :');
  let allGood = true;
  
  jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = file.split('/').pop();
      
      // Tests de syntaxe de base
      const hasNoMissingSemicolons = !content.includes('} finally {\\n      setLoading(false);\\n    }\\n\\n  useEffect');
      const hasNoUnclosedStrings = !content.includes("'") || content.split("'").length % 2 === 1;
      const hasNoUnclosedFunctions = !content.includes('const ') || content.includes('};');
      
      console.log(`  ${fileName}:`);
      console.log(`    ${hasNoMissingSemicolons ? '✅' : '❌'} Pas de points-virgules manquants`);
      console.log(`    ${hasNoUnclosedStrings ? '✅' : '❌'} Chaînes correctement fermées`);
      console.log(`    ${hasNoUnclosedFunctions ? '✅' : '❌'} Fonctions correctement fermées`);
      
      if (!hasNoMissingSemicolons || !hasNoUnclosedStrings || !hasNoUnclosedFunctions) {
        allGood = false;
      }
    }
  });
  
  return allGood;
};

// Test 4: Vérifier les dépendances package.json
const testPackageDependencies = () => {
  const packagePath = './Cofat_Capacity_front/package.json';
  
  console.log('\\n📦 Test des dépendances package.json :');
  
  if (fs.existsSync(packagePath)) {
    const content = fs.readFileSync(packagePath, 'utf8');
    
    try {
      const packageJson = JSON.parse(content);
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const requiredDeps = ['react', '@mui/material', 'react-i18next'];
      let allDepsOk = true;
      
      requiredDeps.forEach(dep => {
        const hasDepency = deps[dep];
        console.log(`  ${hasDepency ? '✅' : '❌'} ${dep}: ${deps[dep] || 'manquant'}`);
        if (!hasDepency) allDepsOk = false;
      });
      
      return allDepsOk;
    } catch (e) {
      console.log('  ❌ Erreur parsing package.json');
      return false;
    }
  } else {
    console.log('  ❌ package.json non trouvé');
    return false;
  }
};

// Exécuter tous les tests
const runFrontendDiagnostic = () => {
  console.log('🔧 Diagnostic des erreurs frontend');
  console.log('=====================================');
  
  const exportsOk = testCofatGroupExports();
  const routesOk = testRouteImports();
  const syntaxOk = testJavaScriptSyntax();
  const depsOk = testPackageDependencies();
  
  console.log('\\n📊 RÉSULTATS DU DIAGNOSTIC :');
  console.log('=====================================');
  
  const allTests = [exportsOk, routesOk, syntaxOk, depsOk];
  const passed = allTests.filter(Boolean).length;
  
  console.log(`✅ Tests réussis : ${passed}/4`);
  
  if (passed === 4) {
    console.log('\\n🎉 AUCUNE ERREUR DÉTECTÉE !');
    console.log('\\n📋 Composants validés :');
    console.log('   ✅ CofatGroupSpace.js - Export correct');
    console.log('   ✅ CofatGroupHr.js - Export correct');
    console.log('   ✅ Imports dans les routes - OK');
    console.log('   ✅ Syntaxe JavaScript - OK');
    console.log('   ✅ Dépendances package.json - OK');
    console.log('\\n🚀 Solutions possibles pour la page blanche :');
    console.log('1. Redémarrez le frontend (Ctrl+C puis npm start)');
    console.log('2. Videz le cache navigateur (Ctrl+F5)');
    console.log('3. Vérifiez la console navigateur (F12) pour d\\'autres erreurs');
    console.log('4. Vérifiez que le backend fonctionne sur port 3005');
  } else {
    console.log(`\\n⚠️  ${4-passed} problème(s) détecté(s).`);
    
    if (!exportsOk) {
      console.log('   🔧 Exports CofatGroup nécessitent des corrections');
    }
    if (!routesOk) {
      console.log('   🔧 Imports dans les routes nécessitent des corrections');
    }
    if (!syntaxOk) {
      console.log('   🔧 Syntaxe JavaScript nécessite des corrections');
    }
    if (!depsOk) {
      console.log('   🔧 Dépendances package.json nécessitent des corrections');
    }
  }
};

runFrontendDiagnostic();
