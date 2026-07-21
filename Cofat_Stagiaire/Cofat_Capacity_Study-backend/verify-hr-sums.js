/**
 * Verify CofatGroup HR totals vs individual lines
 */
const http = require('http');

http.get('http://127.0.0.1:9001/api/cofat-group/hr', (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      if (parsedData.success) {
        const { categories, totals } = parsedData.data;
        const direct = categories['Direct'];
        const indirect = categories['Indirect'];
        
        console.log(`Checking P1 (index 0):`);
        
        let sumDirect = 0;
        direct.forEach(row => {
          sumDirect += (row.values[0] || 0);
          console.log(`  Direct Row: ${row.type} = ${row.values[0]}`);
        });
        
        console.log(`Sum Direct: ${sumDirect} (API says ${totals.direct[0]})`);
        
        let sumIndirect = 0;
        indirect.forEach(row => {
          sumIndirect += (row.values[0] || 0);
          console.log(`  Indirect Row: ${row.type} = ${row.values[0]}`);
        });
        
        console.log(`Sum Indirect: ${sumIndirect} (API says ${totals.indirect[0]})`);
        
        // Note: Assembly Direct is empty in the categories object sent by API!
        console.log(`Assembly Direct in Categories: ${categories['Assembly Direct'] ? categories['Assembly Direct'].length : 'MISSING'}`);
        
      } else {
        console.error('API Error');
      }
    } catch (e) { console.error(e.message); }
  });
});
