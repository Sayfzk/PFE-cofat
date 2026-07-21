import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import useTheme from '../../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import axios from '../../../utils/axiosInstance';
import Swal from 'sweetalert2';
import {
  Plus,
  Save,
  Trash2,
  DollarSign,
  TrendingUp,
  Edit3,
  Check,
  RefreshCw,
  Search,
  ChevronDown,
  Loader,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Settings
} from 'lucide-react';
import {
  Box,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PieChartIcon from '@mui/icons-material/PieChart';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useNotifications from '../../../hooks/useNotifications';
import './style/NonIndustrialBudget.css';
import './style/NonIndustrialBudget_dark.css';
import './style/StandardEquipment_export_dropdown.css';

const NonIndustrialBudget = () => {
  console.log('🚀 NonIndustrialBudget - Composant chargé');

  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();

  const { user } = useAuth();
  console.log('👤 Utilisateur actuel:', user);

  // Hook de notifications
  const {
    notifySaveSuccess,
    notifyDeleteSuccess,
    notifyAddSuccess,
    notifyError
  } = useNotifications('Non Industrial Budget');

  const [activeDepartment, setActiveDepartment] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetData, setBudgetData] = useState([]);
  const [allBudgetData, setAllBudgetData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'TND', 'MAD', 'BRL', 'EGP']);
  const [departmentTotals, setDepartmentTotals] = useState({});
  const [globalGrandTotal, setGlobalGrandTotal] = useState(0);
  const [editingCells, setEditingCells] = useState({});
  const [editedData, setEditedData] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const departments = [
    { id: 'IT', name: 'IT', icon: '💻', color: '#3b82f6' },
    { id: 'HR', name: 'HR', icon: '👥', color: '#8b5cf6' },
    { id: 'QUALITY', name: 'Quality', icon: '✓', color: '#10b981' },
    { id: 'BUILDING', name: 'Building', icon: '🏢', color: '#f59e0b' },
    { id: 'LOGISTICS', name: 'Logistics', icon: '📦', color: '#ef4444' },
    { id: 'MAINTENANCE', name: 'Maintenance', icon: '🔧', color: '#6366f1' },
    { id: 'PRODUCTION', name: 'Production', icon: '⚙️', color: '#14b8a6' }
  ];

  const [newItem, setNewItem] = useState({
    department: selectedDepartments.length > 0 ? selectedDepartments[0] : '',
    area: '',
    equipment: '',
    qty: 1,
    currency: 'USD',
    unitPrice: ''
  });

  // Check user roles
  const isAchat = user && user.role === 'Achat';
  const isAdmin = user && user.role === 'admin';
  const isUser = user && (user.role === 'User' || user.role === 'user');

  console.log('🔐 Rôles détectés - isAchat:', isAchat, 'isAdmin:', isAdmin, 'isUser:', isUser);

  useEffect(() => {
    // Mettre à jour le département du formulaire si nécessaire
    if (selectedDepartments.length > 0) {
      if (!selectedDepartments.includes(newItem.department)) {
        setNewItem(prev => ({ ...prev, department: selectedDepartments[0] }));
      }
    }
    loadCurrencies();
  }, [selectedDepartments]);

  // Charger et filtrer les données (comme Standard Equipment)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (selectedDepartments.length > 0 || searchTerm.trim()) {
        loadBudgetData(selectedDepartments, searchTerm);
      } else {
        setBudgetData([]);
        setAllBudgetData([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedDepartments, searchTerm]);

  // Fermer le dropdown sur clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    loadAllDepartmentStats();
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const loadBudgetData = async (departments, search) => {
    setLoading(true);
    console.log('🔍 Chargement avec:', { departments, search });

    try {
      const params = new URLSearchParams();

      if (departments.length > 0) {
        params.append('department', departments.join(','));
      }

      if (search && search.trim()) {
        params.append('searchTerm', search.trim());
      }

      console.log('🌐 Appel API /search avec params:', params.toString());

      const response = await axios.get(`/api/non-industrial-budget/search?${params.toString()}`);

      if (response.data.success) {
        console.log(`✅ Données chargées: ${response.data.count} items`);
        setAllBudgetData(response.data.data);
        setBudgetData(response.data.data);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de charger les données'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllDepartmentStats = async () => {
    try {
      const response = await axios.get('/api/non-industrial-budget/stats/by-department');
      if (response.data.success) {
        const stats = {};
        let total = 0;
        response.data.data.forEach(stat => {
          stats[stat.department] = stat.totalAmount;
          total += stat.totalAmount;
        });
        setDepartmentTotals(stats);
        setGlobalGrandTotal(total);
      }
    } catch (error) {
      console.error('Error loading department stats:', error);
    }
  };


  const loadCurrencies = async () => {
    try {
      const response = await axios.get('/api/non-industrial-budget/meta/currencies');
      if (response.data.success) {
        setCurrencies(response.data.data);
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

  const handleDepartmentToggle = (deptId) => {
    setSelectedDepartments(prev => {
      if (prev.includes(deptId)) {
        return prev.filter(id => id !== deptId);
      } else {
        return [...prev, deptId];
      }
    });
    setSelectedRows([]);
    setShowAddForm(false);
    setEditingCells({});
    setEditedData({});
  };

  const handleDepartmentChange = (deptId) => {
    setActiveDepartment(deptId);
    setSelectedRows([]);
    setShowAddForm(false);
    setEditingCells({});
    setEditedData({});
    setNewItem({
      department: deptId,
      area: '',
      equipment: '',
      qty: 1,
      currency: 'USD',
      unitPrice: ''
    });
  };

  // Editing functions (like StandardEquipment)
  const startEditing = (itemId, field) => {
    const cellKey = `${itemId}-${field}`;
    setEditingCells(prev => ({ ...prev, [cellKey]: true }));
  };

  const stopEditing = (itemId, field) => {
    const cellKey = `${itemId}-${field}`;
    setEditingCells(prev => {
      const newState = { ...prev };
      delete newState[cellKey];
      return newState;
    });
  };

  const isEditingCell = (itemId, field) => {
    const cellKey = `${itemId}-${field}`;
    return editingCells[cellKey] || false;
  };

  const getCellValue = (item, field) => {
    // Check if there's an edited value
    if (editedData[item.id] && editedData[item.id][field] !== undefined) {
      return editedData[item.id][field];
    }
    return item[field];
  };

  const handleCellEdit = (itemId, field, value) => {
    let finalValue = value;
    if (field === 'unitPrice' && typeof value === 'string') {
      finalValue = value.replace(/^0+(?=\d)/, '');
    }

    setEditedData(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: finalValue
      }
    }));

    // Auto-select row when an edit is made
    if (!selectedRows.includes(itemId)) {
      setSelectedRows(prev => [...prev, itemId]);
    }
  };

  const canEditField = (field) => {
    if (isAdmin) return true;
    if (isUser && (field === 'unitPrice' || field === 'currency')) return false;
    if (isAchat) {
      // Achat can only edit currency and unitPrice
      return ['currency', 'unitPrice'].includes(field);
    }
    // Regular users can edit all fields except totalPrice (calculated)
    return field !== 'totalPrice';
  };

  const hasRowChanges = (itemId) => {
    return editedData[itemId] && Object.keys(editedData[itemId]).length > 0;
  };

  const renderEditableCell = (item, field, displayValue, isNumeric = false) => {
    const isEditing = isEditingCell(item.id, field);
    const currentValue = getCellValue(item, field);
    const hasChanges = hasRowChanges(item.id);
    const canEdit = canEditField(field);
    const isSelected = selectedRows.includes(item.id);

    if (isEditing && canEdit && isSelected) {
      if (field === 'currency') {
        return (
          <div className="editable-cell editing">
            <select
              value={currentValue}
              onChange={(e) => handleCellEdit(item.id, field, e.target.value)}
              onBlur={() => stopEditing(item.id, field)}
              className="cell-input"
              autoFocus
            >
              {currencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            <div className="edit-actions">
              <button
                onClick={() => stopEditing(item.id, field)}
                className="edit-action-btn save"
              >
                <Check size={14} />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="editable-cell editing">
          <input
            type={isNumeric ? "number" : "text"}
            value={currentValue || ''}
            onChange={(e) => handleCellEdit(item.id, field, e.target.value)}
            onBlur={() => stopEditing(item.id, field)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                stopEditing(item.id, field);
              }
              if (e.key === 'Escape') {
                stopEditing(item.id, field);
              }
            }}
            className="cell-input"
            autoFocus
            step={isNumeric ? "0.01" : undefined}
            min={isNumeric ? "0" : undefined}
          />
          <div className="edit-actions">
            <button
              onClick={() => stopEditing(item.id, field)}
              className="edit-action-btn save"
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      );
    }

    if (!canEdit || !isSelected) {
      return (
        <div className={`editable-cell readonly ${hasChanges ? 'has-changes' : ''}`}
          onClick={() => {
            if (canEdit && !isSelected) {
              Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'info',
                title: 'Select row first to edit',
                showConfirmButton: false,
                timer: 2000
              });
            }
          }}>
          <span className="cell-content">
            {displayValue || 'N/A'}
          </span>
          {!canEdit && <span className="readonly-indicator" title="Non modifiable pour votre rôle">🔒</span>}
        </div>
      );
    }

    return (
      <div
        className={`editable-cell ${hasChanges ? 'has-changes' : ''}`}
        onClick={() => startEditing(item.id, field)}
      >
        <span className="cell-content">
          {displayValue || 'N/A'}
        </span>
        <Edit3 className="edit-icon" size={14} />
      </div>
    );
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === budgetData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(budgetData.map(item => item.id));
    }
  };

  const handleSaveSelected = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select at least one row'
      });
      return;
    }

    const itemsToUpdate = selectedRows
      .filter(id => hasRowChanges(id))
      .map(id => ({
        id,
        ...editedData[id]
      }));

    if (itemsToUpdate.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Information',
        text: 'Aucune modification à sauvegarder'
      });
      // Clear selection and editing mode if no changes
      setSelectedRows([]);
      setEditingCells({});
      return;
    }

    const currentSelected = [...selectedRows];
    const currentEditing = { ...editingCells };

    // Uncheck immediately and clear edit cells for instant feedback
    setSelectedRows([]);
    setEditingCells({});

    try {
      const response = await axios.put('/api/non-industrial-budget/batch-update', {
        items: itemsToUpdate,
        updatedBy: user?.username || 'user',
        userRole: user?.role
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${itemsToUpdate.length} row(s) updated`,
          timer: 2000
        });

        // Notification automatique
        notifySaveSuccess({
          count: itemsToUpdate.length,
          summary: `${itemsToUpdate.length} budget row(s) updated`,
          details: `Departments: ${selectedDepartments.join(', ')}`
        });

        // Clear edited data for saved items
        setEditedData(prev => {
          const newData = { ...prev };
          itemsToUpdate.forEach(item => delete newData[item.id]);
          return newData;
        });

        loadBudgetData(selectedDepartments, searchTerm);
        if (typeof loadAllDepartmentStats === 'function') loadAllDepartmentStats();
      } else {
        setSelectedRows(currentSelected);
        setEditingCells(currentEditing);
      }
    } catch (error) {
      setSelectedRows(currentSelected);
      setEditingCells(currentEditing);
      console.error('Error saving:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to save changes'
      });

      // Notification automatique d'erreur
      notifyError(error, 'Saving changes');
    }
  };

  const handleAnalysis = () => {
    if (budgetData.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Information',
        text: 'No data to analyze for the selected department(s).'
      });
      return;
    }

    // Statistiques pour l'analyse
    let totalItems = budgetData.length;
    let mostExpensiveItem = null;
    let maxCost = -1;
    let totalCostUSD = 0; // On suppose tout calculer en format standardisé pour le total global

    budgetData.forEach(item => {
      const q = parseFloat(getCellValue(item, 'qty')) || 0;
      const uPrice = parseFloat(getCellValue(item, 'unitPrice')) || 0;
      const tot = q * uPrice;

      totalCostUSD += tot; // Simple conversion mockup si tout est considéré base USD (ou on reprend calculateTotal())

      if (tot > maxCost) {
        maxCost = tot;
        mostExpensiveItem = {
          name: item.equipment || 'Unknown',
          cost: tot,
          currency: getCellValue(item, 'currency') || 'USD'
        };
      }
    });

    const averageCost = totalItems > 0 ? (totalCostUSD / totalItems) : 0;
    const globalTotalDisplay = calculateTotal(); // En utilisant la méthode d'affichage existante

    const deptText = selectedDepartments.length > 0 ? selectedDepartments.join(', ') : 'All Departments';

    // Rédiger la conclusion écrite
    let analysisHtml = `
      <div style="text-align: left; line-height: 1.6; font-size: 0.95em; color: var(--text-primary);">
        <p>
          Base on the current data for <strong>${deptText}</strong>, there is a total of 
          <span style="color: var(--primary-color); font-weight: bold;">${totalItems} equipment items</span> 
          planned in the Non-Industrial Budget.
        </p>

        <p>
          The <strong>Grand Total</strong> estimated budget reaches 
          <span style="color: var(--success-color); font-weight: bold; font-size: 1.2em;">$${globalTotalDisplay}</span>.
          <br/>
          <span style="font-size: 0.85em; color: var(--text-secondary);">
            <em>* This total represents a direct sum of all items' prices across different currencies, nominally displayed in USD without applying real-time conversion rates.</em>
          </span>
        </p>

        <div style="background-color: var(--bg-secondary); padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid var(--border-medium);">
          <h4 style="margin-top: 0; color: var(--primary-color); border-bottom: 1px solid var(--border-medium); padding-bottom: 5px;">Key Insights</h4>
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">
              The <strong>raw average cost per budget line</strong> is approximately <strong>${averageCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (mixed currencies).
            </li>
            ${mostExpensiveItem ? `
            <li>
              The <strong>most extensive investment</strong> is the <em>"${mostExpensiveItem.name}"</em>, 
              accounting for <strong>${mostExpensiveItem.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${mostExpensiveItem.currency}</strong>.
            </li>
            ` : ''}
          </ul>
        </div>

        <p style="font-style: italic; color: var(--warning-color, #eab308); font-size: 0.85em; margin-top: 15px; padding: 10px; background: rgba(234, 179, 8, 0.1); border-left: 3px solid #eab308;">
          <strong>Important Note:</strong> Because items use varying currencies (${currencies.join(', ')}), the "Grand Total" and "Average Cost" shown are simple aggregations of the numerical values. Please apply proper exchange rates externally for an exact USD financial evaluation.
        </p>
      </div>
    `;

    Swal.fire({
      title: 'Budget Analysis Report',
      html: analysisHtml,
      icon: 'info',
      width: '600px',
      confirmButtonText: 'Got it',
      confirmButtonColor: '#3b82f6',
      customClass: {
        popup: 'non-industrial-budget-analysis-popup'
      }
    });
  };

  // Fonction d'exportation Excel
  const exportToExcel = () => {
    try {
      // Exporter exactement les données affichées dans le tableau
      const dataToExport = budgetData.map((item, index) => ({
        'N°': index + 1,
        'DEPARTMENT': item.department,
        'AREA': item.area || 'N/A',
        'EQUIPMENT': item.equipment,
        'QTY': item.qty,
        'CURRENCY': item.currency,
        'UNIT PRICE': item.unitPrice,
        'TOTAL PRICE': (item.qty * item.unitPrice).toFixed(2)
      }));

      // Ajouter une ligne de total
      const total = budgetData.reduce((sum, item) => {
        return sum + (item.qty * item.unitPrice);
      }, 0);

      dataToExport.push({
        'N°': '',
        'DEPARTMENT': '',
        'AREA': '',
        'EQUIPMENT': '',
        'QTY': '',
        'CURRENCY': '',
        'UNIT PRICE': 'TOTAL',
        'TOTAL PRICE': total.toFixed(2)
      });

      // Créer un workbook
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Non Industrial Budget');

      // Générer le nom du fichier
      const fileName = `Non_Industrial_Budget_${selectedDepartments.join('_') || 'All'}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Télécharger le fichier
      XLSX.writeFile(wb, fileName);

      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `Data exported to ${fileName}`,
        timer: 2000
      });

      console.log('✅ Excel export successful:', fileName);
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Unable to export data to Excel'
      });
    }
  };

  // Fonction d'exportation PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

      // Titre
      doc.setFontSize(18);
      doc.text('Non Industrial Budget', 14, 15);

      // Sous-titre avec départements
      doc.setFontSize(11);
      const deptText = selectedDepartments.length > 0
        ? `Departments: ${selectedDepartments.join(', ')}`
        : 'All Departments';
      doc.text(deptText, 14, 22);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);

      // Préparer les données du tableau
      const tableData = budgetData.map((item, index) => [
        index + 1,
        item.department,
        item.area || 'N/A',
        item.equipment,
        item.qty,
        item.currency,
        item.unitPrice,
        (item.qty * item.unitPrice).toFixed(2)
      ]);

      // Calculer le total
      const total = budgetData.reduce((sum, item) => {
        return sum + (item.qty * item.unitPrice);
      }, 0);

      // Ajouter la ligne de total
      tableData.push([
        '', '', '', '', '', '', 'TOTAL', total.toFixed(2)
      ]);

      // Créer le tableau
      doc.autoTable({
        startY: 32,
        head: [['N°', 'DEPARTMENT', 'AREA', 'EQUIPMENT', 'QTY', 'CURRENCY', 'UNIT PRICE', 'TOTAL PRICE']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 58, 138], fontStyle: 'bold' }, // #1e3a8a en RGB
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 32 },
        // Style spécial pour la dernière ligne (TOTAL)
        didParseCell: function (data) {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [220, 220, 220];
          }
        }
      });

      // Générer le nom du fichier
      const fileName = `Non_Industrial_Budget_${selectedDepartments.join('_') || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Télécharger le PDF
      doc.save(fileName);

      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `Data exported to ${fileName}`,
        timer: 2000
      });

      console.log('✅ PDF export successful:', fileName);
    } catch (error) {
      console.error('❌ Error exporting to PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Unable to export data to PDF'
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select at least one row'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: `Do you really want to delete ${selectedRows.length} row(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete('/api/non-industrial-budget/batch-delete', {
          data: { ids: selectedRows }
        });

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: `${selectedRows.length} row(s) deleted`,
            timer: 2000
          });

          // Notification automatique
          notifyDeleteSuccess({
            count: selectedRows.length,
            summary: `${selectedRows.length} budget row(s) deleted`,
            details: `Departments: ${selectedDepartments.join(', ')}`
          });

          setSelectedRows([]);
          loadBudgetData(selectedDepartments, searchTerm);
          loadAllDepartmentStats();
        }
      } catch (error) {
        console.error('Error deleting:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to delete rows'
        });

        // Notification automatique d'erreur
        notifyError(error, 'Deleting rows');
      }
    }
  };

  const handleAddItem = async () => {
    if (!newItem.equipment || !newItem.qty || !newItem.currency || !newItem.unitPrice) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please fill in all required fields'
      });
      return;
    }

    try {
      const response = await axios.post('/api/non-industrial-budget/create', {
        ...newItem,
        createdBy: user?.username || 'user'
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Item added successfully',
          timer: 2000
        });

        // Notification automatique
        notifyAddSuccess({
          name: newItem.equipment,
          summary: `Budget item added: ${newItem.equipment}`,
          details: `Department: ${newItem.department}, Quantity: ${newItem.qty}, Price: ${newItem.unitPrice} ${newItem.currency}`
        });

        setShowAddForm(false);
        setNewItem({
          department: selectedDepartments.length > 0 ? selectedDepartments[0] : '',
          area: '',
          equipment: '',
          qty: 1,
          currency: 'USD',
          unitPrice: ''
        });
        loadBudgetData(selectedDepartments, searchTerm);
        loadAllDepartmentStats();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to add item'
      });

      // Notification automatique d'erreur
      notifyError(error, 'Adding budget item');
    }
  };

  const calculateTotal = () => {
    const total = budgetData.reduce((sum, item) => {
      // Prioritize the calculated totalPrice from backend if available, 
      // but ensure we account for frontend edits
      const qty = parseFloat(getCellValue(item, 'qty')) || 0;
      const unitPrice = parseFloat(getCellValue(item, 'unitPrice')) || 0;
      return sum + (qty * unitPrice);
    }, 0);

    return Number(total.toFixed(2)).toLocaleString();
  };

  const getModifiedCount = () => {
    return Object.keys(editedData).length;
  };

  const allRowsSelected = budgetData.length > 0 && selectedRows.length === budgetData.length;

  const selectionBannerCopy = {
    title: 'All rows are selected',
    subtitle: 'Use the elegant export buttons to download PDF or Excel instantly.'
  };

  return (
    <div className="non-industrial-budget-container" data-theme={theme}>
      <div className="budget-header">
        <div className="header-left">
          <h1 className="budget-title">
            <DollarSign size={32} />
            {t('nonIndustrialBudget') || 'Non Industrial Budget'}
          </h1>
          <p className="budget-subtitle">
            {isAchat
              ? (t('achatRoleMessage') || 'You can only modify Currency and Unit Price')
              : (t('budgetManagementSubtitle') || 'Department budget management')
            }
          </p>
        </div>

        <div className="header-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span style={{ marginLeft: '0.25rem' }}>
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          <div className="language-switcher" style={{ marginLeft: '1rem' }}>
            <button
              className="language-pill"
              onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '20px',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <Globe size={16} />
              <span>{i18n.language ? i18n.language.toUpperCase() : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Department Selector & Search - Style Standard Equipment */}
      <div className="controls-section">
        <div className="controls-row">
          {/* Sélection des départements */}
          <div className="control-group operations-control">
            <label className="control-label">Select Departments</label>
            <div className="dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="dropdown-button"
              >
                <div className="dropdown-button-content">
                  <span className="dropdown-text">
                    {selectedDepartments.length === 0
                      ? 'All Departments'
                      : `${selectedDepartments.length} department(s) selected`}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
                  />
                </div>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-options">
                    {departments.map((dept) => (
                      <label
                        key={dept.id}
                        className="dropdown-option"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dept.id)}
                          onChange={() => handleDepartmentToggle(dept.id)}
                          className="option-checkbox"
                        />
                        <div className="option-content">
                          <div className="dept-color-indicator" style={{ backgroundColor: dept.color }}></div>
                          <span className="option-text">{dept.icon} {dept.name}</span>
                          {departmentTotals[dept.id] !== undefined && (
                            <span className="dept-total">
                              {Number(departmentTotals[dept.id]).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recherche */}
          <div className="control-group search-control">
            <label className="control-label">Search</label>
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search by department, area, equipment, currency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {loading && <Loader className="search-loading spinning" size={16} />}
            </div>
          </div>
        </div>

        {/* Tags des départements sélectionnés */}
        {selectedDepartments.length > 0 && (
          <div className="tags-container">
            <div className="tags-list">
              {selectedDepartments.map((deptId) => {
                const dept = departments.find(d => d.id === deptId);
                return (
                  <span
                    key={deptId}
                    className="operation-tag"
                  >
                    <div className="tag-color" style={{ backgroundColor: dept.color }}></div>
                    {dept.icon} {dept.name}
                    <button
                      onClick={() => handleDepartmentToggle(deptId)}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-left">
          {!isAchat && (
            <button
              className="btn btn-primary compact-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={selectedDepartments.length === 0}
            >
              <span className="btn-icon-circle">
                <Plus size={18} />
              </span>
              Add New Item
            </button>
          )}
          <button
            className="btn btn-secondary compact-btn"
            onClick={() => loadBudgetData(selectedDepartments, searchTerm)}
            disabled={selectedDepartments.length === 0}
          >
            <span className="btn-icon-circle">
              <RefreshCw size={18} />
            </span>
            Refresh
          </button>
        </div>
        <div className="action-right">
          {getModifiedCount() > 0 && (
            <span className="modified-indicator">
              {getModifiedCount()} pending modification(s)
            </span>
          )}
          {selectedRows.length > 0 && (
            <div className="icon-actions">
              <button
                type="button"
                className="icon-action-btn success"
                onClick={handleSaveSelected}
                title={`Save Selected (${selectedRows.length})`}
                aria-label={`Save Selected (${selectedRows.length})`}
              >
                <Save size={26} />
                <span className="icon-counter">{selectedRows.length}</span>
              </button>
              {!isAchat && (
                <button
                  type="button"
                  className="icon-action-btn danger"
                  onClick={handleDeleteSelected}
                  title="Delete Selected"
                  aria-label="Delete Selected"
                >
                  <Trash2 size={26} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {allRowsSelected && (
        <div className="selection-export-banner" role="status" aria-live="polite">
          <div className="banner-info">
            <Sparkles size={28} />
            <div>
              <p>{selectionBannerCopy.title}</p>
              <span>{selectionBannerCopy.subtitle}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add New Item Form */}
      {showAddForm && !isAchat && (
        <div className="add-form-card">
          <h3 className="form-title">
            <Plus size={20} />
            Add New Budget Item
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Department *</label>
              <select
                value={newItem.department}
                onChange={(e) => setNewItem({ ...newItem, department: e.target.value })}
                className="form-select"
                required
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.icon} {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Area</label>
              <input
                type="text"
                value={newItem.area}
                onChange={(e) => setNewItem({ ...newItem, area: e.target.value })}
                placeholder="Enter area"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Equipment *</label>
              <input
                type="text"
                value={newItem.equipment}
                onChange={(e) => setNewItem({ ...newItem, equipment: e.target.value })}
                placeholder="Enter equipment name"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                value={newItem.qty}
                onChange={(e) => setNewItem({ ...newItem, qty: parseInt(e.target.value) || 0 })}
                min="1"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Currency *</label>
              <select
                value={newItem.currency}
                onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
                className={`form-select ${isUser ? 'readonly' : ''}`}
                required
                disabled={isUser}
                title={isUser ? "Read-only for User role" : ""}
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Unit Price *</label>
              <input
                type="number"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value.replace(/^0+(?=\d)/, '') })}
                min="0"
                step="0.01"
                className={`form-input ${isUser ? 'readonly' : ''}`}
                required
                readOnly={isUser}
                title={isUser ? "Read-only for User role" : ""}
              />
            </div>
            <div className="form-group">
              <label>Total Price</label>
              <input
                type="text"
                value={Number((newItem.qty * newItem.unitPrice).toFixed(2)).toString()}
                readOnly
                className="form-input readonly"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleAddItem}>
              <Plus size={18} />
              Add Item
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Budget Table */}
      <div className="budget-table-container">
        {selectedRows.length > 0 && (
          <div className="export-actions-container" style={{ marginBottom: '1.5rem' }}>
            <div className="export-dropdown-wrapper">
              <button
                className="export-dropdown-button"
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                onBlur={() => setTimeout(() => setIsExportDropdownOpen(false), 200)}
              >
                <span className="export-button-icon">📊</span>
                <span className="export-button-text">Show more</span>
                <ChevronDown
                  size={20}
                  className={`export-chevron ${isExportDropdownOpen ? 'open' : ''}`}
                />
              </button>

              {isExportDropdownOpen && (
                <div className="export-dropdown-menu">
                  <button
                    className="export-dropdown-item excel"
                    onClick={() => {
                      exportToExcel();
                      setIsExportDropdownOpen(false);
                    }}
                  >
                    <TableChartIcon className="export-item-icon" />
                    <div className="export-item-content">
                      <span className="export-item-title">Excel</span>
                      <span className="export-item-subtitle">Export to Excel format</span>
                    </div>
                  </button>

                  <button
                    className="export-dropdown-item pdf"
                    onClick={() => {
                      exportToPDF();
                      setIsExportDropdownOpen(false);
                    }}
                  >
                    <PictureAsPdfIcon className="export-item-icon" />
                    <div className="export-item-content">
                      <span className="export-item-title">PDF</span>
                      <span className="export-item-subtitle">Export to PDF format</span>
                    </div>
                  </button>

                  <button
                    className="export-dropdown-item analysis"
                    style={{ borderTop: '1px solid var(--border-medium)', marginTop: '4px', paddingTop: '4px' }}
                    onClick={() => {
                      handleAnalysis();
                      setIsExportDropdownOpen(false);
                    }}
                  >
                    <PieChartIcon className="export-item-icon" style={{ color: '#8b5cf6' }} />
                    <div className="export-item-content">
                      <span className="export-item-title">Analyse</span>
                      <span className="export-item-subtitle">Analyse equipment prices</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {selectedDepartments.length === 0 && !searchTerm.trim() ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h3>Select a Department or Search</h3>
            <p>Please select departments from the dropdown or use the search bar to display budget data</p>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : budgetData.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h3>No budget items yet</h3>
            <p>Click "Add New Item" to create your first budget entry</p>
          </div>
        ) : (
          <table className="budget-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === budgetData.length && budgetData.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th>N°</th>
                <th>DEPARTMENT</th>
                <th>AREA</th>
                <th>EQUIPMENT</th>
                <th>QTY</th>
                <th>CURRENCY</th>
                <th>UNIT PRICE</th>
                <th>TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody>
              {console.log('🎨 Rendu tableau - budgetData.length:', budgetData.length)}
              {budgetData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${selectedRows.includes(item.id) ? 'selected' : ''} ${hasRowChanges(item.id) ? 'modified' : ''}`}
                >
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleRowSelect(item.id)}
                    />
                    {hasRowChanges(item.id) && <div className="change-indicator"></div>}
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    <span className="dept-badge" style={{ backgroundColor: departments.find(d => d.id === item.department)?.color }}>
                      {item.department}
                    </span>
                  </td>
                  <td className="table-cell">
                    {renderEditableCell(item, 'area', getCellValue(item, 'area'))}
                  </td>
                  <td className="table-cell">
                    {renderEditableCell(item, 'equipment', getCellValue(item, 'equipment'))}
                  </td>
                  <td className="table-cell">
                    {renderEditableCell(item, 'qty', getCellValue(item, 'qty'), true)}
                  </td>
                  <td className="table-cell">
                    {renderEditableCell(item, 'currency', getCellValue(item, 'currency'))}
                  </td>
                  <td className="table-cell">
                    {renderEditableCell(item, 'unitPrice', getCellValue(item, 'unitPrice'), true)}
                  </td>
                  <td className="total-price">
                    {Number((parseFloat(getCellValue(item, 'qty')) * parseFloat(getCellValue(item, 'unitPrice'))).toFixed(2)).toLocaleString()} {getCellValue(item, 'currency')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Fixed Total Bar outside table */}
      {
        budgetData.length > 0 && !loading && (
          <div className="total-bar-fixed">
            <div className="total-label-fixed">
              <strong>Total</strong>
            </div>
            <div className="total-value-fixed">
              <strong>
                {calculateTotal()}
                {budgetData.length > 0 && getCellValue(budgetData[0], 'currency') === 'TND' ? ' $' : ''}
                {budgetData.length > 0 && getCellValue(budgetData[0], 'currency') !== 'TND' ? ' ' + getCellValue(budgetData[0], 'currency') : ''}
              </strong>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default NonIndustrialBudget;
