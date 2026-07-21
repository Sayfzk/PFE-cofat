import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import './style/ModernAddEquipmentForm.css';

const ModernAddEquipmentForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  operations = [] 
}) => {
  const [formData, setFormData] = useState({
    Code_Eq: '',
    Operations: '',
    Equipment_Reference: '',
    Supplier_Technology: '',
    Type: '',
    Calculation_Method: '',
    Daily_Capacity: '',
    Equipment_Lifespan: '',
    QTY: 1,
    Estimated_Cost_EUR: '',
    Workstation_Dimensions: '',
    Reference_CDC: '',
    Reference_PR: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs obligatoires
    const requiredFields = [
      'Code_Eq', 'Operations', 'Equipment_Reference', 
      'Supplier_Technology', 'Type', 'Calculation_Method'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'Ce champ est obligatoire';
      }
    });

    // Validation spécifique pour les champs numériques
    if (formData.Daily_Capacity && !Number.isInteger(Number(formData.Daily_Capacity))) {
      newErrors.Daily_Capacity = 'Doit être un nombre entier';
    }

    if (formData.Equipment_Lifespan && !Number.isInteger(Number(formData.Equipment_Lifespan))) {
      newErrors.Equipment_Lifespan = 'Doit être un nombre entier';
    }

    if (formData.QTY && !Number.isInteger(Number(formData.QTY))) {
      newErrors.QTY = 'Doit être un nombre entier';
    }

    if (formData.Estimated_Cost_EUR && isNaN(Number(formData.Estimated_Cost_EUR))) {
      newErrors.Estimated_Cost_EUR = 'Doit être un nombre valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        Code_Eq: '',
        Operations: '',
        Equipment_Reference: '',
        Supplier_Technology: '',
        Type: '',
        Calculation_Method: '',
        Daily_Capacity: '',
        Equipment_Lifespan: '',
        QTY: 1,
        Estimated_Cost_EUR: '',
        Workstation_Dimensions: '',
        Reference_CDC: '',
        Reference_PR: ''
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldLabel = (fieldName) => {
    const labels = {
      Code_Eq: 'Code Équipement',
      Operations: 'Opération',
      Equipment_Reference: 'Référence Équipement',
      Supplier_Technology: 'Fournisseur/Technologie',
      Type: 'Type',
      Calculation_Method: 'Méthode de Calcul',
      Daily_Capacity: 'Capacité Journalière',
      Equipment_Lifespan: 'Durée de Vie (années)',
      QTY: 'Quantité',
      Estimated_Cost_EUR: 'Coût Estimé (€)',
      Workstation_Dimensions: 'Dimensions du Poste',
      Reference_CDC: 'Référence CDC',
      Reference_PR: 'Référence PR'
    };
    return labels[fieldName] || fieldName;
  };

  const renderField = (fieldName, type = 'text', options = null) => {
    const hasError = !!errors[fieldName];
    
    return (
      <div className={`form-field ${hasError ? 'error' : ''}`} key={fieldName}>
        <label className="field-label">
          {getFieldLabel(fieldName)}
          {['Code_Eq', 'Operations', 'Equipment_Reference', 'Supplier_Technology', 'Type', 'Calculation_Method'].includes(fieldName) && (
            <span className="required">*</span>
          )}
        </label>
        
        {type === 'select' ? (
          <select
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleChange}
            className={`field-input ${hasError ? 'error' : ''}`}
          >
            <option value="">Sélectionner...</option>
            {options && options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleChange}
            className={`field-input textarea ${hasError ? 'error' : ''}`}
            rows="3"
            placeholder={`Entrez ${getFieldLabel(fieldName).toLowerCase()}...`}
          />
        ) : (
          <input
            type={type}
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleChange}
            className={`field-input ${hasError ? 'error' : ''}`}
            placeholder={`Entrez ${getFieldLabel(fieldName).toLowerCase()}...`}
          />
        )}
        
        {hasError && (
          <div className="error-message">
            <AlertCircle size={14} />
            <span>{errors[fieldName]}</span>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modern-form-container" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">Nouvel Équipement</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-grid">
            {/* Section Identification */}
            <div className="form-section">
              <h3 className="section-title">Identification</h3>
              <div className="fields-grid">
                {renderField('Code_Eq')}
                {renderField('Operations', 'select', operations.map(op => ({ value: op.name, label: op.name })))}
                {renderField('Equipment_Reference')}
                {renderField('Type')}
              </div>
            </div>

            {/* Section Technique */}
            <div className="form-section">
              <h3 className="section-title">Spécifications Techniques</h3>
              <div className="fields-grid">
                {renderField('Supplier_Technology')}
                {renderField('Calculation_Method', 'textarea')}
                {renderField('Daily_Capacity', 'number')}
                {renderField('Equipment_Lifespan', 'number')}
                {renderField('QTY', 'number')}
              </div>
            </div>

            {/* Section Coût et Dimensions */}
            <div className="form-section">
              <h3 className="section-title">Coût et Dimensions</h3>
              <div className="fields-grid">
                {renderField('Estimated_Cost_EUR', 'number')}
                {renderField('Workstation_Dimensions')}
              </div>
            </div>

            {/* Section Références */}
            <div className="form-section">
              <h3 className="section-title">Références</h3>
              <div className="fields-grid">
                {renderField('Reference_CDC')}
                {renderField('Reference_PR')}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModernAddEquipmentForm;