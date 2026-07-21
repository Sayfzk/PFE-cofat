
const sequelize = require('./db');
const StandardInvestment = require('./models/StandardInvestment');

async function verifyImport() {
    try {
        await sequelize.authenticate();
        const count = await StandardInvestment.count();
        console.log(`✅ Total records in StandardInvestments: ${count}`);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit();
    }
}

verifyImport();
