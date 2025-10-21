// test_fix.js - Script de test des corrections
console.log('🧪 Test des corrections appliquées...\n');

// Test 1: Vérifier que getAuthHeaders est bien importé dans SiteTable
const fs = require('fs');
const siteTablePath = './Cofat_Capacity_front/src/components/user/pages/SiteTable.js';

if (fs.existsSync(siteTablePath)) {
  const content = fs.readFileSync(siteTablePath, 'utf8');
  const hasImport = content.includes("import { getAuthHeaders } from '../../../utils/apiUtils'");
  const hasUsage = content.includes('...getAuthHeaders()');
  
  console.log(`${hasImport ? '✅' : '❌'} SiteTable.js - Import getAuthHeaders`);
  console.log(`${hasUsage ? '✅' : '❌'} SiteTable.js - Usage getAuthHeaders`);
} else {
  console.log('❌ SiteTable.js non trouvé');
}

// Test 2: Vérifier les URLs dans NotificationService
const notifServicePath = './Cofat_Capacity_front/src/services/NotificationService.js';

if (fs.existsSync(notifServicePath)) {
  const content = fs.readFileSync(notifServicePath, 'utf8');
  const hasCorrectPort = content.includes('3003');
  const hasAuthHeaders = content.includes('...getAuthHeaders()');
  
  console.log(`${hasCorrectPort ? '✅' : '❌'} NotificationService.js - Port 3003`);
  console.log(`${hasAuthHeaders ? '✅' : '❌'} NotificationService.js - Auth headers`);
} else {
  console.log('❌ NotificationService.js non trouvé');
}

// Test 3: Vérifier le middleware compatibleAuth
const authPath = './Cofat_Capacity_Study-backend/middlewares/compatibleAuth.js';

if (fs.existsSync(authPath)) {
  const content = fs.readFileSync(authPath, 'utf8');
  const hasHeaderReading = content.includes("req.headers['x-user-role']");
  
  console.log(`${hasHeaderReading ? '✅' : '❌'} compatibleAuth.js - Lecture headers`);
} else {
  console.log('❌ compatibleAuth.js non trouvé');
}

// Test 4: Vérifier le port dans main.js
const mainPath = './Cofat_Capacity_Study-backend/main.js';

if (fs.existsSync(mainPath)) {
  const content = fs.readFileSync(mainPath, 'utf8');
  const hasCorrectPort = content.includes('const PORT = 3003');
  const hasCorrectCors = content.includes('x-user-name', 'x-user-id');
  
  console.log(`${hasCorrectPort ? '✅' : '❌'} main.js - Port 3003`);
  console.log(`${hasCorrectCors ? '✅' : '❌'} main.js - Headers CORS`);
} else {
  console.log('❌ main.js non trouvé');
}

console.log('\n🎯 Instructions de test :');
console.log('1. Redémarrez le backend (npm start dans Cofat_Capacity_Study-backend)');
console.log('2. Vérifiez que le frontend utilise le port 3003');
console.log('3. Testez Save/Delete dans Space, HR, Equipment Planning');
console.log('4. Vérifiez les notifications dans la navbar');

console.log('\n📝 Si les erreurs persistent :');
console.log('- Videz le cache navigateur (Ctrl+F5)');
console.log('- Vérifiez la console (F12) pour les erreurs');
console.log('- Assurez-vous d\'être connecté avec un utilisateur valide');
