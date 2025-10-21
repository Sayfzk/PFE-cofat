// test_final.js - Test final des corrections
console.log('🧪 Test final des corrections...\n');

// Test 1: Backend sur port 3004
const http = require('http');

const testBackend = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3004/api/sites', (res) => {
      console.log(`✅ Backend accessible sur port 3004 (Status: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Backend non accessible sur port 3004');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('❌ Timeout - Backend non accessible');
      req.destroy();
      resolve(false);
    });
  });
};

// Test 2: Vérifier les traductions
const fs = require('fs');
const i18nPath = './Cofat_Capacity_front/src/i18n.js';

const testTranslations = () => {
  if (fs.existsSync(i18nPath)) {
    const content = fs.readFileSync(i18nPath, 'utf8');
    const hasSpaceTranslations = content.includes("'SAVE': 'ENREGISTRER'") && content.includes("'SAVE': 'SAVE'");
    const hasProjectTranslations = content.includes("'PROJECT 4': 'PROJET 4'");
    
    console.log(`${hasSpaceTranslations ? '✅' : '❌'} Traductions boutons (SAVE, etc.)`);
    console.log(`${hasProjectTranslations ? '✅' : '❌'} Traductions projets (PROJECT 4, etc.)`);
    
    return hasSpaceTranslations && hasProjectTranslations;
  } else {
    console.log('❌ Fichier i18n.js non trouvé');
    return false;
  }
};

// Test 3: Vérifier les URLs mises à jour
const testUrls = () => {
  const files = [
    './Cofat_Capacity_front/src/services/NotificationService.js',
    './Cofat_Capacity_front/src/components/user/pages/SpaceTable.js'
  ];
  
  let allCorrect = true;
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const hasCorrectPort = content.includes('3004');
      console.log(`${hasCorrectPort ? '✅' : '❌'} ${file.split('/').pop()} - Port 3004`);
      if (!hasCorrectPort) allCorrect = false;
    }
  });
  
  return allCorrect;
};

// Exécuter tous les tests
const runTests = async () => {
  console.log('🔧 Test Backend :');
  const backendOk = await testBackend();
  
  console.log('\n🌐 Test Traductions :');
  const translationsOk = testTranslations();
  
  console.log('\n🔗 Test URLs :');
  const urlsOk = testUrls();
  
  console.log('\n📊 Résumé :');
  const allTests = [backendOk, translationsOk, urlsOk];
  const passed = allTests.filter(Boolean).length;
  
  console.log(`✅ Tests réussis : ${passed}/3`);
  
  if (passed === 3) {
    console.log('\n🎉 TOUTES LES CORRECTIONS SONT APPLIQUÉES !');
    console.log('\n📋 Fonctionnalités corrigées :');
    console.log('   🔔 Backend accessible sur port 3004');
    console.log('   🌐 Traductions FR/EN étendues');
    console.log('   🔗 URLs mises à jour');
    console.log('\n🧪 Pour tester l\'application :');
    console.log('   1. Ouvrez http://localhost:4000');
    console.log('   2. Testez le sélecteur de langue');
    console.log('   3. Testez Save/Delete dans Space');
    console.log('   4. Vérifiez les notifications');
  } else {
    console.log('\n⚠️  Certaines corrections nécessitent une vérification manuelle.');
  }
};

runTests();
