/**
 * Script pour ajouter des données de test au module Non Industrial Budget
 * 
 * Usage: node seed-budget-data.js
 */

const NonIndustrialBudget = require('./models/NonIndustrialBudget');
const { syncDatabase } = require('./models');

// Données de test pour chaque département
const testData = [
  // IT Department
  { department: 'IT', area: 'Software', equipment: 'Microsoft Office 365', qty: 10, currency: 'USD', unitPrice: 299.99, createdBy: 'admin' },
  { department: 'IT', area: 'Software', equipment: 'Adobe Creative Cloud', qty: 5, currency: 'USD', unitPrice: 599.99, createdBy: 'admin' },
  { department: 'IT', area: 'Hardware', equipment: 'Dell Laptop', qty: 15, currency: 'USD', unitPrice: 1200.00, createdBy: 'admin' },
  { department: 'IT', area: 'Hardware', equipment: 'HP Printer', qty: 3, currency: 'USD', unitPrice: 450.00, createdBy: 'admin' },
  { department: 'IT', area: 'Network', equipment: 'Cisco Router', qty: 2, currency: 'EUR', unitPrice: 850.00, createdBy: 'admin' },
  
  // HR Department
  { department: 'HR', area: 'Recruitment', equipment: 'Job Board License', qty: 1, currency: 'USD', unitPrice: 5000.00, createdBy: 'admin' },
  { department: 'HR', area: 'Training', equipment: 'Online Course Subscription', qty: 20, currency: 'EUR', unitPrice: 150.00, createdBy: 'admin' },
  { department: 'HR', area: 'Software', equipment: 'HR Management System', qty: 1, currency: 'USD', unitPrice: 12000.00, createdBy: 'admin' },
  { department: 'HR', area: 'Equipment', equipment: 'Office Furniture', qty: 10, currency: 'TND', unitPrice: 500.00, createdBy: 'admin' },
  
  // QUALITY Department
  { department: 'QUALITY', area: 'Testing', equipment: 'Quality Testing Equipment', qty: 5, currency: 'EUR', unitPrice: 2500.00, createdBy: 'admin' },
  { department: 'QUALITY', area: 'Software', equipment: 'Quality Management Software', qty: 1, currency: 'USD', unitPrice: 8000.00, createdBy: 'admin' },
  { department: 'QUALITY', area: 'Calibration', equipment: 'Calibration Tools', qty: 10, currency: 'EUR', unitPrice: 350.00, createdBy: 'admin' },
  { department: 'QUALITY', area: 'Training', equipment: 'ISO Certification Training', qty: 15, currency: 'USD', unitPrice: 500.00, createdBy: 'admin' },
  
  // BUILDING Department
  { department: 'BUILDING', area: 'Maintenance', equipment: 'HVAC System Upgrade', qty: 1, currency: 'USD', unitPrice: 25000.00, createdBy: 'admin' },
  { department: 'BUILDING', area: 'Security', equipment: 'Security Camera System', qty: 20, currency: 'EUR', unitPrice: 300.00, createdBy: 'admin' },
  { department: 'BUILDING', area: 'Lighting', equipment: 'LED Lighting', qty: 100, currency: 'TND', unitPrice: 50.00, createdBy: 'admin' },
  { department: 'BUILDING', area: 'Renovation', equipment: 'Office Renovation', qty: 1, currency: 'USD', unitPrice: 50000.00, createdBy: 'admin' },
  
  // LOGISTICS Department
  { department: 'LOGISTICS', area: 'Transport', equipment: 'Delivery Van', qty: 3, currency: 'USD', unitPrice: 35000.00, createdBy: 'admin' },
  { department: 'LOGISTICS', area: 'Equipment', equipment: 'Forklift', qty: 2, currency: 'EUR', unitPrice: 15000.00, createdBy: 'admin' },
  { department: 'LOGISTICS', area: 'Software', equipment: 'Warehouse Management System', qty: 1, currency: 'USD', unitPrice: 10000.00, createdBy: 'admin' },
  { department: 'LOGISTICS', area: 'Packaging', equipment: 'Packaging Materials', qty: 1000, currency: 'TND', unitPrice: 5.00, createdBy: 'admin' },
  
  // MAINTENANCE Department
  { department: 'MAINTENANCE', area: 'Tools', equipment: 'Power Tools Set', qty: 10, currency: 'EUR', unitPrice: 500.00, createdBy: 'admin' },
  { department: 'MAINTENANCE', area: 'Equipment', equipment: 'Industrial Vacuum', qty: 5, currency: 'USD', unitPrice: 800.00, createdBy: 'admin' },
  { department: 'MAINTENANCE', area: 'Spare Parts', equipment: 'Machine Spare Parts', qty: 50, currency: 'EUR', unitPrice: 200.00, createdBy: 'admin' },
  { department: 'MAINTENANCE', area: 'Safety', equipment: 'Safety Equipment', qty: 30, currency: 'TND', unitPrice: 100.00, createdBy: 'admin' },
  
  // PRODUCTION Department
  { department: 'PRODUCTION', area: 'Machinery', equipment: 'CNC Machine', qty: 2, currency: 'USD', unitPrice: 75000.00, createdBy: 'admin' },
  { department: 'PRODUCTION', area: 'Tools', equipment: 'Production Tools', qty: 50, currency: 'EUR', unitPrice: 150.00, createdBy: 'admin' },
  { department: 'PRODUCTION', area: 'Software', equipment: 'Production Planning Software', qty: 1, currency: 'USD', unitPrice: 15000.00, createdBy: 'admin' },
  { department: 'PRODUCTION', area: 'Quality Control', equipment: 'Inspection Equipment', qty: 10, currency: 'EUR', unitPrice: 1200.00, createdBy: 'admin' },
];

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

async function seedData() {
  console.log('\n' + colors.cyan + colors.bright);
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   💰 Non Industrial Budget - Seed Data       ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(colors.reset);

  try {
    // Synchroniser la base de données
    console.log(colors.yellow + '⏳ Synchronisation de la base de données...' + colors.reset);
    await syncDatabase();
    console.log(colors.green + '✅ Base de données synchronisée\n' + colors.reset);

    // Vérifier si des données existent déjà
    const existingData = await NonIndustrialBudget.findAll();
    
    if (existingData.length > 0) {
      console.log(colors.yellow + `⚠️  ${existingData.length} entrées existent déjà dans la base de données.` + colors.reset);
      console.log(colors.yellow + 'Voulez-vous continuer et ajouter les données de test ?' + colors.reset);
      console.log(colors.yellow + '(Les données seront ajoutées, pas remplacées)\n' + colors.reset);
    }

    // Insérer les données de test
    console.log(colors.cyan + '⏳ Insertion des données de test...' + colors.reset);
    console.log('─'.repeat(50));

    let successCount = 0;
    let errorCount = 0;
    const departmentCounts = {};

    for (const item of testData) {
      try {
        await NonIndustrialBudget.create(item);
        successCount++;
        
        if (!departmentCounts[item.department]) {
          departmentCounts[item.department] = 0;
        }
        departmentCounts[item.department]++;
        
      } catch (error) {
        errorCount++;
        console.log(colors.red + `❌ Erreur: ${item.equipment} - ${error.message}` + colors.reset);
      }
    }

    // Afficher les résultats
    console.log('\n' + colors.bright + '📊 Résultats:' + colors.reset);
    console.log('─'.repeat(50));
    console.log(colors.green + `✅ Succès: ${successCount}` + colors.reset);
    
    if (errorCount > 0) {
      console.log(colors.red + `❌ Erreurs: ${errorCount}` + colors.reset);
    }

    console.log('\n' + colors.bright + '📁 Par Département:' + colors.reset);
    console.log('─'.repeat(50));
    
    Object.keys(departmentCounts).forEach(dept => {
      console.log(`✅ ${dept.padEnd(15)} ${departmentCounts[dept]} entrées`);
    });

    console.log('\n' + colors.green + colors.bright + '🎉 Données de test insérées avec succès!' + colors.reset);
    console.log(colors.green + '\nVous pouvez maintenant voir les données dans le module Non Industrial Budget.\n' + colors.reset);

    process.exit(0);

  } catch (error) {
    console.log('\n' + colors.red + colors.bright + '❌ Erreur fatale:' + colors.reset);
    console.log(colors.red + error.message + colors.reset);
    console.log('\n' + colors.yellow + 'Stack trace:' + colors.reset);
    console.log(error.stack);
    console.log('');
    process.exit(1);
  }
}

// Exécuter le script
seedData();
