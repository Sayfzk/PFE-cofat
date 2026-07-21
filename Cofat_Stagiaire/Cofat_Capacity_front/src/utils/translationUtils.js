// src/utils/translationUtils.js
import { useTranslation } from 'react-i18next';

/**
 * Utilitaires pour faciliter la traduction dans l'application
 */

/**
 * Hook pour obtenir des traductions communes
 */
export const useCommonTranslations = () => {
  const { t } = useTranslation();

  return {
    // Actions communes
    save: t('save', 'Enregistrer'),
    delete: t('delete', 'Supprimer'),
    cancel: t('cancel', 'Annuler'),
    refresh: t('refresh', 'Actualiser'),
    import: t('import', 'Importer'),
    export: t('export', 'Exporter'),
    edit: t('edit', 'Modifier'),
    add: t('add', 'Ajouter'),
    
    // Messages de statut
    loading: t('infoLoading', 'Chargement...'),
    processing: t('infoProcessing', 'Traitement en cours...'),
    saving: t('infoSaving', 'Sauvegarde en cours...'),
    
    // Messages de succès
    saveSuccess: t('successDataSaved', 'Données sauvegardées avec succès'),
    deleteSuccess: t('successDataDeleted', 'Données supprimées avec succès'),
    importSuccess: t('successDataImported', 'Données importées avec succès'),
    
    // Messages d'erreur
    saveError: t('errorSavingData', 'Erreur lors de la sauvegarde'),
    deleteError: t('errorDeletingData', 'Erreur lors de la suppression'),
    importError: t('errorImportingData', 'Erreur lors de l\'importation'),
    loadError: t('errorLoadingData', 'Erreur lors du chargement'),
    
    // Confirmations
    confirmDelete: t('confirmDelete', 'Êtes-vous sûr de vouloir supprimer ?'),
    confirmDeleteAll: t('confirmDeleteAll', 'Êtes-vous sûr de vouloir supprimer toutes les données ?'),
    yes: t('yes', 'Oui'),
    no: t('no', 'Non'),
    
    // Modules
    spaceModule: t('spaceModule', 'Module Espace'),
    hrModule: t('hrModule', 'Module RH'),
    equipmentModule: t('equipmentModule', 'Module Équipement'),
    cofatGroupModule: t('cofatGroupModule', 'Module CofatGroup'),
    
    // Pages
    spacePage: t('spacePage', 'Gestion des Espaces'),
    hrPage: t('hrPage', 'Gestion des Ressources Humaines'),
    equipmentPage: t('equipmentPage', 'Gestion des Équipements'),
    cofatGroupPage: t('cofatGroupPage', 'Vue Consolidée CofatGroup'),
    
    // Interface
    project: t('project', 'Projet'),
    space: t('space', 'Espace'),
    occupation: t('occupation', 'Occupation'),
    
    // Fonction t pour traductions personnalisées
    t
  };
};

/**
 * Fonction pour traduire les messages SweetAlert
 */
export const getSweetAlertTranslations = (t) => ({
  deleteTitle: t('delete', 'Supprimer les données'),
  deleteText: (itemName) => t('confirmDeleteAll', `Êtes-vous sûr de vouloir supprimer toutes les données ${itemName} ?`),
  confirmButton: t('yes', 'Oui, supprimer !'),
  cancelButton: t('cancel', 'Annuler'),
  successTitle: t('deleted', 'Supprimé !'),
  successText: t('successDataDeleted', 'Toutes les données ont été supprimées avec succès.')
});

/**
 * Fonction pour traduire les messages de notification
 */
export const getNotificationMessages = (t) => ({
  success: {
    save: t('successDataSaved', 'Données sauvegardées avec succès'),
    delete: t('successDataDeleted', 'Données supprimées avec succès'),
    import: t('successDataImported', 'Données importées avec succès'),
    export: t('successDataExported', 'Données exportées avec succès')
  },
  error: {
    save: t('errorSavingData', 'Erreur lors de la sauvegarde'),
    delete: t('errorDeletingData', 'Erreur lors de la suppression'),
    import: t('errorImportingData', 'Erreur lors de l\'importation'),
    export: t('errorExportingData', 'Erreur lors de l\'exportation'),
    load: t('errorLoadingData', 'Erreur lors du chargement'),
    network: t('networkError', 'Erreur réseau'),
    server: t('serverError', 'Erreur serveur')
  },
  info: {
    loading: t('infoLoading', 'Chargement...'),
    saving: t('infoSaving', 'Sauvegarde en cours...'),
    processing: t('infoProcessing', 'Traitement en cours...'),
    importing: t('infoImporting', 'Importation en cours...'),
    exporting: t('infoExporting', 'Exportation en cours...')
  }
});

/**
 * Fonction pour traduire les en-têtes de tableau
 */
export const getTableHeaders = (t) => ({
  space: t('space', 'Espace'),
  project: t('project', 'Projet'),
  hrModule: t('hrModule', 'Ressources Humaines'),
  category: t('category', 'Catégorie'),
  type: t('type', 'Type'),
  value: t('value', 'Valeur'),
  total: t('total', 'Total')
});

/**
 * Wrapper pour les messages d'erreur avec traduction automatique
 */
export const createTranslatedError = (t, errorKey, fallback, error) => {
  const baseMessage = t(errorKey, fallback);
  return error ? `${baseMessage}: ${error.message || error}` : baseMessage;
};

/**
 * Wrapper pour les messages de succès avec traduction automatique
 */
export const createTranslatedSuccess = (t, successKey, fallback, details = '') => {
  const baseMessage = t(successKey, fallback);
  return details ? `${baseMessage} ${details}` : baseMessage;
};

export default {
  useCommonTranslations,
  getSweetAlertTranslations,
  getNotificationMessages,
  getTableHeaders,
  createTranslatedError,
  createTranslatedSuccess
};
