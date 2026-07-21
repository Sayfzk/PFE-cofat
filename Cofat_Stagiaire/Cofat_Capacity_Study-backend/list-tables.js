/**
 * List all tables in the database
 */
const sequelize = require('./db');

async function listTables() {
  try {
    const [tables] = await sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    console.log('Tables found:');
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
  } catch (err) {
    console.error('Error listing tables:', err.message);
  } finally {
    process.exit();
  }
}

listTables();
