// test_language_switch.js - Test du sélecteur de langue
console.log('🌐 Test du sélecteur de langue...\n');

const fs = require('fs');

// Vérifier que toutes les traductions importantes sont présentes
const checkTranslations = () => {
  const i18nPath = './Cofat_Capacity_front/src/i18n.js';
  
  if (!fs.existsSync(i18nPath)) {
    console.log('❌ Fichier i18n.js non trouvé');
    return false;
  }
  
  const content = fs.readFileSync(i18nPath, 'utf8');
  
  // Traductions françaises à vérifier
  const frenchTranslations = [
    "'SAVE': 'ENREGISTRER'",
    "'RECHARGER': 'RECHARGER'", 
    "'SUPPRIMER': 'SUPPRIMER'",
    "'Import Excel': 'Importer Excel'",
    "'Space Study': 'Étude d\\'Espace'",
    "'PROJECT 4': 'PROJET 4'",
    "'S-Total Assembly': 'S-Total Assemblage'",
    "'TOTAL AREA': 'SURFACE TOTALE'",
    "'Available Area': 'Surface Disponible'"
  ];
  
  // Traductions anglaises à vérifier
  const englishTranslations = [
    "'SAVE': 'SAVE'",
    "'RECHARGER': 'RELOAD'",
    "'SUPPRIMER': 'DELETE'", 
    "'Import Excel': 'Import Excel'",
    "'Space Study': 'Space Study'",
    "'PROJECT 4': 'PROJECT 4'",
    "'S-Total Assembly': 'S-Total Assembly'",
    "'TOTAL AREA': 'TOTAL AREA'",
    "'Available Area': 'Available Area'"
  ];
  
  console.log('📋 Vérification des traductions françaises :');
  let frenchOk = 0;
  frenchTranslations.forEach(translation => {
    const found = content.includes(translation);
    console.log(`${found ? '✅' : '❌'} ${translation}`);
    if (found) frenchOk++;
  });
  
  console.log('\n📋 Vérification des traductions anglaises :');
  let englishOk = 0;
  englishTranslations.forEach(translation => {
    const found = content.includes(translation);
    console.log(`${found ? '✅' : '❌'} ${translation}`);
    if (found) englishOk++;
  });
  
  const totalExpected = frenchTranslations.length + englishTranslations.length;
  const totalFound = frenchOk + englishOk;
  
  console.log(`\n📊 Résultat : ${totalFound}/${totalExpected} traductions trouvées`);
  
  return totalFound === totalExpected;
};

// Vérifier que le composant LanguageSwitcher existe
const checkLanguageSwitcher = () => {
  const switcherPath = './Cofat_Capacity_front/src/components/LanguageSwitcher.js';
  const cssPath = './Cofat_Capacity_front/src/components/LanguageSwitcher.css';
  
  const hasComponent = fs.existsSync(switcherPath);
  const hasStyles = fs.existsSync(cssPath);
  
  console.log(`${hasComponent ? '✅' : '❌'} LanguageSwitcher.js existe`);
  console.log(`${hasStyles ? '✅' : '❌'} LanguageSwitcher.css existe`);
  
  if (hasComponent) {
    const content = fs.readFileSync(switcherPath, 'utf8');
    const hasFlags = content.includes('🇫🇷') && content.includes('🇬🇧');
    const hasTranslation = content.includes('useTranslation');
    
    console.log(`${hasFlags ? '✅' : '❌'} Drapeaux FR/EN présents`);
    console.log(`${hasTranslation ? '✅' : '❌'} Hook useTranslation utilisé`);
    
    return hasFlags && hasTranslation;
  }
  
  return false;
};

// Vérifier l'intégration dans NavBar
const checkNavBarIntegration = () => {
  const navbarPath = './Cofat_Capacity_front/src/components/user/pages/NavBar.js.js';
  
  if (!fs.existsSync(navbarPath)) {
    console.log('❌ NavBar.js.js non trouvé');
    return false;
  }
  
  const content = fs.readFileSync(navbarPath, 'utf8');
  const hasImport = content.includes('LanguageSwitcher');
  const hasUsage = content.includes('<LanguageSwitcher');
  
  console.log(`${hasImport ? '✅' : '❌'} Import LanguageSwitcher dans NavBar`);
  console.log(`${hasUsage ? '✅' : '❌'} Utilisation <LanguageSwitcher /> dans NavBar`);
  
  return hasImport && hasUsage;
};

// Exécuter tous les tests
const runLanguageTests = () => {
  console.log('🔍 Test des traductions :');
  const translationsOk = checkTranslations();
  
  console.log('\n🔍 Test du composant LanguageSwitcher :');
  const componentOk = checkLanguageSwitcher();
  
  console.log('\n🔍 Test de l\'intégration NavBar :');
  const integrationOk = checkNavBarIntegration();
  
  console.log('\n📊 Résumé final :');
  const allTests = [translationsOk, componentOk, integrationOk];
  const passed = allTests.filter(Boolean).length;
  
  console.log(`✅ Tests réussis : ${passed}/3`);
  
  if (passed === 3) {
    console.log('\n🎉 SÉLECTEUR DE LANGUE PARFAITEMENT CONFIGURÉ !');
    console.log('\n📋 Instructions de test :');
    console.log('1. Ouvrez http://localhost:4000');
    console.log('2. Cherchez l\'icône globe 🌐 dans la navbar (coin supérieur droit)');
    console.log('3. Cliquez dessus pour voir le menu déroulant');
    console.log('4. Sélectionnez 🇬🇧 English - toute l\'interface doit passer en anglais');
    console.log('5. Sélectionnez 🇫🇷 Français - toute l\'interface doit revenir en français');
    console.log('\n✨ Éléments qui doivent changer :');
    console.log('   - Boutons : SAVE → ENREGISTRER, DELETE → SUPPRIMER');
    console.log('   - Projets : PROJECT 4 → PROJET 4');
    console.log('   - Interface : Space Study → Étude d\'Espace');
  } else {
    console.log('\n⚠️  Certains éléments nécessitent une vérification.');
  }
};

runLanguageTests();
