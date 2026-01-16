# 💰 Non Industrial Budget Module - Complete Guide

## 📋 Overview
The **Non Industrial Budget** module is a comprehensive budget management system for non-industrial departments. It provides an intuitive interface for managing budgets across 7 departments with role-based access control.

---

## 🎯 Features

### ✨ Core Functionality
- **7 Department Management**: IT, HR, QUALITY, BUILDING, LOGISTICS, MAINTENANCE, PRODUCTION
- **Dynamic Data Tables**: Each department has its own budget table with identical structure
- **Multi-Currency Support**: USD, EUR, TND, MAD, BRL, EGP
- **Automatic Calculations**: Total price auto-calculated from Qty × Unit Price
- **Batch Operations**: Select and save/delete multiple items at once
- **Real-time Totals**: Automatic calculation of department totals
- **Role-Based Permissions**: Different access levels for different user roles

### 🎨 Innovative UI Features
- **Modern Tab Navigation**: Beautiful department tabs with icons and colors
- **Inline Editing**: Edit data directly in the table
- **Smart Form**: Collapsible add-new-item form with validation
- **Visual Feedback**: Color-coded departments, status badges, and hover effects
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Elegant loading and empty state designs

---

## 👥 User Roles & Permissions

### 🔐 Role: **Achat** (Purchase)
**Can Edit:**
- ✅ Currency (via dropdown select)
- ✅ Unit Price

**Cannot Edit:**
- ❌ Department
- ❌ Area
- ❌ Equipment
- ❌ Quantity

### 🔐 Role: **Admin**
**Can Edit:**
- ✅ All fields
- ✅ Full CRUD operations
- ✅ Batch operations

### 🔐 Role: **User** (Standard)
**Can Edit:**
- ✅ All fields except Department
- ✅ Add new items
- ✅ Delete items

---

## 📊 Data Structure

### Database Table: `NonIndustrialBudget`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key, auto-increment |
| `department` | STRING(50) | Department name (IT, HR, etc.) |
| `area` | STRING(100) | Area/Category (optional) |
| `equipment` | STRING(255) | Equipment/Item name |
| `qty` | INTEGER | Quantity |
| `currency` | STRING(10) | Currency code (USD, EUR, etc.) |
| `unitPrice` | DECIMAL(15,2) | Price per unit |
| `totalPrice` | DECIMAL(15,2) | Auto-calculated: qty × unitPrice |
| `status` | STRING(20) | pending, approved, rejected |
| `createdBy` | STRING(100) | User who created the entry |
| `updatedBy` | STRING(100) | User who last updated |
| `createdAt` | TIMESTAMP | Creation timestamp |
| `updatedAt` | TIMESTAMP | Last update timestamp |

---

## 🔌 API Endpoints

### Backend Routes: `/api/non-industrial-budget`

#### 📊 GET Endpoints

```javascript
// Get all budgets for a specific department
GET /api/non-industrial-budget/department/:department
Response: {
  success: true,
  data: [...],
  total: "12345.67",
  count: 25
}

// Get all budgets (all departments)
GET /api/non-industrial-budget/all
Response: {
  success: true,
  data: { IT: {...}, HR: {...}, ... },
  grandTotal: "123456.78",
  totalItems: 150
}

// Get a specific budget item
GET /api/non-industrial-budget/:id

// Get available currencies
GET /api/non-industrial-budget/meta/currencies

// Get statistics by department
GET /api/non-industrial-budget/stats/by-department
```

#### ✏️ POST Endpoints

```javascript
// Create a new budget item
POST /api/non-industrial-budget/create
Body: {
  department: "IT",
  area: "Software",
  equipment: "Microsoft Office License",
  qty: 10,
  currency: "USD",
  unitPrice: 299.99,
  createdBy: "john.doe"
}
```

#### 🔄 PUT Endpoints

```javascript
// Update a single budget item
PUT /api/non-industrial-budget/update/:id
Body: {
  qty: 15,
  unitPrice: 279.99,
  updatedBy: "jane.smith"
}

// Batch update multiple items
PUT /api/non-industrial-budget/batch-update
Body: {
  items: [
    { id: 1, qty: 5, unitPrice: 100 },
    { id: 2, currency: "EUR", unitPrice: 200 }
  ],
  updatedBy: "admin"
}
```

#### 🗑️ DELETE Endpoints

```javascript
// Delete a single item
DELETE /api/non-industrial-budget/delete/:id

// Batch delete multiple items
DELETE /api/non-industrial-budget/batch-delete
Body: {
  ids: [1, 2, 3, 4, 5]
}
```

---

## 🎨 Frontend Components

### Main Component: `NonIndustrialBudget.js`
**Location:** `src/components/user/pages/NonIndustrialBudget.js`

**Key Features:**
- Department tab navigation
- Inline table editing
- Batch selection and operations
- Add new item form
- Real-time total calculations
- Role-based field restrictions

### Styling: `NonIndustrialBudget.css`
**Location:** `src/components/user/pages/style/NonIndustrialBudget.css`

**Design System:**
- Modern gradient backgrounds
- Smooth transitions and animations
- Responsive grid layouts
- Color-coded departments
- Professional table styling

---

## 🚀 Usage Guide

### For Regular Users

1. **Navigate to Module**
   - Click "Non Industrial Budget" in the sidebar
   - Dollar sign icon (💰)

2. **Select Department**
   - Click on any department tab (IT, HR, Quality, etc.)
   - View department-specific budget items

3. **Add New Item**
   - Click "Add New Item" button
   - Fill in the form:
     - Area (optional)
     - Equipment (required)
     - Quantity (required)
     - Currency (required)
     - Unit Price (required)
   - Total Price is calculated automatically
   - Click "Add Item" to save

4. **Edit Existing Items**
   - Click directly in table cells to edit
   - Changes are highlighted
   - Select rows using checkboxes

5. **Save Changes**
   - Select one or more rows
   - Click "Save Selected" button
   - Confirmation message appears

6. **Delete Items**
   - Select rows to delete
   - Click "Delete Selected"
   - Confirm deletion

### For Achat Role Users

1. **Limited Editing**
   - Can only edit Currency and Unit Price fields
   - Other fields are read-only

2. **Currency Selection**
   - Click on Currency dropdown
   - Select from available currencies
   - Change applies to that row

3. **Price Updates**
   - Click on Unit Price field
   - Enter new price
   - Total Price updates automatically

4. **Save Changes**
   - Select edited rows
   - Click "Save Selected"
   - Changes are saved to database

---

## 🔧 Technical Implementation

### Backend Architecture

```
models/
  └── NonIndustrialBudget.js    # Sequelize model with hooks

routers/
  └── nonIndustrialBudgetRoutes.js    # Express routes

main.js                          # Route registration
```

### Frontend Architecture

```
components/user/pages/
  ├── NonIndustrialBudget.js    # Main component
  └── style/
      └── NonIndustrialBudget.css    # Styling

App.js                           # Route definition
Sidebar.js                       # Navigation menu
```

### State Management

```javascript
// Component State
const [activeDepartment, setActiveDepartment] = useState('IT');
const [budgetData, setBudgetData] = useState([]);
const [selectedRows, setSelectedRows] = useState([]);
const [showAddForm, setShowAddForm] = useState(false);
const [currencies, setCurrencies] = useState([...]);
const [departmentTotals, setDepartmentTotals] = useState({});
```

### Key Functions

```javascript
// Load department data
loadDepartmentData(department)

// Handle row selection
handleRowSelect(id)
handleSelectAll()

// CRUD operations
handleAddItem()
handleUpdateRow(id, field, value)
handleSaveSelected()
handleDeleteSelected()

// Calculations
calculateTotal()
```

---

## 🎯 Department Configuration

Each department has:
- **Unique ID**: IT, HR, QUALITY, etc.
- **Display Name**: IT, HR, Quality, etc.
- **Icon**: Emoji representation
- **Color**: Brand color for visual distinction

```javascript
const departments = [
  { id: 'IT', name: 'IT', icon: '💻', color: '#3b82f6' },
  { id: 'HR', name: 'HR', icon: '👥', color: '#8b5cf6' },
  { id: 'QUALITY', name: 'Quality', icon: '✓', color: '#10b981' },
  { id: 'BUILDING', name: 'Building', icon: '🏢', color: '#f59e0b' },
  { id: 'LOGISTICS', name: 'Logistics', icon: '📦', color: '#ef4444' },
  { id: 'MAINTENANCE', name: 'Maintenance', icon: '🔧', color: '#6366f1' },
  { id: 'PRODUCTION', name: 'Production', icon: '⚙️', color: '#14b8a6' }
];
```

---

## 📱 Responsive Design

### Desktop (> 1200px)
- Full table view
- Multi-column form grid
- All features visible

### Tablet (768px - 1200px)
- 2-column form grid
- Horizontal scrolling for table
- Compact action buttons

### Mobile (< 768px)
- Single-column form
- Full horizontal scroll for table
- Stacked action buttons
- Collapsible sections

---

## 🔒 Security Features

1. **Role-Based Access Control**
   - Field-level permissions
   - Route protection
   - User authentication required

2. **Data Validation**
   - Required field checks
   - Type validation (numbers, strings)
   - Department enum validation
   - Min/max value constraints

3. **SQL Injection Prevention**
   - Sequelize ORM parameterized queries
   - Input sanitization

4. **CORS Protection**
   - Configured allowed origins
   - Credentials support

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Create new budget item
- [ ] Edit existing item (all fields)
- [ ] Delete single item
- [ ] Batch update multiple items
- [ ] Batch delete multiple items
- [ ] Switch between departments
- [ ] Total calculation accuracy
- [ ] Currency selection
- [ ] Form validation

### Role-Based Tests
- [ ] Admin: Full access
- [ ] Achat: Limited to currency & price
- [ ] User: Standard access
- [ ] Unauthorized: No access

### UI/UX Tests
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Loading states
- [ ] Empty states
- [ ] Error messages
- [ ] Success notifications
- [ ] Smooth animations

---

## 🐛 Troubleshooting

### Issue: Data not loading
**Solution:**
1. Check backend server is running
2. Verify database connection
3. Check browser console for errors
4. Verify API endpoint URLs

### Issue: Cannot edit fields
**Solution:**
1. Check user role permissions
2. Verify authentication token
3. Check field-level restrictions

### Issue: Total not calculating
**Solution:**
1. Verify qty and unitPrice are numbers
2. Check model hooks are working
3. Refresh the page

### Issue: Save button not working
**Solution:**
1. Select at least one row
2. Check for validation errors
3. Verify backend route is accessible

---

## 📈 Future Enhancements

### Planned Features
- [ ] Export to Excel
- [ ] Import from Excel
- [ ] Budget approval workflow
- [ ] Email notifications
- [ ] Budget vs Actual comparison
- [ ] Historical data tracking
- [ ] Advanced filtering
- [ ] Search functionality
- [ ] Budget templates
- [ ] Multi-year planning

### Performance Optimizations
- [ ] Pagination for large datasets
- [ ] Virtual scrolling
- [ ] Debounced search
- [ ] Cached department totals
- [ ] Lazy loading

---

## 📞 Support

### Key Files
- **Backend Model**: `models/NonIndustrialBudget.js`
- **Backend Routes**: `routers/nonIndustrialBudgetRoutes.js`
- **Frontend Component**: `components/user/pages/NonIndustrialBudget.js`
- **Styling**: `components/user/pages/style/NonIndustrialBudget.css`

### Database Table
- **Table Name**: `NonIndustrialBudget`
- **Database**: GALIA_V1
- **Server**: 172.20.53.10

### API Base URL
- **Development**: `http://localhost:3005/api/non-industrial-budget`
- **Network**: `http://172.20.79.39:3005/api/non-industrial-budget`

---

## ✅ Implementation Checklist

### Backend ✅
- [x] Create NonIndustrialBudget model
- [x] Create budget routes
- [x] Register routes in main.js
- [x] Add model to index.js
- [x] Database synchronization

### Frontend ✅
- [x] Create NonIndustrialBudget component
- [x] Create CSS styling
- [x] Add route to App.js
- [x] Add menu item to Sidebar
- [x] Implement role-based permissions
- [x] Add form validation
- [x] Implement batch operations

### Features ✅
- [x] Department tabs
- [x] Add new item form
- [x] Inline editing
- [x] Multi-select rows
- [x] Batch save
- [x] Batch delete
- [x] Auto-calculate totals
- [x] Currency dropdown
- [x] Role-based field restrictions
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [x] Success notifications

---

## 🎉 Conclusion

The **Non Industrial Budget** module is now fully implemented and ready for use! It provides a modern, intuitive interface for managing budgets across all non-industrial departments with comprehensive role-based access control.

**Key Highlights:**
- ✨ Beautiful, modern UI with smooth animations
- 🔒 Secure role-based permissions
- 📊 Real-time calculations and totals
- 🚀 Fast and responsive
- 💪 Robust error handling
- 📱 Mobile-friendly design

**Access the module:**
Navigate to **Sidebar → Non Industrial Budget** (💰 icon)

Enjoy managing your budgets! 💰
