# 🚀 Non Industrial Budget Module - Installation Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- SQL Server database
- React frontend (already configured)
- Express backend (already configured)

---

## 🔧 Backend Installation

### 1. Install Required Package

The backend needs the `xlsx` package for Excel import/export functionality:

```bash
cd Cofat_Capacity_Study-backend
npm install xlsx
```

### 2. Verify Installation

Check that all files are in place:

```
Cofat_Capacity_Study-backend/
├── models/
│   └── NonIndustrialBudget.js          ✅ Created
├── routers/
│   └── nonIndustrialBudgetRoutes.js    ✅ Created
├── utils/
│   └── excelImporter.js                ✅ Created
└── main.js                              ✅ Updated
```

### 3. Database Synchronization

The database table will be created automatically when you start the backend server:

```bash
cd Cofat_Capacity_Study-backend
npm start
```

Look for this message in the console:
```
✅ Base de données synchronisée avec succès
📡 APIs disponibles:
   - Non Industrial Budget: /api/non-industrial-budget
```

---

## 🎨 Frontend Installation

### 1. Verify Files

Check that all frontend files are in place:

```
Cofat_Capacity_front/
├── src/
│   ├── components/user/pages/
│   │   ├── NonIndustrialBudget.js      ✅ Created
│   │   └── style/
│   │       └── NonIndustrialBudget.css ✅ Created
│   ├── App.js                          ✅ Updated
│   └── components/user/pages/
│       └── Sidebar.js                  ✅ Updated
```

### 2. Start Frontend

```bash
cd Cofat_Capacity_front
npm start
```

The frontend will start on `http://localhost:4000`

---

## 📊 Excel Data Import

### Option 1: Using the Excel File Directly

If you have the Excel file at:
```
D:\OneDrive - Cofat\Documents\BdgetHR.xlsx
```

**Important:** Close the Excel file before importing!

### Option 2: API Import (Recommended)

Use the import API endpoint:

```bash
POST http://localhost:3005/api/non-industrial-budget/import
Content-Type: multipart/form-data

Body:
- file: [Your Excel File]
- importedBy: "your-username"
```

### Option 3: Manual Import Script

Create a script to import your Excel data:

```javascript
// import-budget-data.js
const { importBudgetFromExcel } = require('./utils/excelImporter');

async function runImport() {
  const filePath = 'D:/OneDrive - Cofat/Documents/BdgetHR.xlsx';
  const results = await importBudgetFromExcel(filePath, 'admin');
  
  console.log('Import Results:', results);
  console.log(`✅ Imported: ${results.imported}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('Errors:', results.errors);
  }
}

runImport();
```

Run it:
```bash
cd Cofat_Capacity_Study-backend
node import-budget-data.js
```

---

## 📝 Excel File Format

Your Excel file should have sheets named after departments:

### Sheet Names (any of these formats):
- `IT`
- `HR`
- `QUALITY` or `Quality`
- `BUILDING` or `Building`
- `LOGISTICS` or `Logistics`
- `MAINTENANCE` or `Maintenance`
- `PRODUCTION` or `Production`

### Column Headers (flexible naming):
| Excel Column | Alternative Names | Database Field |
|--------------|-------------------|----------------|
| Area | area | area |
| Equipment | equipment, Description | equipment |
| Qty | qty, Quantity | qty |
| Currency | currency, Devis (Unit) | currency |
| Unit Price | unitPrice, Unit_Price | unitPrice |

### Example Excel Structure:

**Sheet: IT**
| Area | Equipment | Qty | Currency | Unit Price |
|------|-----------|-----|----------|------------|
| Software | Microsoft Office | 10 | USD | 299.99 |
| Hardware | Dell Laptop | 5 | USD | 1200.00 |
| Network | Cisco Router | 2 | EUR | 850.00 |

**Sheet: HR**
| Area | Equipment | Qty | Currency | Unit Price |
|------|-----------|-----|----------|------------|
| Recruitment | Job Board License | 1 | USD | 5000.00 |
| Training | Online Course | 20 | EUR | 150.00 |

---

## 🧪 Testing the Installation

### 1. Test Backend API

```bash
# Get all departments
curl http://localhost:3005/api/non-industrial-budget/all

# Get IT department
curl http://localhost:3005/api/non-industrial-budget/department/IT

# Get currencies
curl http://localhost:3005/api/non-industrial-budget/meta/currencies
```

### 2. Test Frontend

1. Open browser: `http://localhost:4000`
2. Login with your credentials
3. Click on "Non Industrial Budget" in the sidebar
4. You should see the department tabs
5. Try adding a new item
6. Try editing an existing item
7. Try selecting and saving multiple items

### 3. Test Role-Based Access

**As Admin:**
- Can edit all fields
- Can add/delete items
- Can see all departments

**As Achat:**
- Can only edit Currency and Unit Price
- Other fields are read-only
- Can see all departments

**As User:**
- Can edit most fields
- Can add/delete items
- Can see all departments

---

## 🔍 Troubleshooting

### Issue: Backend won't start

**Solution:**
```bash
# Check if port 3005 is already in use
netstat -ano | findstr :3005

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart backend
npm start
```

### Issue: Database table not created

**Solution:**
1. Check database connection in `db.js`
2. Verify SQL Server is running
3. Check console for error messages
4. Try manual sync:
```javascript
const { syncDatabase } = require('./models');
syncDatabase();
```

### Issue: Excel import fails

**Solution:**
1. Close the Excel file before importing
2. Check file path is correct
3. Verify Excel file has correct sheet names
4. Check column headers match expected names
5. Look at error messages in import results

### Issue: Frontend shows "Failed to load data"

**Solution:**
1. Check backend is running
2. Verify API URL in axios configuration
3. Check browser console for errors
4. Test API endpoint directly with curl/Postman

### Issue: Cannot edit fields

**Solution:**
1. Check user role in AuthContext
2. Verify role-based permissions in component
3. Check if user is authenticated
4. Look for JavaScript errors in console

---

## 📦 Package Dependencies

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.21.1",
    "sequelize": "^6.37.3",
    "mysql2": "^3.9.7",
    "multer": "^2.0.0",
    "xlsx": "^0.18.5"  // ⚠️ Add this if not present
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^19.1.0",
    "axios": "^1.7.8",
    "sweetalert2": "^11.23.0",
    "lucide-react": "^0.468.0",
    "xlsx": "^0.18.5"  // Already present
  }
}
```

---

## 🎯 Quick Start Commands

### Complete Setup (First Time)

```bash
# Backend
cd Cofat_Capacity_Study-backend
npm install xlsx
npm start

# Frontend (new terminal)
cd Cofat_Capacity_front
npm start

# Browser
# Navigate to: http://localhost:4000
# Login and click "Non Industrial Budget"
```

### Daily Usage

```bash
# Start backend
cd Cofat_Capacity_Study-backend
npm start

# Start frontend
cd Cofat_Capacity_front
npm start
```

---

## ✅ Installation Checklist

### Backend Setup
- [ ] Navigate to backend folder
- [ ] Run `npm install xlsx`
- [ ] Verify all files created
- [ ] Start backend server
- [ ] Check console for success messages
- [ ] Test API endpoints

### Frontend Setup
- [ ] Verify all files created
- [ ] Check Sidebar has new menu item
- [ ] Check App.js has new route
- [ ] Start frontend server
- [ ] Login to application
- [ ] Navigate to Non Industrial Budget

### Data Import
- [ ] Close Excel file
- [ ] Choose import method
- [ ] Run import
- [ ] Check import results
- [ ] Verify data in database
- [ ] Check data in UI

### Testing
- [ ] Test adding new item
- [ ] Test editing item
- [ ] Test deleting item
- [ ] Test batch operations
- [ ] Test role permissions
- [ ] Test department switching
- [ ] Test total calculations

---

## 🎉 Success!

If you see the Non Industrial Budget module with department tabs and can add/edit items, congratulations! The installation is complete.

**Next Steps:**
1. Import your Excel data
2. Configure user roles
3. Train users on the system
4. Start managing budgets!

---

## 📞 Support

If you encounter any issues:

1. Check this guide's troubleshooting section
2. Review the main guide: `NON_INDUSTRIAL_BUDGET_GUIDE.md`
3. Check console logs for errors
4. Verify all files are in correct locations
5. Ensure all dependencies are installed

**Key Files to Check:**
- Backend: `models/NonIndustrialBudget.js`
- Backend: `routers/nonIndustrialBudgetRoutes.js`
- Frontend: `components/user/pages/NonIndustrialBudget.js`
- Config: `main.js`, `App.js`, `Sidebar.js`

Good luck! 🚀
