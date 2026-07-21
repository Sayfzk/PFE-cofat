/**
 * Debug: Fetch and analyze CofatGroup HR API response
 */
const http = require('http');

http.get('http://127.0.0.1:9001/api/cofat-group/hr', (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      if (parsedData.success) {
        const { totals, periods } = parsedData.data;
        console.log('✅ CofatGroup HR API Data loaded successfully');
        console.log(`Total periods: ${Object.keys(totals.sTotal).length}`);
        
        // Show the first 3 periods data
        for (let i = 0; i < 12; i++) {
          console.log(`--- Period ${i+1} : ${parsedData.data.months[i]} ---`);
          console.log(`T-Direct        : ${totals.direct[i]}`);
          console.log(`S-Total Assembly: ${totals.sTotalAssembly[i]}`);
          console.log(`T-Indirect      : ${totals.indirect[i]}`);
          console.log(`S-Total         : ${totals.sTotal[i]}`);
          console.log(`Total Plant     : ${totals.totalPlant[i]}`);
          console.log('---------------------------');
        }
      } else {
        console.error('API Error:', parsedData.error);
      }
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
