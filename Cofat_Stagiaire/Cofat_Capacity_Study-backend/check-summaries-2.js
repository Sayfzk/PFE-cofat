/**
 * Diagnostic: Check for summary rows in "Direct" and "Indirect"
 */
const { Site, HR } = require('./models');

async function check() {
  const allRows = await HR.findAll({
    include: [Site],
    where: { category: ['Direct', 'Indirect'] }
  });
  
  const typesByCat = { 'Direct': new Set(), 'Indirect': new Set() };
  allRows.forEach(r => typesByCat[r.category].add(r.type));
  
  Object.keys(typesByCat).forEach(cat => {
    console.log(`Types in "${cat}":`);
    Array.from(typesByCat[cat]).forEach(t => console.log(`  - "${t}"`));
    
    const sTotals = allRows.filter(r => r.category === cat && r.type.toLowerCase().includes('total'));
    if (sTotals.length > 0) {
      console.log(`⚠️ WARNING: Found summary rows in "${cat}".`);
      sTotals.forEach(r => console.log(`  [${r.Site.nom}] period=${r.year}-${r.month} type="${r.type}" count=${r.count}`));
    }
    console.log('');
  });
}

check().then(() => process.exit());
