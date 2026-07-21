// Script simple pour vérifier les données dans la base
const sequelize = require('./db');

async function checkData() {
  try {
    // Requête SQL directe pour voir ce qui est vraiment dans la base
    const [results] = await sequelize.query(`
      SELECT TOP 10 
        id, department, area, equipment, qty, currency, unitPrice, totalPrice
      FROM NonIndustrialBudget 
      WHERE department = 'IT'
      ORDER BY id ASC
    `);
    
    console.log('=== Données IT dans SQL Server ===');
    console.log('Nombre de résultats:', results.length);
    results.forEach((row, index) => {
      console.log(`\n${index + 1}. ID: ${row.id}`);
      console.log(`   Department: ${row.department}`);
      console.log(`   Area: ${row.area}`);
      console.log(`   Equipment: ${row.equipment}`);
      console.log(`   Qty: ${row.qty}`);
      console.log(`   Currency: ${row.currency}`);
      console.log(`   Unit Price: ${row.unitPrice}`);
      console.log(`   Total Price: ${row.totalPrice}`);
    });

    console.log('\n=== Données HR dans SQL Server ===');
    const [hrResults] = await sequelize.query(`
      SELECT TOP 10 
        id, department, area, equipment, qty, currency, unitPrice, totalPrice
      FROM NonIndustrialBudget 
      WHERE department = 'HR'
      ORDER BY id ASC
    `);
    
    console.log('Nombre de résultats:', hrResults.length);
    hrResults.forEach((row, index) => {
      console.log(`\n${index + 1}. ID: ${row.id}`);
      console.log(`   Department: ${row.department}`);
      console.log(`   Area: ${row.area}`);
      console.log(`   Equipment: ${row.equipment}`);
      console.log(`   Qty: ${row.qty}`);
      console.log(`   Currency: ${row.currency}`);
      console.log(`   Unit Price: ${row.unitPrice}`);
      console.log(`   Total Price: ${row.totalPrice}`);
    });

    await sequelize.close();
    console.log('\n✅ Terminé');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  }
}

checkData();
