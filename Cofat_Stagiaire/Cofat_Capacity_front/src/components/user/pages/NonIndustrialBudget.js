import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import axios from '../../../utils/axiosInstance';
import Swal from 'sweetalert2';
import {
  Plus,
  Save,
  Trash2,
  DollarSign,
  TrendingUp,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useNotifications from '../../../hooks/useNotifications';
import useTheme from '../../../hooks/useTheme';
import './style/NonIndustrialBudget.css';
import './style/NonIndustrialBudget_dark.css';

const NonIndustrialBudget = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();

  // Hook de notifications
  const {
    notifySaveSuccess,
    notifyDeleteSuccess,
    notifyAddSuccess,
    notifyError
  } = useNotifications('Non Industrial Budget');
  const [activeDepartment, setActiveDepartment] = useState('IT');
  const [budgetData, setBudgetData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'TND', 'MAD', 'BRL', 'EGP']);
  const [departmentTotals, setDepartmentTotals] = useState({});

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
    department: activeDepartment,
    area: '',
    equipment: '',
    qty: 1,
    currency: 'USD',
    unitPrice: ''
  });

  // Check if user has Achat role
  const isAchat = user && user.role === 'Achat';
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    loadDepartmentData(activeDepartment);
    loadCurrencies();
  }, [activeDepartment]);

  const loadDepartmentData = async (department) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/non-industrial-budget/department/${department}`);
      if (response.data.success) {
        // Reverse data array to ensure newest additions appear at the top
        const reversedData = Array.isArray(response.data.data) ? [...response.data.data].reverse() : [];
        setBudgetData(reversedData);
        setDepartmentTotals(prev => ({
          ...prev,
          [department]: response.data.total
        }));
      }
    } catch (error) {
      console.error('Error loading department data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load department data'
      });
    } finally {
      setLoading(false);
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

  const handleDepartmentChange = (deptId) => {
    setActiveDepartment(deptId);
    setSelectedRows([]);
    setShowAddForm(false);
    setNewItem({
      department: deptId,
      area: '',
      equipment: '',
      qty: 1,
      currency: 'USD',
      unitPrice: ''
    });
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === budgetData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(budgetData.map(item => item.id));
    }
  };

  const handleAddItem = async () => {
    if (!newItem.equipment || !newItem.qty || !newItem.unitPrice) {
      Swal.fire({
        icon: 'warning',
        title: t('missingFields'),
        text: t('fillAllFields')
      });
      return;
    }

    try {
      const response = await axios.post('/api/non-industrial-budget/create', {
        ...newItem,
        createdBy: user.username || user.email
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Budget item added successfully',
          timer: 1500,
          showConfirmButton: false
        });

        // Notification automatique
        notifyAddSuccess({
          count: 1,
          name: newItem.equipment,
          summary: `${newItem.equipment} ajouté au département ${newItem.department}`,
          details: `Quantité: ${newItem.qty}, Prix unitaire: ${newItem.unitPrice} ${newItem.currency}`
        });

        loadDepartmentData(activeDepartment);
        setShowAddForm(false);
        setNewItem({
          department: activeDepartment,
          area: '',
          equipment: '',
          qty: 1,
          currency: 'USD',
          unitPrice: ''
        });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('failedToAddBudgetItem')
      });

      // Notification automatique d'erreur
      notifyError(error, 'Ajout d\'élément au budget');
    }
  };

  const handleUpdateRow = async (id, field, value) => {
    // Only Achat can edit currency and unitPrice
    if (isAchat && (field !== 'currency' && field !== 'unitPrice')) {
      return;
    }
    if (user && user.role === 'User' && field === 'unitPrice') {
      return;
    }

    const updatedData = budgetData.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate total if qty or unitPrice changed
        if (field === 'qty' || field === 'unitPrice') {
          updated.totalPrice = (parseFloat(updated.qty) || 0) * (parseFloat(updated.unitPrice) || 0);
        }
        return updated;
      }
      return item;
    });

    setBudgetData(updatedData);

    // Auto-select row if not already selected to allow immediate saving
    if (!selectedRows.includes(id)) {
      setSelectedRows(prev => [...prev, id]);
    }
  };

  const handleSaveSelected = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: t('noSelection'),
        text: t('selectAtLeastOne')
      });
      return;
    }

    const currentSelected = [...selectedRows];
    const itemsToUpdate = budgetData.filter(item => currentSelected.includes(item.id));

    // Uncheck immediately for instant feedback
    setSelectedRows([]);

    try {
      const response = await axios.put('/api/non-industrial-budget/batch-update', {
        items: itemsToUpdate,
        updatedBy: user.username || user.email
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${response.data.message}`,
          timer: 1500,
          showConfirmButton: false
        });

        // Notification automatique
        notifySaveSuccess({
          count: itemsToUpdate.length,
          summary: `${itemsToUpdate.length} élément(s) du budget mis à jour`,
          details: `Département: ${activeDepartment}`
        });

        loadDepartmentData(activeDepartment);
      } else {
        setSelectedRows(currentSelected);
      }
    } catch (error) {
      setSelectedRows(currentSelected);
      console.error('Error saving items:', error);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('failedToSaveBudgetItems')
      });

      // Notification automatique d'erreur
      notifyError(error, 'Sauvegarde des modifications');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one row to delete'
      });
      return;
    }

    const currentSelected = [...selectedRows];

    const result = await Swal.fire({
      title: t('areYouSure'),
      text: `${t('aboutToDelete')} ${selectedRows.length} ${t('itemsCount')}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('yesDelete'),
      cancelButtonText: t('cancel')
    });

    if (result.isConfirmed) {
      // Uncheck immediately for instant feedback
      setSelectedRows([]);
      try {
        const response = await axios.delete('/api/non-industrial-budget/batch-delete', {
          data: { ids: currentSelected }
        });

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `${response.data.deletedCount} item(s) deleted successfully`,
            timer: 1500,
            showConfirmButton: false
          });

          // Notification automatique
          notifyDeleteSuccess({
            count: response.data.deletedCount,
            summary: `${response.data.deletedCount} élément(s) supprimé(s) du budget`,
            details: `Département: ${activeDepartment}`
          });

          loadDepartmentData(activeDepartment);
        } else {
          setSelectedRows(currentSelected);
        }
      } catch (error) {
        setSelectedRows(currentSelected);
        console.error('Error deleting items:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete budget items'
        });

        // Notification automatique d'erreur
        notifyError(error, 'Suppression d\'éléments du budget');
      }
    }
  };

  const calculateTotal = () => {
    return budgetData.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0).toFixed(2);
  };

  const canEdit = (field) => {
    if (isAdmin) return true;
    if (user && user.role === 'User' && field === 'unitPrice') return false;
    if (isAchat) return field === 'currency' || field === 'unitPrice';
    return true;
  };

  return (
    <div className="non-industrial-budget-container" data-theme={theme}>
      {/* Header */}
      <div className="budget-header">
        <div className="header-left">
          <h1 className="budget-title">
            <DollarSign className="title-icon" />
            {t('nonIndustrialBudgetTitle')}
          </h1>
          <p className="budget-subtitle">{t('nonIndustrialBudgetSubtitle')}</p>
        </div>
        <div className="header-right">
          {/* Test Button - Simple et visible */}


          {/* Theme Toggle - Positionné en premier */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? t('switchToLightMode') : t('switchToDarkMode')}
            title={isDark ? t('switchToLightMode') : t('switchToDarkMode')}
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
              transition: '0.3s'
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span style={{ marginLeft: '0.25rem' }}>
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="language-switcher" role="group" aria-label={t('changeLanguage')}>
            <button
              className="language-pill"
              onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
              aria-label={t('changeLanguage')}
            >
              <Globe size={16} />
              <span>{i18n.language.toUpperCase()}</span>
            </button>
          </div>

          <div className="budget-stats">
            <div className="stat-card">
              <TrendingUp className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">{t('totalBudget')}</span>
                <span className="stat-value">${calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="department-tabs">
        {departments.map(dept => (
          <button
            key={dept.id}
            className={`dept-tab ${activeDepartment === dept.id ? 'active' : ''}`}
            onClick={() => handleDepartmentChange(dept.id)}
            style={{
              '--dept-color': dept.color
            }}
          >
            <span className="dept-icon">{dept.icon}</span>
            <span className="dept-name">{dept.name}</span>
            {departmentTotals[dept.id] && (
              <span className="dept-total">${departmentTotals[dept.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-left">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={18} />
            {t('addNewItem')}
          </button>
          {selectedRows.length > 0 && (
            <>
              <button
                className="btn btn-success"
                onClick={handleSaveSelected}
              >
                <Save size={18} />
                {t('saveSelected')} ({selectedRows.length})
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteSelected}
              >
                <Trash2 size={18} />
                {t('deleteSelected')}
              </button>
            </>
          )}
        </div>
        <div className="action-right">
          <span className="items-count">
            {budgetData.length} {t('itemsCount')} • {selectedRows.length} {t('itemsSelected')}
          </span>
        </div>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="add-form-card">
          <h3 className="form-title">
            <Plus size={20} />
            {t('addNewBudgetItem')}
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('department')} *</label>
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
              <label>{t('area')}</label>
              <input
                type="text"
                value={newItem.area}
                onChange={(e) => setNewItem({ ...newItem, area: e.target.value })}
                placeholder={t('enterPlaceholder') + ' ' + t('area').toLowerCase()}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t('equipment')} *</label>
              <input
                type="text"
                value={newItem.equipment}
                onChange={(e) => setNewItem({ ...newItem, equipment: e.target.value })}
                placeholder={t('enterPlaceholder') + ' ' + t('equipment').toLowerCase()}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('qty')} *</label>
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
              <label>{t('currency')} *</label>
              <select
                value={newItem.currency}
                onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
                className="form-select"
                required
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('unitPrice')} *</label>
              <input
                type="number"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value.replace(/^0+(?=\d)/, '') })}
                min="0"
                step="0.01"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('totalPrice')}</label>
              <input
                type="text"
                value={(newItem.qty * newItem.unitPrice).toFixed(2)}
                readOnly
                className="form-input readonly"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleAddItem}>
              <Plus size={18} />
              {t('addNewItem')}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowAddForm(false);
                setNewItem({
                  department: activeDepartment,
                  area: '',
                  equipment: '',
                  qty: 1,
                  currency: 'USD',
                  unitPrice: ''
                });
              }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="budget-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('loadingData')}</p>
          </div>
        ) : budgetData.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h3>{t('noBudgetItems')}</h3>
            <p>{t('clickAddNewItem')}</p>
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
                  />
                </th>
                <th>{t('number')}</th>
                <th>{t('department')}</th>
                <th>{t('area')}</th>
                <th>{t('equipment')}</th>
                <th>{t('qty')}</th>
                <th>{t('currency')}</th>
                <th>{t('unitPrice')}</th>
                <th>{t('totalPrice')}</th>
              </tr>
            </thead>
            <tbody>
              {budgetData.map((item, index) => (
                <tr
                  key={item.id}
                  className={selectedRows.includes(item.id) ? 'selected' : ''}
                >
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleRowSelect(item.id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    <span className="dept-badge" style={{ backgroundColor: departments.find(d => d.id === item.department)?.color }}>
                      {item.department}
                    </span>
                  </td>
                  <td>
                    {canEdit('area') && selectedRows.includes(item.id) ? (
                      <input
                        type="text"
                        value={item.area || ''}
                        onChange={(e) => handleUpdateRow(item.id, 'area', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      item.area || '-'
                    )}
                  </td>
                  <td>
                    {canEdit('equipment') && selectedRows.includes(item.id) ? (
                      <input
                        type="text"
                        value={item.equipment}
                        onChange={(e) => handleUpdateRow(item.id, 'equipment', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      item.equipment
                    )}
                  </td>
                  <td>
                    {canEdit('qty') && selectedRows.includes(item.id) ? (
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleUpdateRow(item.id, 'qty', parseInt(e.target.value) || 0)}
                        min="1"
                        className="table-input number"
                      />
                    ) : (
                      item.qty
                    )}
                  </td>
                  <td>
                    {canEdit('currency') && selectedRows.includes(item.id) ? (
                      <select
                        value={item.currency}
                        onChange={(e) => handleUpdateRow(item.id, 'currency', e.target.value)}
                        className="table-select"
                      >
                        {currencies.map(curr => (
                          <option key={curr} value={curr}>{curr}</option>
                        ))}
                      </select>
                    ) : (
                      item.currency
                    )}
                  </td>
                  <td>
                    {canEdit('unitPrice') && selectedRows.includes(item.id) ? (
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateRow(item.id, 'unitPrice', e.target.value.replace(/^0+(?=\d)/, ''))}
                        min="0"
                        step="0.01"
                        className="table-input number"
                      />
                    ) : (
                      `$${parseFloat(item.unitPrice || 0).toFixed(2)}`
                    )}
                  </td>
                  <td className="total-price">${parseFloat(item.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Total Bar Below Table */}
      <div className="total-bar-below-table">
        <table className="total-table">
          <tbody>
            <tr className="total-row">
              <td className="total-label">
                <strong>{t('total')}</strong>
              </td>
              <td className="total-value">
                <strong>${calculateTotal()}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NonIndustrialBudget;
