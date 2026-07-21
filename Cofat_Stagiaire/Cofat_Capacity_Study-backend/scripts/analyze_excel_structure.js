const XLSX = require('xlsx');
const path = require('path');

const EXCEL_PATH = "D:\\OneDrive - Cofat\\Documents\\FinalStadardEquipment update (2).xls";

try {
  console.log(`Reading file: ${EXCEL_PATH}`);
  const workbook = XLSX.readFile(EXCEL_PATH);

  console.log('\n=== SHEETS ===');
  workbook.SheetNames.forEach((name, i) => console.log(`  [${i}] ${name}`));

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    console.log(`\n=== SHEET: "${sheetName}" ===`);
    console.log(`  Total rows (raw): ${data.length}`);

    if (data.length > 0) {
      const headers = data[0];
      console.log(`  Columns (${headers.length}):`);
      headers.forEach((h, i) => console.log(`    [${i}] "${h}"`));

      // Find data rows (non-empty)
      const dataRows = data.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));
      console.log(`  Data rows (non-empty): ${dataRows.length}`);

      // Sample first 5 rows
      console.log('\n  --- Sample rows (first 5) ---');
      dataRows.slice(0, 5).forEach((row, i) => {
        console.log(`  Row ${i + 1}:`);
        headers.forEach((h, j) => {
          if (row[j] !== null && row[j] !== '') {
            console.log(`    ${h}: ${String(row[j]).substring(0, 80)}`);
          }
        });
      });

      // Analyze unique values in key columns
      if (headers.length > 0) {
        // Find something that looks like Code Eq
        const codeEqIdx = headers.findIndex(h => h && String(h).toLowerCase().includes('code'));
        const opIdx = headers.findIndex(h => h && String(h).toLowerCase().includes('op'));

        if (codeEqIdx >= 0) {
          const uniqueCodes = new Set(dataRows.map(r => r[codeEqIdx]).filter(v => v !== null && v !== ''));
          console.log(`\n  Unique "${headers[codeEqIdx]}" values: ${uniqueCodes.size}`);
          const codeArray = [...uniqueCodes].sort();
          console.log(`  First 20: ${codeArray.slice(0, 20).join(', ')}`);
          console.log(`  Last 10:  ${codeArray.slice(-10).join(', ')}`);
        }

        if (opIdx >= 0 && opIdx !== codeEqIdx) {
          const uniqueOps = new Set(dataRows.map(r => r[opIdx]).filter(v => v !== null && v !== ''));
          console.log(`\n  Unique "${headers[opIdx]}" values: ${uniqueOps.size}`);
          console.log(`  Values: ${[...uniqueOps].slice(0, 20).join(' | ')}`);
        }
      }
    }
  });

  process.exit(0);
} catch (err) {
  console.error('Error reading Excel:', err.message);
  process.exit(1);
}
