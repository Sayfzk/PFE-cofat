// check_deployment.js - Script de vérification du déploiement
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du déploiement des améliorations...\n');

const checks = [];

// 1. Vérifier les fichiers critiques
const criticalFiles = [
  'Cofat_Capacity_front/src/i18n.js',
  'Cofat_Capacity_front/src/components/LanguageSwitcher.js',
  'Cofat_Capacity_front/src/components/user/pages/Sidebar.js',
  'Cofat_Capacity_front/src/components/user/pages/CofatGroupSpace.js',
  'Cofat_Capacity_front/src/components/user/pages/CofatGroupHR.js',
  'Cofat_Capacity_front/src/utils/apiUtils.js',
  'Cofat_Capacity_Study-backend/routers/cofatGroupRoutes.js',
  'Cofat_Capacity_Study-backend/middlewares/notificationMiddleware.js'
];

console.log('📁 Vérification des fichiers critiques :');
criticalFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: `Fichier ${file}`, status: exists });
});

// 2. Vérifier les dépendances npm
console.log('\n📦 Vérification des dépendances :');
const frontendPackage = path.join(__dirname, 'Cofat_Capacity_front/package.json');
if (fs.existsSync(frontendPackage)) {
  const pkg = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
  const i18nDeps = ['react-i18next', 'i18next', 'i18next-browser-languagedetector'];
  
  i18nDeps.forEach(dep => {
    const exists = pkg.dependencies && pkg.dependencies[dep];
    console.log(`${exists ? '✅' : '❌'} ${dep}`);
    checks.push({ name: `Dépendance ${dep}`, status: !!exists });
  });
}

// 3. Vérifier les routes dans App.js
console.log('\n🛣️  Vérification des routes :');
const appFile = path.join(__dirname, 'Cofat_Capacity_front/src/App.js');
if (fs.existsSync(appFile)) {
  const appContent = fs.readFileSync(appFile, 'utf8');
  const routes = [
    '/cofat-group/equipment',
    '/cofat-group/space', 
    '/cofat-group/hr',
    '/admin/dashboard'
  ];
  
  routes.forEach(route => {
    const exists = appContent.includes(route);
    console.log(`${exists ? '✅' : '❌'} Route ${route}`);
    checks.push({ name: `Route ${route}`, status: exists });
  });
}

// 4. Vérifier les imports dans les fichiers modifiés
console.log('\n📥 Vérification des imports :');
const navbarFile = path.join(__dirname, 'Cofat_Capacity_front/src/components/user/pages/NavBar.js.js');
if (fs.existsSync(navbarFile)) {
  const navbarContent = fs.readFileSync(navbarFile, 'utf8');
  const hasI18n = navbarContent.includes('useTranslation');
  const hasGlobe = navbarContent.includes('FaGlobe');
  
  console.log(`${hasI18n ? '✅' : '❌'} Import useTranslation dans NavBar`);
  console.log(`${hasGlobe ? '✅' : '❌'} Import FaGlobe dans NavBar`);
  checks.push({ name: 'Import i18n NavBar', status: hasI18n });
  checks.push({ name: 'Import FaGlobe NavBar', status: hasGlobe });
}

// 5. Résumé final
console.log('\n📊 Résumé de la vérification :');
const passed = checks.filter(c => c.status).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`✅ Tests réussis : ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 Déploiement COMPLET ! Toutes les vérifications sont passées.');
  console.log('🚀 L\'application est prête pour les tests client.');
} else {
  console.log('\n⚠️  Déploiement PARTIEL. Vérifiez les éléments marqués ❌');
  console.log('🔧 Corrigez les problèmes avant les tests client.');
}

console.log('\n📖 Consultez README_AMELIORATIONS.md pour les instructions de test.');
