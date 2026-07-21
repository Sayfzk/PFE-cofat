const XLSX = require('xlsx');
const NonIndustrialBudget = require('../models/NonIndustrialBudget');

/**
 * Import budget data from Excel file
 * @param {string} filePath - Path to the Excel file
 * @param {string} importedBy - Username of the person importing
 * @returns {Promise<Object>} Import results
 */
async function importBudgetFromExcel(filePath, importedBy = 'system') {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    const results = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
      departments: {}
    };

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      try {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Processing sheet: ${sheetName} with ${data.length} rows`);

        // Process each row
        for (const row of data) {
          try {
            // Get department from the row data (column "Department")
            const department = (row['Department'] || row['department'] || row['DEPARTMENT'] || '').toUpperCase();
            
            // Skip if no valid department
            if (!department || !['IT', 'HR', 'QUALITY', 'BUILDING', 'LOGISTICS', 'MAINTENANCE', 'PRODUCTION'].includes(department)) {
              results.failed++;
              results.errors.push({
                sheet: sheetName,
                row: row,
                error: `Invalid or missing department: ${department}`
              });
              continue;
            }
            
            // Initialize department stats if needed
            if (!results.departments[department]) {
              results.departments[department] = {
                imported: 0,
                failed: 0
              };
            }

            // Map Excel columns to database fields
            const budgetItem = {
              department: department,
              area: row['Area'] || row['area'] || row['AREA'] || '',
              equipment: row['Equipment'] || row['equipment'] || row['EQUIPMENT'] || row['Description'] || '',
              qty: parseInt(row['Qty'] || row['qty'] || row['QTY'] || row['Quantity'] || 1),
              currency: row['devis'] || row['Devis'] || row['Currency'] || row['currency'] || row['Devis (Unit)'] || 'USD',
              unitPrice: parseFloat(row['Unit Price'] || row['unitPrice'] || row['Unit_Price'] || row['UNIT PRICE'] || 0),
              createdBy: importedBy
            };

            // Validate required fields
            if (!budgetItem.equipment) {
              results.departments[department].failed++;
              results.failed++;
              results.errors.push({
                department,
                row: row,
                error: 'Missing equipment name'
              });
              continue;
            }

            // Create the budget item
            await NonIndustrialBudget.create(budgetItem);
            results.departments[department].imported++;
            results.imported++;

          } catch (rowError) {
            results.departments[department].failed++;
            results.failed++;
            results.errors.push({
              department,
              row: row,
              error: rowError.message
            });
          }
        }

      } catch (sheetError) {
        results.errors.push({
          sheet: sheetName,
          error: sheetError.message
        });
      }
    }

    return results;

  } catch (error) {
    return {
      success: false,
      error: error.message,
      imported: 0,
      failed: 0
    };
  }
}

/**
 * Export budget data to Excel file
 * @param {string} department - Department to export (optional, exports all if not specified)
 * @returns {Promise<Object>} Workbook object
 */
async function exportBudgetToExcel(department = null) {
  try {
    const workbook = XLSX.utils.book_new();

    if (department) {
      // Export single department
      const budgets = await NonIndustrialBudget.findAll({
        where: { department: department.toUpperCase() },
        order: [['createdAt', 'DESC']]
      });

      const data = budgets.map(item => ({
        'Department': item.department,
        'Area': item.area,
        'Equipment': item.equipment,
        'Qty': item.qty,
        'Currency': item.currency,
        'Unit Price': parseFloat(item.unitPrice),
        'Total Price': parseFloat(item.totalPrice),
        'Status': item.status,
        'Created By': item.createdBy,
        'Created At': item.createdAt
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, department);

    } else {
      // Export all departments
      const departments = ['IT', 'HR', 'QUALITY', 'BUILDING', 'LOGISTICS', 'MAINTENANCE', 'PRODUCTION'];

      for (const dept of departments) {
        const budgets = await NonIndustrialBudget.findAll({
          where: { department: dept },
          order: [['createdAt', 'DESC']]
        });

        const data = budgets.map(item => ({
          'Department': item.department,
          'Area': item.area,
          'Equipment': item.equipment,
          'Qty': item.qty,
          'Currency': item.currency,
          'Unit Price': parseFloat(item.unitPrice),
          'Total Price': parseFloat(item.totalPrice),
          'Status': item.status,
          'Created By': item.createdBy,
          'Created At': item.createdAt
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, dept);
      }
    }

    return workbook;

  } catch (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
}

module.exports = {
  importBudgetFromExcel,
  exportBudgetToExcel
};
