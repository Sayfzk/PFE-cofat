const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const sequelize = require('../db');
const StandardInvestment = require('../models/StandardInvestment');

const LOG_FILE = path.join(__dirname, '../import_debug.log');

function log(msg) {
    const time = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${time}] ${msg}\n`);
    console.log(msg);
}

async function importStandardInvestments() {
    try {
        fs.writeFileSync(LOG_FILE, '');

        log('🔄 Connecting to database...');
        await sequelize.authenticate();
        log('✅ Database connected.');

        log('🔄 Syncing StandardInvestment model...');
        await StandardInvestment.sync({ force: true });
        log('✅ Table StandardInvestments created.');

        const filePath = path.join(__dirname, '../../207001104 (002).xlsx');
        log(`📖 Reading Excel file: ${filePath}`);

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 6, defval: null });

        const investments = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.every(cell => cell === null || cell === '')) continue;

            investments.push({
                code_eq: row[0] ? String(row[0]).trim() : null,
                operation: row[1] ? String(row[1]).trim() : null,
                operation_code: row[2] ? String(row[2]).trim() : null,
                equipment_reference: row[3] ? String(row[3]).trim() : null,
                supplier_technology: row[4] ? String(row[4]).trim() : null,
                equipment_type: row[5] ? String(row[5]).trim() : null,
                calculation_method: row[6] ? String(row[6]).trim() : null,
                daily_capacity: row[7] ? String(row[7]).trim() : null,
                lifetime: row[9] ? String(row[9]).trim() : null,
                cost_euro: row[10] ? String(row[10]).trim() : null,
                cost_brazil_real: row[11] ? String(row[11]).trim() : null,
                cost_mexican_peso: row[12] ? String(row[12]).trim() : null,
                workstation_dimensions: row[13] ? String(row[13]).trim() : null,
                reference_cdc: row[14] ? String(row[14]).trim() : null,
                reference_pr: row[15] ? String(row[15]).trim() : null,
                row_index: i + 7
            });
        }

        log(`📝 Prepared ${investments.length} records.`);

        let successCount = 0;
        for (const inv of investments) {
            try {
                await StandardInvestment.create(inv);
                successCount++;
                if (successCount % 50 === 0) log(`✅ Inserted ${successCount} records...`);
            } catch (err) {
                log(`❌ Error inserting row ${inv.row_index}: ${err.message}`);
                break; // Stop on first error
            }
        }

        log(`✅ Successfully inserted ${successCount} out of ${investments.length} records.`);

    } catch (err) {
        log(`❌ Error during import: ${err.message}`);
        if (err.stack) log(err.stack.substring(0, 1000));
    } finally {
        process.exit();
    }
}

importStandardInvestments();
