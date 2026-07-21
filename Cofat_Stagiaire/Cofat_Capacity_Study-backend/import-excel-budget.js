/**
 * Excel Budget Import Script
 * 
 * This script imports budget data from your Excel file into the database.
 * 
 * Usage:
 *   node import-excel-budget.js
 * 
 * Make sure to:
 * 1. Close the Excel file before running this script
 * 2. Update the FILE_PATH if your Excel file is in a different location
 * 3. Run this from the backend directory
 */

const { importBudgetFromExcel } = require('./utils/excelImporter');
const path = require('path');

// ⚙️ Configuration
const FILE_PATH = 'D:/OneDrive - Cofat/Documents/BdgetHR.xlsx';
const IMPORTED_BY = 'admin'; // Change this to your username

// 🎨 Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 📊 Display banner
function displayBanner() {
  console.log('\n' + colors.cyan + colors.bright);
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   💰 Non Industrial Budget - Excel Import    ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(colors.reset);
}

// 📊 Display results
function displayResults(results) {
  console.log('\n' + colors.bright + '📊 Import Results:' + colors.reset);
  console.log('─'.repeat(50));
  
  if (results.success) {
    console.log(colors.green + '✅ Import Status: SUCCESS' + colors.reset);
    console.log(colors.green + `✅ Total Imported: ${results.imported}` + colors.reset);
    
    if (results.failed > 0) {
      console.log(colors.yellow + `⚠️  Total Failed: ${results.failed}` + colors.reset);
    }
    
    console.log('\n' + colors.bright + '📁 By Department:' + colors.reset);
    console.log('─'.repeat(50));
    
    Object.keys(results.departments).forEach(dept => {
      const deptData = results.departments[dept];
      const icon = deptData.imported > 0 ? '✅' : '❌';
      console.log(`${icon} ${dept.padEnd(15)} Imported: ${deptData.imported}  Failed: ${deptData.failed}`);
    });
    
    if (results.errors.length > 0) {
      console.log('\n' + colors.yellow + colors.bright + '⚠️  Errors:' + colors.reset);
      console.log('─'.repeat(50));
      results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error.department || error.sheet}: ${error.error}`);
      });
      
      if (results.errors.length > 10) {
        console.log(colors.yellow + `... and ${results.errors.length - 10} more errors` + colors.reset);
      }
    }
    
  } else {
    console.log(colors.red + '❌ Import Status: FAILED' + colors.reset);
    console.log(colors.red + `Error: ${results.error}` + colors.reset);
  }
  
  console.log('\n' + '─'.repeat(50) + '\n');
}

// 🚀 Main function
async function main() {
  displayBanner();
  
  console.log(colors.blue + '📂 Excel File Path:' + colors.reset);
  console.log(`   ${FILE_PATH}\n`);
  
  console.log(colors.blue + '👤 Imported By:' + colors.reset);
  console.log(`   ${IMPORTED_BY}\n`);
  
  console.log(colors.cyan + '⏳ Starting import...' + colors.reset);
  console.log('─'.repeat(50));
  
  try {
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(FILE_PATH)) {
      console.log(colors.red + '\n❌ Error: Excel file not found!' + colors.reset);
      console.log(colors.yellow + '\nPlease check the file path:' + colors.reset);
      console.log(`   ${FILE_PATH}\n`);
      console.log(colors.yellow + 'Update the FILE_PATH constant in this script if needed.\n' + colors.reset);
      process.exit(1);
    }
    
    // Import the data
    const results = await importBudgetFromExcel(FILE_PATH, IMPORTED_BY);
    
    // Display results
    displayResults(results);
    
    // Exit with appropriate code
    if (results.success && results.imported > 0) {
      console.log(colors.green + colors.bright + '🎉 Import completed successfully!' + colors.reset);
      console.log(colors.green + '\nYou can now view the data in the Non Industrial Budget module.\n' + colors.reset);
      process.exit(0);
    } else if (results.success && results.imported === 0) {
      console.log(colors.yellow + '⚠️  No data was imported. Please check your Excel file format.\n' + colors.reset);
      process.exit(1);
    } else {
      console.log(colors.red + '❌ Import failed. Please check the errors above.\n' + colors.reset);
      process.exit(1);
    }
    
  } catch (error) {
    console.log('\n' + colors.red + colors.bright + '❌ Fatal Error:' + colors.reset);
    console.log(colors.red + error.message + colors.reset);
    console.log('\n' + colors.yellow + 'Stack trace:' + colors.reset);
    console.log(error.stack);
    console.log('');
    process.exit(1);
  }
}

// 📝 Display help
function displayHelp() {
  console.log('\n' + colors.cyan + colors.bright + 'Excel Budget Import Script' + colors.reset);
  console.log('\n' + colors.bright + 'Usage:' + colors.reset);
  console.log('  node import-excel-budget.js\n');
  console.log(colors.bright + 'Configuration:' + colors.reset);
  console.log('  Edit the FILE_PATH constant to point to your Excel file');
  console.log('  Edit the IMPORTED_BY constant to set your username\n');
  console.log(colors.bright + 'Excel File Format:' + colors.reset);
  console.log('  - Each sheet represents a department (IT, HR, QUALITY, etc.)');
  console.log('  - Required columns: Equipment, Qty, Currency, Unit Price');
  console.log('  - Optional columns: Area\n');
  console.log(colors.bright + 'Example:' + colors.reset);
  console.log('  Sheet: IT');
  console.log('  ┌──────────┬─────────────────────┬─────┬──────────┬────────────┐');
  console.log('  │ Area     │ Equipment           │ Qty │ Currency │ Unit Price │');
  console.log('  ├──────────┼─────────────────────┼─────┼──────────┼────────────┤');
  console.log('  │ Software │ Microsoft Office    │ 10  │ USD      │ 299.99     │');
  console.log('  │ Hardware │ Dell Laptop         │ 5   │ USD      │ 1200.00    │');
  console.log('  └──────────┴─────────────────────┴─────┴──────────┴────────────┘\n');
  console.log(colors.yellow + 'Important:' + colors.reset);
  console.log('  - Close the Excel file before running this script');
  console.log('  - Make sure the backend server is running');
  console.log('  - Database must be accessible\n');
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  displayHelp();
  process.exit(0);
}

// Run the import
main();
