const NonIndustrialBudget = require('./models/NonIndustrialBudget');
const sequelize = require('./db');

async function testBudgetData() {
  try {
    console.log('🔍 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie!\n');

    // Test 1: Récupérer tous les départements
    console.log('📊 Test 1: Tous les départements');
    const allBudgets = await NonIndustrialBudget.findAll({
      attributes: ['department'],
      group: ['department']
    });
    console.log('Départements trouvés:', allBudgets.map(b => b.department));
    console.log('');

    // Test 2: Compter les items par département
    console.log('📊 Test 2: Nombre d\'items par département');
    const departments = ['IT', 'HR', 'QUALITY', 'BUILDING', 'LOGISTICS', 'MAINTENANCE', 'PRODUCTION'];
    
    for (const dept of departments) {
      const count = await NonIndustrialBudget.count({
        where: { department: dept }
      });
      if (count > 0) {
        console.log(`${dept}: ${count} items`);
      }
    }
    console.log('');

    // Test 3: Afficher les données IT
    console.log('📊 Test 3: Données du département IT');
    const itData = await NonIndustrialBudget.findAll({
      where: { department: 'IT' },
      order: [['id', 'ASC']],
      limit: 5
    });
    console.log(`Trouvé ${itData.length} items IT (affichage des 5 premiers):`);
    itData.forEach(item => {
      console.log(`  - ID: ${item.id}, Equipment: ${item.equipment}, Area: ${item.area}, Qty: ${item.qty}, Price: ${item.unitPrice} ${item.currency}`);
    });
    console.log('');

    // Test 4: Afficher les données HR
    console.log('📊 Test 4: Données du département HR');
    const hrData = await NonIndustrialBudget.findAll({
      where: { department: 'HR' },
      order: [['id', 'ASC']],
      limit: 5
    });
    console.log(`Trouvé ${hrData.length} items HR (affichage des 5 premiers):`);
    hrData.forEach(item => {
      console.log(`  - ID: ${item.id}, Equipment: ${item.equipment}, Area: ${item.area}, Qty: ${item.qty}, Price: ${item.unitPrice} ${item.currency}`);
    });
    console.log('');

    // Test 5: Vérifier la structure de la table
    console.log('📊 Test 5: Structure de la table');
    const tableInfo = await sequelize.getQueryInterface().describeTable('NonIndustrialBudget');
    console.log('Colonnes de la table:');
    Object.keys(tableInfo).forEach(col => {
      console.log(`  - ${col}: ${tableInfo[col].type}`);
    });

    console.log('\n✅ Tests terminés!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testBudgetData();
