import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Save, Filter, Edit3, Check, X, Search, Trash2, AlertCircle, Loader, CheckSquare, Square, FileSpreadsheet, FileText, RefreshCw, Plus, Settings, Activity, DollarSign, Calendar, Cable, Globe, Sparkles, ZoomIn, ZoomOut, Sun, Moon } from 'lucide-react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../Context/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useNotifications from '../../../hooks/useNotifications';
import useTheme from '../../../hooks/useTheme';
import './style/StandardEquipment.css';
import './style/StandardEquipment_15cols.css';
import './style/StandardEquipment_extras.css';
import './style/StandardEquipment_dark.css';
import './style/StandardEquipment_wider_columns.css';
import './style/StandardEquipment_export_dropdown.css';

const StandardEquipmentModule = () => {
  console.log('🚀 StandardEquipmentModule - Début du chargement');

  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();

  // Hook de thème
  const { theme, toggleTheme, isDark } = useTheme();

  // Hook de notifications
  const {
    notifySaveSuccess,
    notifyDeleteSuccess,
    notifyAddSuccess,
    notifyError
  } = useNotifications('Standard Equipment');

  const operations = [
    { code: 1, name: '1-COUPE', color: '#3b82f6', icon: <Cable size={16} /> },
    { code: 2, name: '2-PREPARATION', color: '#10b981', icon: '🔧' },
    { code: 3, name: '3-ASSEMBLAGE', color: '#8b5cf6', icon: '⚙️' },
    { code: 4, name: '4-CONTROLE ELECTRIQUE ET CONDITIONNEMENT', color: '#f59e0b', icon: '⚡' },
    { code: 5, name: '5-EQUIPEMENTS DE TEST', color: '#ef4444', icon: '🔬' },
    { code: 6, name: '6-EQUIPEMENTS DIVERS', color: '#6366f1', icon: '🛠️' }
  ];

  const languages = [
    { code: 'fr', short: 'FR', flag: '🇫🇷', label: 'Français' },
    { code: 'en', short: 'EN', flag: '🇺🇸', label: 'English' }
  ];

  // SweetAlert2
  const MySwal = withReactContent(Swal);

  // États
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingCells, setEditingCells] = useState({});
  const [editedData, setEditedData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  // const [currentUser, setCurrentUser] = useState({ role: 'user' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [bulkSaveLoading, setBulkSaveLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tableScale, setTableScale] = useState(1);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const createEmptyNewItem = () => ({
    code_eq: '',
    operation: '',
    operation_code: '',
    equipment_reference: '',
    supplier_technology: '',
    equipment_type: '',
    calculation_method: '',
    daily_capacity: '',
    lifetime: '',
    cost_euro: '',
    cost_brazil_real: '',
    cost_mexican_peso: '',
    workstation_dimensions: '',
    reference_cdc: '',
    reference_pr: '',
    qty: 1
  });

  // New Item State - All fields from backend
  const [newItem, setNewItem] = useState(createEmptyNewItem);

  const REQUIRED_ADD_FIELDS = ['code_eq', 'operation', 'equipment_reference', 'supplier_technology', 'equipment_type', 'calculation_method'];
  const requiredFieldLabels = {
    code_eq: 'Code Équipement',
    operation: 'Opération',
    operation_code: 'Code Opération',
    equipment_reference: 'Référence Équipement',
    supplier_technology: 'Fournisseur/Technologie',
    equipment_type: 'Type',
    calculation_method: 'Méthode de Calcul'
  };

  // Modal tab state
  const [activeTab, setActiveTab] = useState('identification');

  // Configuration API V2 (pour afficher l'exactitude de l'Excel avec doublons autorisés)
  const API_BASE_URL = 'http://172.23.23.31:9001/api/standard-investments-v2';

  // Export to Excel
  const exportToExcel = () => {
    try {
      const dataToExport = filteredData.map((item, index) => ({
        'N°': index + 1,
        'Code Eq.': getCellValue(item, 'code_eq'),
        'Opérations': getCellValue(item, 'operation'),
        'Equipement de référence préconisé': getCellValue(item, 'equipment_reference'),
        'Fournisseur/ Technologie de référence': getCellValue(item, 'supplier_technology'),
        'Type': getCellValue(item, 'equipment_type'),
        'Méthode de calcul du besoin en équipement': getCellValue(item, 'calculation_method'),
        'Capacité par jour (j)': getCellValue(item, 'daily_capacity'),
        'Durée de vie équipement': getCellValue(item, 'lifetime'),
        'Quantité estimée (Editable)': getCellValue(item, 'qty') || 1,
        'Coût estimatif avec frais approche (Euro)': getCellValue(item, 'cost_euro'),
        'Coût estimatif avec frais approche (Mexique)': getCellValue(item, 'cost_mexican_peso'),
        'Coût estimatif avec frais approche (Brésil)': getCellValue(item, 'cost_brazil_real'),
        'Dimensions poste de travail': getCellValue(item, 'workstation_dimensions'),
        'Référence CDC': getCellValue(item, 'reference_cdc'),
        'Référence PR': getCellValue(item, 'reference_pr')
      }));

      // Calculate totals
      const calculateTotal = (costField) => {
        return filteredData.reduce((sum, item) => {
          const qty = parseFloat(getCellValue(item, 'qty')) || 1;
          const cost = getCellValue(item, costField);
          if (!cost) return sum;

          const strVal = String(cost).trim();
          const cleanVal = strVal
            .replace(/\s/g, '')
            .replace(/,/g, '.')
            .replace(/[^\d.-]/g, '');

          const num = parseFloat(cleanVal);
          return sum + (isNaN(num) ? 0 : (num * qty));
        }, 0);
      };

      const totalEUR = calculateTotal('cost_euro');
      const totalBRL = calculateTotal('cost_brazil_real');
      const totalMXN = calculateTotal('cost_mexican_peso');

      dataToExport.push({
        'N°': '',
        [t('equipmentCode')]: '',
        [t('operation')]: '',
        [t('operationCode')]: '',
        [t('equipment')]: '',
        [t('supplierTechnology')]: '',
        [t('type')]: '',
        [t('calculationMethod')]: '',
        [t('dailyCapacity')]: '',
        [t('lifespan')]: t('totalRecords').toUpperCase(),
        [t('quantity')]: '',
        [t('estimatedCostEUR')]: totalEUR.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
        [t('estimatedCostBRL')]: totalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        [t('estimatedCostMXN')]: totalMXN.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
        [t('workstationDimensions')]: '',
        [t('referenceCDC')]: '',
        [t('referencePR')]: ''
      });

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('standardEquipment'));

      const fileName = `Standard_Equipment_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      MySwal.fire({
        icon: 'success',
        title: t('exportSuccess'),
        text: `${t('dataExportedTo')} ${fileName}`,
        timer: 2000
      });
    } catch (error) {
      console.error('Export Error:', error);
      MySwal.fire({
        icon: 'error',
        title: t('exportFailed'),
        text: t('unableToExport')
      });
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

      // Title
      doc.setFontSize(16);
      doc.text(t('standardEquipmentTitle'), 14, 15);

      // Subtitle
      doc.setFontSize(10);
      const opText = selectedOperations.length > 0
        ? `${t('operation')}: ${selectedOperations.map(code => operations.find(op => op.code === code)?.name).join(', ')}`
        : t('allOperations');
      doc.text(opText, 14, 22);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);

      // Table Data
      const tableData = filteredData.map((item, index) => [
        index + 1,
        getCellValue(item, 'code_eq'),
        getCellValue(item, 'operation'),
        getCellValue(item, 'operation_code'),
        getCellValue(item, 'equipment_reference'),
        getCellValue(item, 'supplier_technology'),
        getCellValue(item, 'equipment_type'),
        getCellValue(item, 'calculation_method'),
        getCellValue(item, 'daily_capacity'),
        getCellValue(item, 'lifetime'),
        getCellValue(item, 'qty') || 1,
        getCellValue(item, 'cost_euro') ? formatCurrency(getCellValue(item, 'cost_euro')) : '',
        getCellValue(item, 'cost_brazil_real'),
        getCellValue(item, 'cost_mexican_peso'),
        getCellValue(item, 'workstation_dimensions'),
        getCellValue(item, 'reference_cdc'),
        getCellValue(item, 'reference_pr')
      ]);

      // Total Row with calculations
      const totalEUR = filteredData.reduce((sum, item) => {
        const qty = parseFloat(getCellValue(item, 'qty')) || 1;
        const cost = getCellValue(item, 'cost_euro');
        if (!cost) return sum;

        const strVal = String(cost).trim();
        const typicalCurrencyChars = /[€$£R]/g;
        const tempStr = strVal.replace(typicalCurrencyChars, '');

        if (/[a-zA-Z]/.test(tempStr)) {
          return sum;
        }

        const cleanVal = strVal
          .replace(/\s/g, '')
          .replace(/,/g, '.')
          .replace(/[^\d.-]/g, '');

        const num = parseFloat(cleanVal);
        return sum + (isNaN(num) ? 0 : (num * qty));
      }, 0);

      const totalBRL = filteredData.reduce((sum, item) => {
        const qty = parseFloat(getCellValue(item, 'qty')) || 1;
        const cost = getCellValue(item, 'cost_brazil_real');
        if (!cost) return sum;

        const strVal = String(cost).trim();
        const cleanVal = strVal
          .replace(/\s/g, '')
          .replace(/,/g, '.')
          .replace(/[^\d.-]/g, '');

        const num = parseFloat(cleanVal);
        return sum + (isNaN(num) ? 0 : (num * qty));
      }, 0);

      const totalMXN = filteredData.reduce((sum, item) => {
        const qty = parseFloat(getCellValue(item, 'qty')) || 1;
        const cost = getCellValue(item, 'cost_mexican_peso');
        if (!cost) return sum;

        const strVal = String(cost).trim();
        const cleanVal = strVal
          .replace(/\s/g, '')
          .replace(/,/g, '.')
          .replace(/[^\d.-]/g, '');

        const num = parseFloat(cleanVal);
        return sum + (isNaN(num) ? 0 : (num * qty));
      }, 0);

      tableData.push([
        '', '', '', '', '', '', '', '', '', '', '',
        t('totalEstimatedCost').toUpperCase(),
        totalEUR.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
        totalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        totalMXN.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
        '', '', '', ''
      ]);

      doc.autoTable({
        startY: 32,
        head: [[
          'N°',
          t('equipmentCode'),
          t('operation'),
          t('operationCode'),
          t('equipment'),
          t('supplierTechnology'),
          t('type'),
          t('calculationMethod'),
          t('dailyCapacity'),
          t('lifespan'),
          t('quantity'),
          t('estimatedCostEUR'),
          t('estimatedCostBRL'),
          t('estimatedCostMXN'),
          t('workstationDimensions'),
          t('referenceCDC'),
          t('referencePR')
        ]],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [30, 58, 138], fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { cellWidth: 8 },   // N°
          1: { cellWidth: 18 },  // Code
          2: { cellWidth: 20 },  // Operation
          3: { cellWidth: 18 },  // Operation Code
          4: { cellWidth: 25 },  // Equipment
          5: { cellWidth: 25 },  // Supplier
          6: { cellWidth: 15 },  // Type
          7: { cellWidth: 20 },  // Method
          8: { cellWidth: 15 },  // Capacity
          9: { cellWidth: 15 },  // Lifespan
          10: { cellWidth: 12 }, // QTY
          11: { cellWidth: 20 }, // Cost EUR
          12: { cellWidth: 18 }, // Cost BRL
          13: { cellWidth: 18 }, // Cost MXN
          14: { cellWidth: 20 }, // Dimensions
          15: { cellWidth: 18 }, // CDC
          16: { cellWidth: 18 }  // PR
        },
        didParseCell: function (data) {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [220, 220, 220];
          }
        }
      });

      const fileName = `Standard_Equipment_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      MySwal.fire({
        icon: 'success',
        title: t('exportSuccess'),
        text: `${t('dataExportedTo')} ${fileName}`,
        timer: 2000
      });
    } catch (error) {
      console.error('Export Error:', error);
      MySwal.fire({
        icon: 'error',
        title: t('exportFailed'),
        text: t('unableToExport')
      });
    }
  };

  // Fonctions API
  const fetchEquipments = async (operationCodes = [], search = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (operationCodes.length > 0) {
        params.append('operationCodes', operationCodes.join(','));
      }
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const url = `${API_BASE_URL}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText || 'Réponse invalide du serveur'}`);
      }

      const rawResult = await response.json();

      // La nouvelle API V2 retourne { success: true, data: [...] } au lieu d'un tableau direct
      const resultData = rawResult.success && rawResult.data ? rawResult.data : rawResult;

      const processedData = (Array.isArray(resultData) ? resultData : []).map((item, index) => ({
        ...item,
        id: item.id || `eq-${index}-${Date.now()}` // Assure une key unique même en cas de doublons "Code Eq."
      }));

      setAllData(processedData);
      setFilteredData(processedData);
      return processedData;
    } catch (err) {
      setError(err.message.includes('404') ? 'Aucun équipement trouvé' : err.message);
      setAllData([]);
      setFilteredData([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const batchSaveEquipments = async (equipmentsData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentsData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText || 'Échec de la mise à jour batch'}`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const deleteEquipments = async (ids) => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText || 'Échec de la suppression'}`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Effect pour charger l'utilisateur courant (Now handled by useAuth)
  /*
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.isAuthenticated) {
          setCurrentUser(parsedUser);
        }
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  }, []);
  */

  // Effects - Debounce pour la recherche et les opérations
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (selectedOperations.length > 0 || searchTerm.trim()) {
        fetchEquipments(selectedOperations, searchTerm);
      } else {
        setFilteredData([]);
        setAllData([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedOperations, searchTerm]);

  // Fermer le dropdown sur clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleOperationToggle = (operationCode) => {
    setSelectedOperations(prev => {
      const newSelection = prev.includes(operationCode)
        ? prev.filter(code => code !== operationCode)
        : [...prev, operationCode];

      setSelectedRows([]);
      setIsAllSelected(false);
      setShowAddForm(false);

      return newSelection;
    });
  };

  const handleCellEdit = (rowId, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }));
  };

  const startEditing = (rowId, field) => {
    setEditingCells(prev => ({
      ...prev,
      [`${rowId}-${field}`]: true
    }));
  };

  const stopEditing = (rowId, field) => {
    setEditingCells(prev => {
      const newState = { ...prev };
      delete newState[`${rowId}-${field}`];
      return newState;
    });
  };

  const saveAllChanges = async () => {
    if (Object.keys(editedData).length === 0) return;

    setSaveLoading(true);
    setError(null);

    try {
      const equipmentsToUpdate = Object.keys(editedData).map(id => {
        const updateData = { ...editedData[id] };
        // Convertir qty en QTY pour le backend
        if (updateData.qty !== undefined) {
          updateData.QTY = updateData.qty;
          delete updateData.qty;
        }
        return {
          id: parseInt(id),
          ...updateData
        };
      });

      const result = await batchSaveEquipments(equipmentsToUpdate);

      if (result.success) {
        setAllData(prev => prev.map(item => {
          const updatedItem = result.data?.find(updated => updated.id === item.id);
          return updatedItem || item;
        }));

        setFilteredData(prev => prev.map(item => {
          const updatedItem = result.data?.find(updated => updated.id === item.id);
          return updatedItem || item;
        }));

        setEditedData({});
        setEditingCells({});

        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'All changes saved successfully',
          timer: 2000
        });

        notifySaveSuccess({
          count: equipmentsToUpdate.length,
          summary: `${equipmentsToUpdate.length} equipments updated`
        });
      }
    } catch (err) {
      setError(err.message);
      MySwal.fire('Error saving changes', err.message, 'error');
      notifyError(err, 'Saving changes');
    } finally {
      setSaveLoading(false);
    }
  };

  const saveSelectedRows = async () => {
    if (selectedRows.length === 0) return;

    const selectedEditedData = Object.keys(editedData).reduce((acc, id) => {
      if (selectedRows.includes(parseInt(id))) {
        acc[id] = editedData[id];
      }
      return acc;
    }, {});

    if (Object.keys(selectedEditedData).length === 0) {
      MySwal.fire('No changes to save for selected rows', '', 'info');
      return;
    }

    setBulkSaveLoading(true);
    setError(null);

    try {
      const equipmentsToUpdate = Object.keys(selectedEditedData).map(id => {
        const updateData = { ...selectedEditedData[id] };
        // Convertir qty en QTY pour le backend
        if (updateData.qty !== undefined) {
          updateData.QTY = updateData.qty;
          delete updateData.qty;
        }
        return {
          id: parseInt(id),
          ...updateData
        };
      });

      const result = await batchSaveEquipments(equipmentsToUpdate);

      if (result.success) {
        setAllData(prev => prev.map(item => {
          const updatedItem = result.data?.find(updated => updated.id === item.id);
          return updatedItem || item;
        }));

        setFilteredData(prev => prev.map(item => {
          const updatedItem = result.data?.find(updated => updated.id === item.id);
          return updatedItem || item;
        }));

        setEditedData(prev => {
          const newEditedData = { ...prev };
          Object.keys(selectedEditedData).forEach(id => delete newEditedData[id]);
          return newEditedData;
        });

        setSelectedRows([]);
        setIsAllSelected(false);

        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: `${equipmentsToUpdate.length} rows saved successfully`,
          timer: 2000
        });

        notifySaveSuccess({
          count: equipmentsToUpdate.length,
          summary: `${equipmentsToUpdate.length} selected rows saved`
        });
      }
    } catch (err) {
      setError(err.message);
      MySwal.fire('Error saving selection', err.message, 'error');
      notifyError(err, 'Saving selection');
    } finally {
      setBulkSaveLoading(false);
    }
  };

  const handleAddEquipment = async () => {
    // Debug: afficher les valeurs actuelles
    console.log('Valeurs du formulaire newItem:', newItem);

    const missingFields = REQUIRED_ADD_FIELDS.filter(field => {
      const value = newItem[field];
      const isEmpty = value === undefined || value === null || String(value).trim() === '';
      console.log(`Champ ${field}: valeur="${value}", isEmpty=${isEmpty}`);
      return isEmpty;
    });

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(field => requiredFieldLabels[field] || field);
      console.log('Champs manquants:', missingFields);
      MySwal.fire('Warning', `Veuillez remplir les champs obligatoires : ${missingLabels.join(', ')}`, 'warning');
      return;
    }

    const payload = Object.keys(newItem).reduce((acc, key) => {
      const value = newItem[key];
      // Convertir qty en QTY pour le backend
      if (key === 'qty') {
        acc['QTY'] = typeof value === 'string' ? value.trim() : value;
      } else {
        acc[key] = typeof value === 'string' ? value.trim() : value;
      }
      return acc;
    }, { role: currentUser.role });

    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.success) {
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Equipment added successfully',
          timer: 2000
        });

        notifyAddSuccess({
          name: newItem.Equipment_Reference,
          summary: `Equipment added: ${newItem.Equipment_Reference}`
        });

        setShowAddForm(false);
        setNewItem(createEmptyNewItem());
        await fetchEquipments(selectedOperations, searchTerm);
      } else {
        throw new Error(result.error || 'Error adding equipment');
      }
    } catch (err) {
      MySwal.fire('Error', err.message, 'error');
      notifyError(err, 'Adding equipment');
    }
  };

  const formatCurrency = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(numValue);
  };

  const getCellValue = (item, field) => {
    // Handle field mapping between frontend and backend
    const fieldMapping = {
      'qty': 'QTY', // Map frontend 'qty' to backend 'QTY'
    };

    const backendField = fieldMapping[field] || field;
    return item[backendField] || '';
  };

  const isEditingCell = (rowId, field) => {
    return !!editingCells[`${rowId}-${field}`];
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map(item => item.id));
    }
  };

  const deleteSelectedRows = async () => {
    if (selectedRows.length === 0) return;

    const confirmDelete = await MySwal.fire({
      title: `Delete ${selectedRows.length} items?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (confirmDelete.isConfirmed) {
      setLoading(true);
      try {
        const result = await deleteEquipments(selectedRows);
        if (result.success) {
          await fetchEquipments(selectedOperations, searchTerm);
          setSelectedRows([]);
          setIsAllSelected(false);
          MySwal.fire('Deleted', `${result.deletedCount} items deleted`, 'success');
          notifyDeleteSuccess({ count: result.deletedCount, summary: `${result.deletedCount} items deleted` });
        }
      } catch (err) {
        MySwal.fire('Error', err.message, 'error');
        notifyError(err, 'Deleting items');
      } finally {
        setLoading(false);
      }
    }
  };

  const hasRowChanges = (rowId) => {
    return !!editedData[rowId] && Object.keys(editedData[rowId]).length > 0;
  };

  const canEditField = (field) => {
    if (currentUser.role === 'Achat') {
      return ['cost_euro', 'cost_brazil_real', 'cost_mexican_peso'].includes(field);
    }
    return true;
  };

  const getModifiedCount = () => Object.keys(editedData).length;

  const allRowsSelected = filteredData.length > 0 && selectedRows.length === filteredData.length;

  const handleLanguageChange = (langCode) => {
    if (i18n.language !== langCode) {
      i18n.changeLanguage(langCode);
    }
  };

  const MIN_ZOOM = 0.85;
  const MAX_ZOOM = 1.2;
  const ZOOM_STEP = 0.1;

  const selectionBannerCopy = i18n.language === 'fr'
    ? {
      title: 'Toutes les lignes sont sélectionnées',
      subtitle: 'Utilisez les icônes d’exportation pour télécharger vos données.'
    }
    : {
      title: 'All rows are selected',
      subtitle: 'Use the floating export icons to download your dataset.'
    };

  const handleZoom = (direction) => {
    setTableScale((prev) => {
      const delta = direction === 'in' ? ZOOM_STEP : -ZOOM_STEP;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat((prev + delta).toFixed(2))));
      return next;
    });
  };

  const zoomLabel = `${Math.round(tableScale * 100)}%`;

  const handleCellClickPopup = async (item, field, displayValue, isNumeric, isCurrency) => {
    const isSelected = selectedRows.includes(item.id);
    const currentValue = editedData[item.id]?.[field] ?? getCellValue(item, field) ?? '';
    const canEdit = canEditField(field);
    const titleText = isSelected && canEdit ? `Éditer` : `Détails`;

    // Popup Read Only (Visualisation)
    if (!isSelected || !canEdit) {
      MySwal.fire({
        title: titleText,
        html: `<div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <span style="font-size: 1.1em; color: #1e293b; white-space: pre-wrap; word-break: break-word;">${currentValue || 'N/A'}</span>
               </div>`,
        icon: 'info',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#3b82f6',
        width: '600px'
      });
      return;
    }

    // Popup Edit (Modal de modification)
    const { value: formValues } = await MySwal.fire({
      title: titleText,
      html: `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <input 
            id="swal-input-edit" 
            class="swal2-input" 
            style="margin:0; width:100%; box-sizing:border-box;"
            type="${isNumeric ? 'number' : 'text'}"
            value="${String(currentValue).replace(/"/g, '&quot;')}"
          >
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '<i class="lucide-check"></i> Sauvegarder',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      preConfirm: () => {
        return document.getElementById('swal-input-edit').value;
      }
    });

    if (formValues !== undefined) {
      handleCellEdit(item.id, field, formValues);
    }
  };

  const renderEditableCell = (item, field, displayValue, isNumeric = false, isCurrency = false) => {
    const currentValue = editedData[item.id]?.[field] ?? getCellValue(item, field);
    const hasChanges = hasRowChanges(item.id);
    const isSelected = selectedRows.includes(item.id);
    const canEdit = canEditField(field);

    const formattedValue = isCurrency ? formatCurrency(currentValue || displayValue) : ((currentValue || displayValue) || 'N/A');

    return (
      <div
        className={`editable-cell ${hasChanges ? 'has-changes' : ''} ${isSelected && canEdit ? 'is-editable-mode' : 'is-readonly-mode'}`}
        onClick={() => handleCellClickPopup(item, field, displayValue, isNumeric, isCurrency)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span className="cell-content" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
          {formattedValue}
        </span>
        {isSelected && canEdit ? (
          <Edit3 className="edit-icon" size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
        ) : (
          <ZoomIn className="view-icon" size={14} style={{ color: '#94a3b8', opacity: 0.7, flexShrink: 0 }} />
        )}
      </div>
    );
  };

  const isAchat = currentUser.role === 'Achat';

  return (
    <div className="standard-equipment-container" data-theme={theme}>
      <div className="equipment-header">
        <div className="header-left">
          <h1 className="equipment-title">
            <Settings className="title-icon" size={32} />
            {t('standardEquipmentTitle')}
          </h1>
          <p className="equipment-subtitle">
            {t('standardEquipmentSubtitle')}
          </p>
        </div>
        <div className="header-right">
          <div className="language-switcher" role="group" aria-label={t('changeLanguage')}>
            {languages.map(lang => (
              <button
                key={lang.code}
                type="button"
                className={`language-pill ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
                aria-pressed={i18n.language === lang.code}
                title={lang.label}
              >
                <span className="lang-flag" aria-hidden="true">{lang.flag}</span>
                <span className="lang-code">{lang.short}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? t('switchToLightMode') : t('switchToDarkMode')}
            title={isDark ? t('switchToLightMode') : t('switchToDarkMode')}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Controls Section - Compact Layout */}
      <div className="controls-section">
        <div className="controls-row" style={{ gap: '1rem', alignItems: 'flex-end' }}>
          <div className="control-group operations-control">
            <label className="control-label">{t('selectOperations')}</label>
            <div className="dropdown-container">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="dropdown-button">
                <div className="dropdown-button-content">
                  <span className="dropdown-text">
                    {selectedOperations.length === 0 ? t('allOperations') : `${selectedOperations.length} ${t('selected')}`}
                  </span>
                  <ChevronDown size={20} className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                </div>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-options">
                    {operations.map((op) => (
                      <label key={op.code} className="dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedOperations.includes(op.code)}
                          onChange={() => handleOperationToggle(op.code)}
                          className="option-checkbox"
                        />
                        <div className="option-content">
                          <div className="dept-color-indicator" style={{ backgroundColor: op.color }}></div>
                          <span className="option-text">{typeof op.icon === 'string' ? op.icon : ''} {op.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="control-group search-control">
            <label className="control-label">{t('search')}</label>
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {loading && <Loader className="search-loading spinning" size={16} />}
            </div>
          </div>
        </div>

        {selectedOperations.length > 0 && (
          <div className="tags-container">
            <div className="tags-list">
              {selectedOperations.map((opCode) => {
                const op = operations.find(o => o.code === opCode);
                return (
                  <span key={opCode} className="operation-tag">
                    <div className="tag-color" style={{ backgroundColor: op.color }}></div>
                    {typeof op.icon === 'string' ? op.icon : ''} {op.name}
                    <button onClick={() => handleOperationToggle(opCode)} className="tag-remove">×</button>
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
              disabled={selectedOperations.length === 0}
            >
              <span className="btn-icon-circle">
                <Plus size={18} />
              </span>
              {t('addEquipment')}
            </button>
          )}
          <button
            className="btn btn-secondary compact-btn"
            onClick={() => fetchEquipments(selectedOperations, searchTerm)}
            disabled={selectedOperations.length === 0}
          >
            <span className="btn-icon-circle">
              <RefreshCw size={18} />
            </span>
            {t('refresh')}
          </button>
        </div>
        <div className="action-right">
          {getModifiedCount() > 0 && (
            <span className="modified-indicator">
              {getModifiedCount()} {t('pendingChanges')}
            </span>
          )}
          {selectedRows.length > 0 && (
            <div className="icon-actions">
              <button
                type="button"
                className="icon-action-btn success"
                onClick={saveSelectedRows}
                title={`${t('saveSelected')} (${selectedRows.length})`}
                aria-label={`${t('saveSelected')} (${selectedRows.length})`}
              >
                <Save size={26} />
                <span className="icon-counter">{selectedRows.length}</span>
              </button>
              {!isAchat && (
                <button
                  type="button"
                  className="icon-action-btn danger"
                  onClick={deleteSelectedRows}
                  title={t('deleteSelected')}
                  aria-label={t('deleteSelected')}
                >
                  <Trash2 size={26} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="table-toolbar">
        <div className="zoom-controls">
          <button
            type="button"
            className="zoom-btn"
            onClick={() => handleZoom('out')}
            disabled={tableScale <= MIN_ZOOM}
            title={t('zoomOut') || 'Zoom out'}
          >
            <ZoomOut size={16} />
          </button>
          <span className="zoom-label">{zoomLabel}</span>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => handleZoom('in')}
            disabled={tableScale >= MAX_ZOOM}
            title={t('zoomIn') || 'Zoom in'}
          >
            <ZoomIn size={16} />
          </button>
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

      {/* Add Equipment Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Settings size={24} />
                <h2>Nouvel Équipement</h2>
              </div>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              <button
                className={`modal-tab ${activeTab === 'identification' ? 'active' : ''}`}
                onClick={() => setActiveTab('identification')}
              >
                Identification
              </button>
              <button
                className={`modal-tab ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Spécifications Techniques
              </button>
              <button
                className={`modal-tab ${activeTab === 'cost' ? 'active' : ''}`}
                onClick={() => setActiveTab('cost')}
              >
                Coût et Dimensions
              </button>
            </div>

            {/* Tab Content */}
            <div className="modal-content">
              {activeTab === 'identification' && (
                <div className="tab-panel form-grid-compact">
                  <div className="form-group">
                    <label>Code Équipement *</label>
                    <input
                      type="text"
                      value={newItem.code_eq}
                      onChange={(e) => setNewItem({ ...newItem, code_eq: e.target.value })}
                      placeholder="Entrez code équipement..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantité</label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.qty}
                      onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                      placeholder="Qté..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Opération *</label>
                    <select
                      value={newItem.operation}
                      onChange={(e) => {
                        console.log('Sélection opération:', e.target.value);
                        setNewItem({ ...newItem, operation: e.target.value });
                      }}
                      className="form-select"
                    >
                      <option value="">Sélectionner une opération...</option>
                      <option value="Coupe Faisceau">Coupe Faisceau</option>
                      <option value="Preparation">Preparation</option>
                      <option value="Assemblage">Assemblage</option>
                      <option value="Contrôle Electrique">Contrôle Electrique</option>
                      <option value="Conditionnement">Conditionnement</option>
                      <option value="Equipement Divers">Equipement Divers</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Code Opération</label>
                    <input
                      type="text"
                      value={newItem.operation_code}
                      onChange={(e) => setNewItem({ ...newItem, operation_code: e.target.value })}
                      placeholder="Entrez code opération..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Référence Équipement *</label>
                    <input
                      type="text"
                      value={newItem.equipment_reference}
                      onChange={(e) => setNewItem({ ...newItem, equipment_reference: e.target.value })}
                      placeholder="Entrez référence équipement..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type *</label>
                    <input
                      type="text"
                      value={newItem.equipment_type}
                      onChange={(e) => setNewItem({ ...newItem, equipment_type: e.target.value })}
                      placeholder="Entrez type..."
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="tab-panel form-grid-compact">
                  <div className="form-group">
                    <label>Fournisseur/Technologie *</label>
                    <input
                      type="text"
                      value={newItem.supplier_technology}
                      onChange={(e) => setNewItem({ ...newItem, supplier_technology: e.target.value })}
                      placeholder="Entrez fournisseur/technologie..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Méthode de Calcul *</label>
                    <input
                      type="text"
                      value={newItem.calculation_method}
                      onChange={(e) => setNewItem({ ...newItem, calculation_method: e.target.value })}
                      placeholder="Entrez méthode de calcul..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacité Journalière</label>
                    <input
                      type="text"
                      value={newItem.daily_capacity}
                      onChange={(e) => setNewItem({ ...newItem, daily_capacity: e.target.value })}
                      placeholder="Entrez capacité journalière..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Durée de Vie</label>
                    <input
                      type="text"
                      value={newItem.lifetime}
                      onChange={(e) => setNewItem({ ...newItem, lifetime: e.target.value })}
                      placeholder="Entrez durée de vie..."
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'cost' && (
                <div className="tab-panel form-grid-compact">
                  <div className="form-group">
                    <label>Coût Estimé (€)</label>
                    <input
                      type="text"
                      value={newItem.cost_euro}
                      onChange={(e) => setNewItem({ ...newItem, cost_euro: e.target.value })}
                      placeholder="Entrez coût estimé (€)..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Coût Estimé (R$)</label>
                    <input
                      type="text"
                      value={newItem.cost_brazil_real}
                      onChange={(e) => setNewItem({ ...newItem, cost_brazil_real: e.target.value })}
                      placeholder="Entrez coût estimé (R$)..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Coût Estimé (MXN)</label>
                    <input
                      type="text"
                      value={newItem.cost_mexican_peso}
                      onChange={(e) => setNewItem({ ...newItem, cost_mexican_peso: e.target.value })}
                      placeholder="Entrez coût estimé (MXN)..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dimensions du Poste</label>
                    <input
                      type="text"
                      value={newItem.workstation_dimensions}
                      onChange={(e) => setNewItem({ ...newItem, workstation_dimensions: e.target.value })}
                      placeholder="Entrez dimensions du poste..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Référence CDC</label>
                    <input
                      type="text"
                      value={newItem.reference_cdc}
                      onChange={(e) => setNewItem({ ...newItem, reference_cdc: e.target.value })}
                      placeholder="Entrez référence CDC..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Référence PR</label>
                    <input
                      type="text"
                      value={newItem.reference_pr}
                      onChange={(e) => setNewItem({ ...newItem, reference_pr: e.target.value })}
                      placeholder="Entrez référence PR..."
                      className="form-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleAddEquipment}>
                <Plus size={18} />
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="budget-table-container">
        {selectedRows.length > 0 && (
          <div className="export-actions-container">
            <div className="export-dropdown-wrapper">
              <button
                className="export-dropdown-button"
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                onBlur={() => setTimeout(() => setIsExportDropdownOpen(false), 200)}
              >
                <span className="export-button-icon">📊</span>
                <span className="export-button-text">Voir plus</span>
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
                      <span className="export-item-subtitle">Exporter en format Excel</span>
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
                      <span className="export-item-subtitle">Exporter en format PDF</span>
                    </div>
                  </button>

                  <button
                    className="export-dropdown-item analyse"
                    onClick={() => {
                      MySwal.fire({
                        icon: 'info',
                        title: 'Analyse des données',
                        html: `
                          <div style="text-align: left; padding: 1rem;">
                            <p><strong>Nombre d'équipements sélectionnés:</strong> ${selectedRows.length}</p>
                            <p><strong>Coût total estimé (EUR):</strong> ${filteredData
                            .filter(item => selectedRows.includes(item.id))
                            .reduce((sum, item) => {
                              const qty = parseFloat(getCellValue(item, 'qty')) || 1;
                              const cost = Number(getCellValue(item, 'cost_euro'));
                              return sum + (isNaN(cost) ? 0 : cost * qty);
                            }, 0)
                            .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                            <p><strong>Opérations concernées:</strong> ${[...new Set(filteredData
                              .filter(item => selectedRows.includes(item.id))
                              .map(item => getCellValue(item, 'operation'))
                            )].join(', ')}</p>
                          </div>
                        `,
                        confirmButtonText: 'Fermer',
                        confirmButtonColor: '#3b82f6'
                      });
                      setIsExportDropdownOpen(false);
                    }}
                  >
                    <Activity className="export-item-icon" />
                    <div className="export-item-content">
                      <span className="export-item-title">Analyse</span>
                      <span className="export-item-subtitle">Analyser les données sélectionnées</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {selectedOperations.length === 0 && !searchTerm.trim() ? (
          <div className="empty-state">
            <Settings size={48} className="empty-icon" />
            <h3>{t('selectOperations')}</h3>
            <p className="empty-description">{t('selectOperationOrSearch')}</p>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('loadingData')}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <Settings size={48} className="empty-icon" />
            <h3>{t('noEquipmentFound')}</h3>
            <p className="empty-description">{t('tryAdjustingFilters')}</p>
          </div>
        ) : (
          <div
            className="table-zoom-wrapper"
            style={{ transform: `scale(${tableScale})`, transformOrigin: '0 0' }}
          >
            <table className="budget-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Tout sélectionner"
                    />
                  </th>
                  <th title="Code Eq.">Code Eq.</th>
                  <th title="Opérations">Opérations</th>
                  <th title="Equipement de référence préconisé">Equipement de référence préconisé</th>
                  <th title="Fournisseur/ Technologie de référence">Fournisseur/ Technologie de référence</th>
                  <th title="Type">Type</th>
                  <th title="Méthode de calcul du besoin en équipement (Quantité)">Méthode de calcul du besoin en équipement</th>
                  <th title="Capacité par jour (j)">Capacité par jour (j)</th>
                  <th title="Durée de vie équipement">Durée de vie équipement</th>
                  <th title="Quantité estimée (Editable)">QTE (Editable)</th>
                  <th title="Coût estimatif avec frais approche (Euro)">Coût estimatif avec frais approche (Euro)</th>
                  <th title="Coût estimatif avec frais approche (Mexique)">Coût estimatif avec frais approche (Mexique)</th>
                  <th title="Coût estimatif avec frais approche (Brésil)">Coût estimatif avec frais approche (Brésil)</th>
                  <th title="Dimensions poste de travail">Dimensions poste de travail</th>
                  <th title="Référence CDC">Référence CDC</th>
                  <th title="Référence PR">Référence PR</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${selectedRows.includes(item.id) ? 'selected' : ''} ${hasRowChanges(item.id) ? 'modified' : ''}`}
                  >
                    <td className="checkbox-col" data-label="Selection">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleRowSelect(item.id)}
                      />
                      {hasRowChanges(item.id) && <div className="change-indicator"></div>}
                    </td>
                    <td className="table-cell" data-label="Code Eq." style={isEditingCell(item.id, 'code_eq') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'code_eq', getCellValue(item, 'code_eq'))}
                    </td>
                    <td data-label="Opérations" style={isEditingCell(item.id, 'operation') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'operation', getCellValue(item, 'operation'))}
                    </td>
                    <td className="table-cell" data-label="Equipement" style={isEditingCell(item.id, 'equipment_reference') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'equipment_reference', getCellValue(item, 'equipment_reference'))}
                    </td>
                    <td className="table-cell" data-label="Fournisseur/Technologie" style={isEditingCell(item.id, 'supplier_technology') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'supplier_technology', getCellValue(item, 'supplier_technology'))}
                    </td>
                    <td className="table-cell" data-label="Type" style={isEditingCell(item.id, 'equipment_type') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'equipment_type', getCellValue(item, 'equipment_type'))}
                    </td>
                    <td className="table-cell" data-label="Méthode de calcul" style={isEditingCell(item.id, 'calculation_method') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'calculation_method', getCellValue(item, 'calculation_method'))}
                    </td>
                    <td className="table-cell" data-label="Capacité/jour" style={isEditingCell(item.id, 'daily_capacity') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'daily_capacity', getCellValue(item, 'daily_capacity'))}
                    </td>
                    <td className="table-cell" data-label="Durée de vie" style={isEditingCell(item.id, 'lifetime') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'lifetime', getCellValue(item, 'lifetime'))}
                    </td>
                    <td className="table-cell" data-label="Quantité Editable" style={isEditingCell(item.id, 'qty') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'qty', getCellValue(item, 'qty') || 1, true)}
                    </td>
                    <td className="table-cell" data-label="Coût Euro" style={isEditingCell(item.id, 'cost_euro') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'cost_euro', getCellValue(item, 'cost_euro'))}
                    </td>
                    <td className="table-cell" data-label="Coût Mexique" style={isEditingCell(item.id, 'cost_mexican_peso') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'cost_mexican_peso', getCellValue(item, 'cost_mexican_peso'))}
                    </td>
                    <td className="table-cell" data-label="Coût Brésil" style={isEditingCell(item.id, 'cost_brazil_real') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'cost_brazil_real', getCellValue(item, 'cost_brazil_real'))}
                    </td>
                    <td className="table-cell" data-label="Dimensions" style={isEditingCell(item.id, 'workstation_dimensions') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'workstation_dimensions', getCellValue(item, 'workstation_dimensions'))}
                    </td>
                    <td className="table-cell" data-label="CDC" style={isEditingCell(item.id, 'reference_cdc') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'reference_cdc', getCellValue(item, 'reference_cdc'))}
                    </td>
                    <td className="table-cell" data-label="PR" style={isEditingCell(item.id, 'reference_pr') ? { overflow: 'visible', position: 'relative', zIndex: 20 } : {}}>
                      {renderEditableCell(item, 'reference_pr', getCellValue(item, 'reference_pr'))}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="total-row">
                  <td colSpan="11" className="total-label" style={{ textAlign: 'right', paddingRight: '1rem' }}>
                    <strong>{t('totalEstimatedCost')}</strong>
                  </td>
                  <td className="total-value">
                    <strong>
                      {filteredData.reduce((sum, item) => {
                        const qty = parseFloat(getCellValue(item, 'qty')) || 1;
                        const cost = getCellValue(item, 'cost_euro');

                        // Simple check: is it a valid number?
                        const num = Number(cost);

                        // If not a number, skip it
                        if (isNaN(num)) {
                          return sum;
                        }

                        // Simple addition: number × quantity
                        return sum + (num * qty);
                      }, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </strong>
                  </td>
                  <td className="total-value">
                    <strong>
                      {filteredData.reduce((sum, item) => {
                        const qty = parseFloat(getCellValue(item, 'qty')) || 1;
                        const cost = getCellValue(item, 'cost_brazil_real');

                        // Simple check: is it a valid number?
                        const num = Number(cost);

                        // If not a number, skip it
                        if (isNaN(num)) {
                          return sum;
                        }

                        // Simple addition: number × quantity
                        return sum + (num * qty);
                      }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </strong>
                  </td>
                  <td className="total-value">
                    <strong>
                      {filteredData.reduce((sum, item) => {
                        const qty = parseFloat(getCellValue(item, 'qty')) || 1;
                        const cost = getCellValue(item, 'cost_mexican_peso');

                        // Simple check: is it a valid number?
                        const num = Number(cost);

                        // If not a number, skip it
                        if (isNaN(num)) {
                          return sum;
                        }

                        // Simple addition: number × quantity
                        return sum + (num * qty);
                      }, 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </strong>
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardEquipmentModule;