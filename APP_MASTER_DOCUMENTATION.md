# 🛸 NVCapacity (Cofat Capacity Study) - Mega Documentation

## 1. 🏗️ High-Level Architecture
The application follows a standard **MERN-like** architecture (using SQLite/Sequelize instead of MongoDB) with a focused modular structure.

*   **Frontend:** Single Page Application (SPA) built with **React 18**, utilizing **React Router v6** for navigation and **Context API** for global state (Auth).
*   **Backend:** RESTful API built with **Node.js** and **Express**.
*   **Database:** **Sequelize ORM** managing an **SQLite** (or MySQL) database, handling relations between Sites, Equipment, and Planning data.

---

## 2. 🗄️ Detailed Database Schema (Sequelize)

### **Core Entities**
| Model | Table Name | Key Fields | Purpose |
| :--- | :--- | :--- | :--- |
| **User** | `CofatSearch_User` | `UserId`, `Username`, `Email`, `Password`, `Role` (admin, user, Achat) | Authentication and ACL. |
| **Site** | `Sites` | `id`, `nom`, `code`, `pays`, `actif` | Geographical grouping for all data. |
| **Equipment** | `Equipments` | `id`, `equipmentId`, `nom`, `imagePath`, `referenceEquipment` | Machine master catalog. |
| **EquipmentPlanning** | `EquipmentPlanning` | `year`, `month`, `machineNeed`, `availableMachine`, `load`, `toOrder` | Capacity planning time-series. |
| **Spaces** | `Spaces` | `type`, `category`, `year`, `month`, `area` | Workplace sqm management. |
| **HR** | `HR` | `type`, `category`, `rowOrder`, `year`, `month`, `count` | Workforce planning. |
| **NonIndustrialBudget** | `NonIndustrialBudget` | `department`, `equipment`, `qty`, `unitPrice`, `totalPrice` | Budgeting for non-production items. |
| **StandardInvestment** | `StandardInvestments` | `code_eq`, `operation`, `cost_euro`, `QTY` | Reference price library. |

### **Special Hooks & Logic**
*   **Budget Calculation:** `NonIndustrialBudget` has `beforeValidate` and `beforeUpdate` hooks that automatically calculate `totalPrice = qty * unitPrice`.
*   **User Creation:** `User` has a `beforeCreate` hook to format `CreatedAt` to `YYYY-MM-DD`.

---

## 3. 🌐 API Endpoint Map (Backend)

Base URL: `http://localhost:9001/api`

| Path | Router File | Description |
| :--- | :--- | :--- |
| `/auth` | `Auth-routers.js` | Login, Signin, Logout logic. |
| `/api/sites` | `siteRoutes.js` | CRUD for manufacturing sites. |
| `/api/equipment` | `equipmentRoutes.js` | Machine catalog management. |
| `/api/equipment-planning`| `equipmentplaningRoutes.js`| Core capacity logic (Load, Needs). |
| `/api/space` | `spaceRoutes.js` | Area management routes. |
| `/api/hr` | `hrRoutes.js` | Headcount planning routes. |
| `/api/non-industrial-budget`| `nonIndustrialBudgetRoutes.js`| Budgeting with auto-calculations. |
| `/api/cofat-group` | `cofatGroupRoutes.js` | **Consolidation engine** (Sum of all sites). |
| `/api/notifications` | `notifications.js` | Persistent alert system. |

---

## 4. 💻 Frontend Deep-Dive

### **Core Routing (`App.js`)**
*   **Public:** `/login`, `/contact`.
*   **Protected (`PrivateRoute`):** `/menu`, `/standard-equipment`.
*   **Role-Based (`RoleBasedRoute`):** 
    *   `admin`: Access to `/admin/dashboard`.
    *   `admin`/`user`: Access to `/equipment/:site`, `/space/:site`, `/hr/:site`.
    *   `Achat`: Specifically enabled for consolidation and standard investment views.

### **State Management**
*   **AuthContext:** Provides `user`, `role`, `isAuthenticated`, and `login/logout` functions globally.
*   **Layout Component:** Wraps pages to provide a consistent `Navbar` and `Sidebar` based on route props.

---

## 5. 🧮 Business Calculation Engine

### **A. Machine Load (%)**
*   **Formula:** `Load = (Machine Need / Available Machines) * 100`.
*   **Logic:** If `Machine Need` > `Available Machine`, the system suggests a `To Order` quantity.

### **B. Space Occupation (%)**
*   **Formula:** `Occupation = (Total Area Needed / Total Plant Area) * 100`.
*   **Logic:** `Total Area Needed` is the sum of Cutting Area + Lead Prep + Assembly (all projects).

### **C. HR Consolidation Rule**
*   **Direct:** Cutting and Lead Prep are summed by type across sites.
*   **Indirect:** Departments with similar names (e.g., "Production (Leader)" and "Production") are normalized and grouped into a single "Production" row for global view.

---

## 6. 🌍 The Consolidation Logic (CofatGroup)
This is the "killer feature" of the app.
1.  **Backend Fetch:** Grabs every row for a specific period from **all** sites.
2.  **Normalization:** Standardizes types (e.g., trimming spaces, case-insensitive matching).
3.  **Aggregation:** Sums the `area`, `count`, or `machineNeed` for each period (MO 01-12, Q 01-04).
4.  **UI Injection:** The data is sent to specialized components (`CofatGroupSpace`, `CofatGroupHr`) that use the exact same grid layout as the single-site view, allowing for instant comparison.

---

## 📅 Planning Periods (2025-2027)
*   **2025:** 12 Monthly columns (`MO 01` to `MO 12`).
*   **2026:** 4 Quarterly columns (`Q 01` to `Q 04`).
*   **2027:** 4 Quarterly columns (`Q 01` to `Q 04`).

---

## 🚀 Summary of Major Technical Improvements
1.  **Achat Access Fix:** Restored visibility for the Purchasing role to see consolidated equipment without needing full Admin rights.
2.  **Dynamic HR Grouping:** Implemented a fuzzy-matching logic in `cofatGroupRoutes.js` to group "Eng", "Engineering", and "Eng (Agent)" together.
3.  **Decimal Precision:** Updated `EquipmentPlanning` logic to handle float values for `machineNeed` to avoid rounding errors in consolidation.
4.  **Persistent Notifications:** Budget alerts now persist even after page refresh using a database-backed notification model.
5.  **Layout Responsiveness:** Standardized the sidebar/navbar injection using the `Layout` wrapper in `App.js`.

---

## 🛠️ Developer Roadmap (How to run)
1.  **Install dependencies** in both `Cofat_Capacity_front` and `Cofat_Capacity_Study-backend`.
2.  **Environment:** Ensure `db.js` points to the correct SQLite file.
3.  **Run Backend:** `node main.js` (runs on 9001).
4.  **Run Frontend:** `npm start` (runs on 4000).

---

*This document is the master engineering handbook for the NVCapacity project. Refer to `PROJECT_DIAGRAMS_REFERENCE.md` for visual models.*
