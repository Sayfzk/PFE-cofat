/**
 * Diagnostic: Check for summary rows that might cause double counting
 * node check-summaries.js
 */
const { Site, HR } = require('./models');

async function check() {
  const allRows = await HR.findAll({
    include: [Site],
    where: { category: 'Assembly Direct' }
  });
  
  const types = new Set();
  allRows.forEach(r => types.add(r.type));
  
  console.log('Types found in "Assembly Direct" category:');
  Array.from(types).forEach(t => console.log(`  - "${t}"`));
  
  const sTotals = allRows.filter(r => r.type.toLowerCase().includes('total'));
  if (sTotals.length > 0) {
    console.log('\n⚠️ WARNING: Found "Total" rows in "Assembly Direct" category! This will cause DOUBLE COUNTING.');
    sTotals.forEach(r => {
      console.log(`  Row: [${r.Site.nom}] period=${r.year}-${r.month} type="${r.type}" count=${r.count}`);
    });
  } else {
    console.log('\n✅ No summary rows found in "Assembly Direct".');
  }
}

check().then(() => process.exit());
