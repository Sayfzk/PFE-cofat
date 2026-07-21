
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../207001104 (002).xlsx');
const outputPath = path.join(__dirname, 'analysis_result_3.txt');

try {
    let output = `Reading file: ${filePath}\n`;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get rows 6 to 25 (indices 5 to 24)
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 5, defval: null });

    for (let i = 0; i < 20 && i < data.length; i++) {
        output += `--- ROW ${i + 6} ---\n`;
        output += JSON.stringify(data[i]) + '\n';
    }

    fs.writeFileSync(outputPath, output, 'utf8');
    console.log('Analysis written to ' + outputPath);

} catch (err) {
    console.error('Error reading file:', err);
}
