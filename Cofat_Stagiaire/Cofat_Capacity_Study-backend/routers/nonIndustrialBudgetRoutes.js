const express = require('express');
const router = express.Router();
const NonIndustrialBudget = require('../models/NonIndustrialBudget');
const { Op } = require('sequelize');
const sequelize = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { importBudgetFromExcel, exportBudgetToExcel } = require('../utils/excelImporter');
const XLSX = require('xlsx');
const {
  createBudgetNotification,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../utils/budgetNotificationHelper');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../Uploads/budget');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'budget-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// 🔍 GET - Recherche avec filtres (department, area, equipment, etc.)
router.get('/search', async (req, res) => {
  try {
    const { department, area, equipment, currency, searchTerm } = req.query;

    console.log('🔍 GET /search - Paramètres de recherche:', { department, area, equipment, currency, searchTerm });

    // Construire les conditions de recherche
    const whereConditions = {};

    // Filtre par département (peut être multiple: "IT,HR")
    if (department) {
      const departments = department.split(',').map(d => d.trim().toUpperCase());
      whereConditions.department = { [Op.in]: departments };
    }

    // Filtre par area
    if (area) {
      whereConditions.area = { [Op.like]: `%${area}%` };
    }

    // Filtre par equipment
    if (equipment) {
      whereConditions.equipment = { [Op.like]: `%${equipment}%` };
    }

    // Filtre par currency
    if (currency) {
      whereConditions.currency = currency.toUpperCase();
    }

    // Recherche globale - Prioriser le département exact
    if (searchTerm) {
      const searchUpper = searchTerm.toUpperCase();
      const validDepartments = ['IT', 'HR', 'QUALITY', 'BUILDING', 'LOGISTICS', 'MAINTENANCE', 'PRODUCTION'];

      // Si c'est un département valide, chercher exactement
      if (validDepartments.includes(searchUpper)) {
        whereConditions.department = searchUpper;
      } else {
        // Sinon, chercher dans tous les champs
        whereConditions[Op.or] = [
          { department: { [Op.like]: `%${searchTerm}%` } },
          { area: { [Op.like]: `%${searchTerm}%` } },
          { equipment: { [Op.like]: `%${searchTerm}%` } },
          { currency: { [Op.like]: `%${searchTerm}%` } }
        ];
      }
    }

    const budgets = await NonIndustrialBudget.findAll({
      where: whereConditions,
      order: [['id', 'ASC']]
    });

    console.log(`📊 Résultats de recherche:`, budgets.length, 'items trouvés');

    // Calculate total
    const total = budgets.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);

    res.json({
      success: true,
      data: budgets,
      total: total.toFixed(2),
      count: budgets.length,
      filters: { department, area, equipment, currency, searchTerm }
    });
  } catch (error) {
    console.error('❌ Error searching budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching budgets',
      error: error.message
    });
  }
});

// 📊 GET - Récupérer tous les budgets d'un département
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;

    console.log('🔍 GET /department/:department - Département demandé:', department);

    // Validate department
    const validDepartments = ['IT', 'HR', 'QUALITY', 'BUILDING', 'LOGISTICS', 'MAINTENANCE', 'PRODUCTION'];
    if (!validDepartments.includes(department.toUpperCase())) {
      console.log('❌ Département invalide:', department);
      return res.status(400).json({
        success: false,
        message: 'Invalid department name'
      });
    }

    const budgets = await NonIndustrialBudget.findAll({
      where: { department: department.toUpperCase() },
      order: [['id', 'ASC']]  // Changé de createdAt à id pour un ordre cohérent
    });

    console.log(`📊 Données trouvées pour ${department}:`, budgets.length, 'items');
    if (budgets.length > 0) {
      console.log('Premier item:', {
        id: budgets[0].id,
        department: budgets[0].department,
        equipment: budgets[0].equipment,
        area: budgets[0].area
      });
    }

    // Calculate total for the department
    const total = budgets.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);

    res.json({
      success: true,
      data: budgets,
      total: total.toFixed(2),
      count: budgets.length
    });
  } catch (error) {
    console.error('❌ Error fetching department budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department budgets',
      error: error.message
    });
  }
});

// 📊 GET - Récupérer tous les budgets (tous départements)
router.get('/all', async (req, res) => {
  try {
    const budgets = await NonIndustrialBudget.findAll({
      order: [['department', 'ASC'], ['createdAt', 'DESC']]
    });

    // Group by department and calculate totals
    const groupedData = budgets.reduce((acc, item) => {
      const dept = item.department;
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          items: [],
          total: 0
        };
      }
      acc[dept].items.push(item);
      acc[dept].total += parseFloat(item.totalPrice || 0);
      return acc;
    }, {});

    // Calculate grand total
    const grandTotal = Object.values(groupedData).reduce((sum, dept) => sum + dept.total, 0);

    res.json({
      success: true,
      data: groupedData,
      grandTotal: grandTotal.toFixed(2),
      totalItems: budgets.length
    });
  } catch (error) {
    console.error('Error fetching all budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all budgets',
      error: error.message
    });
  }
});

// 📊 GET - Récupérer un budget spécifique par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await NonIndustrialBudget.findByPk(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget item not found'
      });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Error fetching budget item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget item',
      error: error.message
    });
  }
});

// ✏️ POST - Créer un nouveau budget
router.post('/create', async (req, res) => {
  try {
    const {
      department,
      area,
      equipment,
      qty,
      currency,
      unitPrice,
      createdBy
    } = req.body;

    // Validation
    if (!department || !equipment || !qty || !currency || !unitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: department, equipment, qty, currency, unitPrice'
      });
    }

    // Create new budget item
    const newBudget = await NonIndustrialBudget.create({
      department: department.toUpperCase(),
      area: area || '',
      equipment,
      qty: parseInt(qty),
      currency,
      unitPrice: parseFloat(unitPrice),
      createdBy: createdBy || 'system'
    });

    // 🔔 Créer une notification pour le rôle Achat
    try {
      await createBudgetNotification({
        type: 'NEW_REQUEST',
        department: department.toUpperCase(),
        budgetItemId: newBudget.id,
        fromUser: createdBy || 'system',
        toRole: 'Achat',
        equipment: equipment,
        amount: newBudget.totalPrice
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Ne pas bloquer la création si la notification échoue
    }

    res.status(201).json({
      success: true,
      message: 'Budget item created successfully',
      data: newBudget
    });
  } catch (error) {
    console.error('Error creating budget item:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating budget item',
      error: error.message
    });
  }
});

// 🔄 PUT - Mettre à jour un budget existant
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      area,
      equipment,
      qty,
      currency,
      unitPrice,
      updatedBy
    } = req.body;

    const budget = await NonIndustrialBudget.findByPk(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget item not found'
      });
    }

    // Déterminer le rôle de l'utilisateur
    const userRole = req.headers['x-user-role'] || req.body.userRole;

    // Vérifier les permissions selon le rôle
    if (userRole === 'Achat') {
      // Achat peut seulement modifier currency et unitPrice
      if (currency !== undefined) budget.currency = currency;
      if (unitPrice !== undefined) budget.unitPrice = parseFloat(unitPrice);
      if (updatedBy !== undefined) budget.updatedBy = updatedBy;
    } else {
      // Les autres rôles peuvent modifier tous les champs
      if (area !== undefined) budget.area = area;
      if (equipment !== undefined) budget.equipment = equipment;
      if (qty !== undefined) budget.qty = parseInt(qty);
      if (currency !== undefined) budget.currency = currency;
      if (unitPrice !== undefined) budget.unitPrice = parseFloat(unitPrice);
      if (updatedBy !== undefined) budget.updatedBy = updatedBy;
    }

    await budget.save();

    const isPriceUpdate = (currency !== undefined || unitPrice !== undefined) && userRole === 'Achat';

    // 🔔 Créer une notification selon le contexte
    try {
      if (isPriceUpdate) {
        // Si Achat met à jour le prix → notifier le User qui a créé l'item
        await createBudgetNotification({
          type: 'PRICE_UPDATED',
          department: budget.department,
          budgetItemId: budget.id,
          fromUser: updatedBy || 'Achat',
          toRole: 'User',
          toUser: budget.createdBy,
          equipment: budget.equipment,
          amount: budget.totalPrice
        });
      } else if (userRole === 'User') {
        // Si User modifie → notifier Achat
        await createBudgetNotification({
          type: 'REQUEST_MODIFIED',
          department: budget.department,
          budgetItemId: budget.id,
          fromUser: updatedBy || 'User',
          toRole: 'Achat',
          equipment: budget.equipment,
          amount: budget.totalPrice
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Budget item updated successfully',
      data: budget
    });
  } catch (error) {
    console.error('Error updating budget item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating budget item',
      error: error.message
    });
  }
});

// 🔄 PUT - Mettre à jour plusieurs budgets (batch update)
router.put('/batch-update', async (req, res) => {
  try {
    const { items, updatedBy, userRole } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    // Déterminer le rôle de l'utilisateur
    const role = req.headers['x-user-role'] || userRole;

    const updatePromises = items.map(async (item) => {
      const budget = await NonIndustrialBudget.findByPk(item.id);
      if (budget) {
        // Vérifier les permissions selon le rôle
        if (role === 'Achat') {
          // Achat peut seulement modifier currency et unitPrice
          if (item.currency !== undefined) budget.currency = item.currency;
          if (item.unitPrice !== undefined) budget.unitPrice = parseFloat(item.unitPrice);
        } else {
          // Les autres rôles peuvent modifier tous les champs
          if (item.area !== undefined) budget.area = item.area;
          if (item.equipment !== undefined) budget.equipment = item.equipment;
          if (item.qty !== undefined) budget.qty = parseInt(item.qty);
          if (item.currency !== undefined) budget.currency = item.currency;
          if (item.unitPrice !== undefined) budget.unitPrice = parseFloat(item.unitPrice);
        }
        budget.updatedBy = updatedBy || 'system';
        await budget.save();
        return budget;
      }
      return null;
    });

    const updatedBudgets = await Promise.all(updatePromises);
    const successfulUpdates = updatedBudgets.filter(b => b !== null);

    res.json({
      success: true,
      message: `${successfulUpdates.length} budget items updated successfully`,
      data: successfulUpdates
    });
  } catch (error) {
    console.error('Error batch updating budget items:', error);
    res.status(500).json({
      success: false,
      message: 'Error batch updating budget items',
      error: error.message
    });
  }
});

// 🗑️ DELETE - Supprimer un budget
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await NonIndustrialBudget.findByPk(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget item not found'
      });
    }

    await budget.destroy();

    res.json({
      success: true,
      message: 'Budget item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting budget item',
      error: error.message
    });
  }
});

// 🗑️ DELETE - Supprimer plusieurs budgets (batch delete)
router.delete('/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required and must not be empty'
      });
    }

    const deletedCount = await NonIndustrialBudget.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });

    res.json({
      success: true,
      message: `${deletedCount} budget items deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error('Error batch deleting budget items:', error);
    res.status(500).json({
      success: false,
      message: 'Error batch deleting budget items',
      error: error.message
    });
  }
});

// 📊 GET - Obtenir les types de devises disponibles
router.get('/meta/currencies', async (req, res) => {
  try {
    // Get distinct currencies from database
    const currencies = await NonIndustrialBudget.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('currency')), 'currency']],
      raw: true
    });

    // Default currencies if none exist
    const defaultCurrencies = ['USD', 'EUR', 'TND', 'MAD', 'BRL', 'EGP'];
    const existingCurrencies = currencies.map(c => c.currency);
    const allCurrencies = [...new Set([...defaultCurrencies, ...existingCurrencies])];

    res.json({
      success: true,
      data: allCurrencies
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching currencies',
      error: error.message
    });
  }
});

// 📊 GET - Obtenir les statistiques par département
router.get('/stats/by-department', async (req, res) => {
  try {
    const budgets = await NonIndustrialBudget.findAll();

    // Recalculate everything to ensure accuracy
    const stats = budgets.reduce((acc, item) => {
      const dept = item.department;
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          totalItems: 0,
          totalAmount: 0,
          totalQty: 0
        };
      }
      acc[dept].totalItems++;
      const qty = parseInt(item.qty || 0);
      const unitPrice = parseFloat(item.unitPrice || 0);
      acc[dept].totalAmount += (qty * unitPrice);
      acc[dept].totalQty += qty;
      return acc;
    }, {});

    // Finalize formatting
    const formattedData = Object.values(stats).map(stat => ({
      ...stat,
      totalAmount: parseFloat(stat.totalAmount.toFixed(2))
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department stats',
      error: error.message
    });
  }
});

// 📤 POST - Import budget data from Excel file
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const importedBy = req.body.importedBy || req.headers['x-user-name'] || 'system';
    const results = await importBudgetFromExcel(req.file.path, importedBy);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json(results);

  } catch (error) {
    console.error('Error importing Excel file:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing Excel file',
      error: error.message
    });
  }
});

// 📥 GET - Export budget data to Excel file
router.get('/export/:department?', async (req, res) => {
  try {
    const { department } = req.params;
    const workbook = await exportBudgetToExcel(department);

    // Generate filename
    const filename = department
      ? `budget_${department}_${Date.now()}.xlsx`
      : `budget_all_departments_${Date.now()}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write workbook to response
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting to Excel',
      error: error.message
    });
  }
});

// 🔔 GET - Récupérer les notifications non lues
router.get('/notifications/unread', async (req, res) => {
  try {
    const role = req.query.role || req.headers['x-user-role'];
    const username = req.query.username || req.headers['x-user-name'];

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const notifications = await getUnreadNotifications(role, username);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// 🔔 GET - Obtenir le nombre de notifications non lues
router.get('/notifications/count', async (req, res) => {
  try {
    const role = req.query.role || req.headers['x-user-role'];
    const username = req.query.username || req.headers['x-user-name'];

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const count = await getUnreadCount(role, username);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification count',
      error: error.message
    });
  }
});

// 🔔 PUT - Marquer une notification comme lue
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await markAsRead(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// 🔔 PUT - Marquer toutes les notifications comme lues
router.put('/notifications/read-all', async (req, res) => {
  try {
    const role = req.body.role || req.headers['x-user-role'];
    const username = req.body.username || req.headers['x-user-name'];

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const result = await markAllAsRead(role, username);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      updated: result[0]
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
});

module.exports = router;
