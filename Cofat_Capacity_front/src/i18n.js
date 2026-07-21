// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traductions pour le français
const fr = {
  translation: {
    // Navigation
    home: 'Accueil',
    dashboard: 'Tableau de bord',
    contact: 'Contact',
    login: 'Connexion',
    logout: 'Déconnexion',
    menu: 'Menu',

    // Modules
    equipment: 'Équipement',
    standardEquipment: 'Équipement Standard',
    space: 'Espace',
    hr: 'Ressources Humaines',
    cofatGroup: 'CofatGroup',

    // Common actions
    save: 'Enregistrer',
    delete: 'Supprimer',
    cancel: 'Annuler',
    refresh: 'Actualiser',
    import: 'Importer',
    export: 'Exporter',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',

    // Notifications
    saveSuccess: 'Données sauvegardées avec succès',
    saveError: 'Erreur lors de la sauvegarde',
    deleteSuccess: 'Données supprimées avec succès',
    deleteError: 'Erreur lors de la suppression',
    loadError: 'Erreur lors du chargement',
    importSuccess: 'Données importées avec succès',

    // Confirmations
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ?',
    confirmDeleteAll: 'Êtes-vous sûr de vouloir supprimer toutes les données de ce site ?',
    yes: 'Oui',
    no: 'Non',

    // Language
    language: 'Langue',
    changeLanguage: 'Changer de langue',
    selectLanguage: 'Sélectionner la langue',

    // Space module specific
    spaceStudy: 'Étude d\'Espace',
    cuttingArea: 'Zone de Découpe',
    leadPrep: 'Préparation Fils',
    assembly: 'Assemblage',
    totalArea: 'Surface Totale',
    occupation: 'Occupation',
    availableArea: 'Surface Disponible',

    // Space table labels
    'Cutting area': 'Zone de Découpe',
    'Lead prep': 'Préparation Fils',
    'SCANIA': 'SCANIA',
    'CLAAS': 'CLAAS',
    'VW': 'VW',
    'PROJECT 4': 'PROJET 4',
    'PROJECT 5': 'PROJET 5',
    'PROJECT 6': 'PROJET 6',
    'PROJECT 7': 'PROJET 7',
    'S-Total Assembly': 'S-Total Assemblage',
    'TOTAL AREA': 'SURFACE TOTALE',
    'Occupation': 'Occupation',
    'Available Area': 'Surface Disponible',

    // Common interface elements
    'Import Excel': 'Importer Excel',
    'SAVE': 'ENREGISTRER',
    'RECHARGER': 'RECHARGER',
    'SUPPRIMER': 'SUPPRIMER',
    'Space Study': 'Étude d\'Espace',
    'Project': 'Projet',
    'Actualiser': 'Actualiser',
    'CofatGroup': 'CofatGroup',
    'Consolidation Space': 'Consolidation Espace',
    'Consolidation HR': 'Consolidation RH',

    // HR module specific
    hrManagement: 'Gestion RH',
    assemblyDirect: 'Assemblage Direct',
    project: 'Projet',
    totalPlant: 'Total Usine',

    // Equipment Planning
    machineNeed: 'Besoin Machine',
    availableMachine: 'Machine Disponible',
    toOrder: 'À Commander',
    load: 'Charge',

    // CofatGroup
    consolidatedView: 'Vue Consolidée',
    allSites: 'Tous les Sites',
    consolidation: 'Consolidation',

    // Common UI
    loading: 'Chargement...',
    noData: 'Aucune donnée',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Attention',
    info: 'Information',

    // Sites
    sites: 'Sites',
    site: 'Site',


    // Time periods
    year: 'Année',
    month: 'Mois',
    quarter: 'Trimestre',

    // Table headers
    type: 'Type',
    category: 'Catégorie',
    value: 'Valeur',
    total: 'Total',

    // Buttons
    close: 'Fermer',
    open: 'Ouvrir',
    show: 'Afficher',
    hide: 'Masquer',

    // Status
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    completed: 'Terminé',

    // Settings
    settings: 'Paramètres',
    preferences: 'Préférences',
    profile: 'Profil',
    account: 'Compte',

    // Admin
    admin: 'Administrateur',
    adminDashboard: 'Tableau de bord Admin',
    userManagement: 'Gestion des utilisateurs',

    // Errors
    networkError: 'Erreur réseau',
    serverError: 'Erreur serveur',
    notFound: 'Non trouvé',
    unauthorized: 'Non autorisé',
    forbidden: 'Accès interdit',

    // Messages d'erreur spécifiques
    errorLoadingData: 'Erreur lors du chargement des données',
    errorSavingData: 'Erreur lors de la sauvegarde des données',
    errorDeletingData: 'Erreur lors de la suppression des données',
    errorImportingData: 'Erreur lors de l\'importation des données',
    errorExportingData: 'Erreur lors de l\'exportation des données',
    errorConnecting: 'Erreur de connexion au serveur',
    errorTimeout: 'Délai d\'attente dépassé',
    errorInvalidData: 'Données invalides',
    errorPermission: 'Permissions insuffisantes',
    errorFileFormat: 'Format de fichier non supporté',
    errorFileSize: 'Fichier trop volumineux',
    errorRequired: 'Ce champ est obligatoire',
    errorInvalidEmail: 'Adresse email invalide',
    errorPasswordTooShort: 'Mot de passe trop court',
    errorPasswordMismatch: 'Les mots de passe ne correspondent pas',

    // Messages de succès
    successDataLoaded: 'Données chargées avec succès',
    successDataSaved: 'Données sauvegardées avec succès',
    successDataDeleted: 'Données supprimées avec succès',
    successDataImported: 'Données importées avec succès',
    successDataExported: 'Données exportées avec succès',
    successFileUploaded: 'Fichier téléchargé avec succès',
    successOperationCompleted: 'Opération terminée avec succès',
    successChangesApplied: 'Modifications appliquées avec succès',
    successUserCreated: 'Utilisateur créé avec succès',
    successUserUpdated: 'Utilisateur mis à jour avec succès',
    successPasswordChanged: 'Mot de passe modifié avec succès',
    successEmailSent: 'Email envoyé avec succès',

    // Messages d'information
    infoLoading: 'Chargement en cours...',
    infoSaving: 'Sauvegarde en cours...',
    infoDeleting: 'Suppression en cours...',
    infoImporting: 'Importation en cours...',
    infoExporting: 'Exportation en cours...',
    infoProcessing: 'Traitement en cours...',
    infoConnecting: 'Connexion en cours...',
    infoUploading: 'Téléchargement en cours...',
    infoValidating: 'Validation en cours...',

    // Messages d'avertissement
    warningUnsavedChanges: 'Vous avez des modifications non sauvegardées',
    warningDataLoss: 'Cette action entraînera une perte de données',
    warningLargeFile: 'Ce fichier est volumineux et peut prendre du temps',
    warningOldBrowser: 'Votre navigateur n\'est pas à jour',
    warningSlowConnection: 'Connexion lente détectée',
    warningMaintenanceMode: 'Mode maintenance activé',

    // Interface utilisateur générale
    welcome: 'Bienvenue',
    welcomeBack: 'Bon retour',
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon après-midi',
    goodEvening: 'Bonsoir',
    pleaseWait: 'Veuillez patienter',
    processing: 'Traitement en cours',
    completed: 'Terminé',
    failed: 'Échec',
    retry: 'Réessayer',
    continue: 'Continuer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    finish: 'Terminer',
    skip: 'Ignorer',

    // Formulaires
    form: 'Formulaire',
    field: 'Champ',
    required: 'Obligatoire',
    optional: 'Optionnel',
    placeholder: 'Saisissez...',
    selectOption: 'Sélectionnez une option',
    selectFile: 'Sélectionner un fichier',
    dragDropFile: 'Glissez-déposez un fichier ici',
    browse: 'Parcourir',
    upload: 'Télécharger',
    download: 'Télécharger',

    // Tableaux et données
    table: 'Tableau',
    row: 'Ligne',
    column: 'Colonne',
    cell: 'Cellule',
    data: 'Données',
    records: 'Enregistrements',
    items: 'Éléments',
    results: 'Résultats',
    found: 'Trouvé(s)',
    showing: 'Affichage',
    of: 'de',
    page: 'Page',
    perPage: 'Par page',
    firstPage: 'Première page',
    lastPage: 'Dernière page',

    // Actions sur les données
    create: 'Créer',
    read: 'Lire',
    update: 'Mettre à jour',
    duplicate: 'Dupliquer',
    copy: 'Copier',
    paste: 'Coller',
    cut: 'Couper',
    undo: 'Annuler',
    redo: 'Rétablir',
    reset: 'Réinitialiser',
    clear: 'Effacer',

    // Modules spécifiques étendus
    spaceModule: 'Module Espace',
    hrModule: 'Module RH',
    equipmentModule: 'Module Équipement',
    cofatGroupModule: 'Module CofatGroup',

    // Titres de pages
    spacePage: 'Gestion des Espaces',
    hrPage: 'Gestion des Ressources Humaines',
    equipmentPage: 'Gestion des Équipements',
    cofatGroupPage: 'Vue Consolidée CofatGroup',
    dashboardPage: 'Tableau de Bord',

    // Boutons d'action étendus
    saveAndContinue: 'Sauvegarder et continuer',
    saveAndClose: 'Sauvegarder et fermer',
    cancelAndClose: 'Annuler et fermer',
    deleteSelected: 'Supprimer la sélection',
    exportSelected: 'Exporter la sélection',
    importFromFile: 'Importer depuis un fichier',
    exportToFile: 'Exporter vers un fichier',

    // États et statuts
    draft: 'Brouillon',
    published: 'Publié',
    archived: 'Archivé',
    deleted: 'Supprimé',
    enabled: 'Activé',
    disabled: 'Désactivé',
    online: 'En ligne',
    offline: 'Hors ligne',
    connected: 'Connecté',
    disconnected: 'Déconnecté',

    // Dates et temps
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    thisYear: 'Cette année',
    lastWeek: 'Semaine dernière',
    lastMonth: 'Mois dernier',
    lastYear: 'Année dernière',

    // Unités et mesures
    unit: 'Unité',
    quantity: 'Quantité',
    amount: 'Montant',
    percentage: 'Pourcentage',
    count: 'Nombre',
    size: 'Taille',
    length: 'Longueur',
    width: 'Largeur',
    height: 'Hauteur',
    area: 'Surface',
    volume: 'Volume',
    weight: 'Poids',

    // Équipements spécifiques
    equipment: 'Équipement',
    standardEquipment: 'Équipement Standard',
    planningEquipment: 'Planification Équipement',
    equipmentType: 'Type d\'Équipement',
    equipmentName: 'Nom de l\'Équipement',
    equipmentCode: 'Code Équipement',
    equipmentStatus: 'Statut Équipement',
    equipmentCategory: 'Catégorie Équipement',
    machineNeed: 'Besoin Machine',
    availableMachine: 'Machine Disponible',
    toOrder: 'À Commander',
    machineType: 'Type de Machine',
    capacity: 'Capacité',

    // Page d'accueil
    welcome: 'Bienvenue',
    welcomeMessage: 'Bienvenue dans l\'application COFAT',
    dashboard: 'Tableau de Bord',
    overview: 'Vue d\'ensemble',
    quickActions: 'Actions Rapides',
    recentActivity: 'Activité Récente',
    statistics: 'Statistiques',
    modules: 'Modules',
    accessModule: 'Accéder au module',

    // Actions équipements
    addEquipment: 'Ajouter Équipement',
    editEquipment: 'Modifier Équipement',
    deleteEquipment: 'Supprimer Équipement',
    viewEquipment: 'Voir Équipement',
    equipmentList: 'Liste des Équipements',
    equipmentDetails: 'Détails de l\'Équipement',

    // Statuts équipements
    available: 'Disponible',
    inUse: 'En Utilisation',
    maintenance: 'Maintenance',
    outOfOrder: 'Hors Service',
    ordered: 'Commandé',
    delivered: 'Livré',

    // Messages équipements
    equipmentAdded: 'Équipement ajouté avec succès',
    equipmentUpdated: 'Équipement mis à jour avec succès',
    equipmentDeleted: 'Équipement supprimé avec succès',
    equipmentNotFound: 'Équipement non trouvé',
    equipmentError: 'Erreur avec l\'équipement',

    // Navigation et menus
    goToModule: 'Aller au module',
    backToHome: 'Retour à l\'accueil',
    viewAll: 'Voir tout',
    showMore: 'Afficher plus',
    showLess: 'Afficher moins',

    // Standard Equipment Module
    standardEquipmentTitle: 'Équipement Standard',
    standardEquipmentSubtitle: 'Suivi et gestion des équipements par opération',
    selectOperations: 'Sélectionner les Opérations',
    allOperations: 'Toutes les Opérations',
    selected: 'sélectionné(s)',
    searchPlaceholder: 'Rechercher par code, nom d\'équipement...',

    // Operations
    operationCoupe: 'Coupe Faisceau',
    operationPreparation: 'Préparation',
    operationAssemblage: 'Assemblage',
    operationControleElectrique: 'Contrôle Électrique',
    operationConditionnement: 'Conditionnement',
    operationEquipementDivers: 'Équipement Divers',

    // Table headers
    equipmentCode: 'Code Équipement',
    operation: 'Opération',
    equipment: 'Équipement',
    supplierTechnology: 'Fournisseur/Technologie',
    type: 'Type',
    calculationMethod: 'Méthode de Calcul',
    dailyCapacity: 'Capacité Journalière',
    lifespan: 'Durée de Vie (années)',
    estimatedCost: 'Coût Estimé (EUR)',
    workstationDimensions: 'Dimensions du Poste',
    referenceCDC: 'Référence CDC',
    referencePR: 'Référence PR',

    // Actions
    addEquipment: 'Ajouter Équipement',
    exportExcel: 'Exporter Excel',
    exportPDF: 'Exporter PDF',
    saveSelected: 'Enregistrer la Sélection',
    deleteSelected: 'Supprimer la Sélection',

    // Messages
    pendingChanges: 'modifications en attente',
    exportSuccess: 'Export Réussi',
    exportFailed: 'Échec de l\'Export',
    dataExportedTo: 'Données exportées vers',
    unableToExport: 'Impossible d\'exporter les données',
    noEquipmentFound: 'Aucun équipement trouvé',
    selectOperationOrSearch: 'Veuillez sélectionner des opérations dans le menu déroulant ou utiliser la barre de recherche pour afficher les données d\'équipement',
    tryAdjustingFilters: 'Essayez d\'ajuster vos filtres ou d\'ajouter un nouvel équipement',
    loadingData: 'Chargement des données...',
    totalEstimatedCost: 'Coût Total Estimé',

    // Modal
    newEquipment: 'Nouvel Équipement',
    identification: 'Identification',
    technicalSpecifications: 'Spécifications Techniques',
    costAndDimensions: 'Coût et Dimensions',
    equipmentCodeLabel: 'Code Équipement',
    operationLabel: 'Opération',
    equipmentReferenceLabel: 'Référence Équipement',
    typeLabel: 'Type',
    supplierTechnologyLabel: 'Fournisseur/Technologie',
    calculationMethodLabel: 'Méthode de Calcul',
    dailyCapacityLabel: 'Capacité Journalière',
    lifespanLabel: 'Durée de Vie (années)',
    estimatedCostLabel: 'Coût Estimé (€)',
    workstationDimensionsLabel: 'Dimensions du Poste',
    referenceCDCLabel: 'Référence CDC',
    referencePRLabel: 'Référence PR',
    selectOption: 'Sélectionner...',
    enterPlaceholder: 'Entrez',

    // Theme
    lightMode: 'Mode Clair',
    darkMode: 'Mode Sombre',
    toggleTheme: 'Basculer le Thème',
    switchToLightMode: 'Passer en mode clair',
    switchToDarkMode: 'Passer en mode sombre',

    // Non Industrial Budget Module
    nonIndustrialBudget: 'Budget Non Industriel',
    nonIndustrialBudgetTitle: 'Budget Non Industriel',
    nonIndustrialBudgetSubtitle: 'Gérer les budgets des départements non industriels',
    manageBudgets: 'Gérer les budgets des départements non industriels',
    totalBudget: 'Budget Total',
    addNewItem: 'Ajouter un Nouvel Élément',
    saveSelected: 'Enregistrer la Sélection',
    itemsCount: 'éléments',
    itemsSelected: 'sélectionné(s)',
    addNewBudgetItem: 'Ajouter un Nouvel Élément de Budget',
    noBudgetItems: 'Aucun élément de budget',
    clickAddNewItem: 'Cliquez sur "Ajouter un Nouvel Élément" pour créer votre première entrée budgétaire',

    // Departments
    departmentIT: 'IT',
    departmentHR: 'RH',
    departmentQuality: 'Qualité',
    departmentBuilding: 'Bâtiment',
    departmentLogistics: 'Logistique',
    departmentMaintenance: 'Maintenance',
    departmentProduction: 'Production',

    // Budget Form Fields
    department: 'Département',
    area: 'Zone',
    qty: 'Quantité',
    currency: 'Devise',
    unitPrice: 'Prix Unitaire',
    totalPrice: 'Prix Total',

    // Budget Messages
    missingFields: 'Champs Manquants',
    fillAllFields: 'Veuillez remplir tous les champs obligatoires',
    budgetItemAdded: 'Élément de budget ajouté avec succès',
    failedToAddBudgetItem: 'Échec de l\'ajout de l\'élément de budget',
    noSelection: 'Aucune Sélection',
    selectAtLeastOne: 'Veuillez sélectionner au moins une ligne',
    budgetItemsSaved: 'Éléments de budget sauvegardés avec succès',
    failedToSaveBudgetItems: 'Échec de la sauvegarde des éléments de budget',
    areYouSure: 'Êtes-vous sûr ?',
    aboutToDelete: 'Vous êtes sur le point de supprimer',
    yesDelete: 'Oui, supprimer !',
    budgetItemsDeleted: 'éléments supprimés avec succès',
    failedToDeleteBudgetItems: 'Échec de la suppression des éléments de budget',

    // Equipment Planning Module
    equipmentPlanning: 'Planification Équipement',
    equipmentPlanningTitle: 'Planification des Équipements',
    selectMachine: 'Sélectionner une Machine',
    importData: 'Importer des Données',
    saveData: 'Enregistrer les Données',
    deleteData: 'Supprimer les Données',
    machineNeed: 'Besoin Machine',
    availableMachine: 'Machine Disponible',
    toOrder: 'À Commander',
    loadOccupation: 'Charge (Occupation)',
    planningDataSaved: 'Données de planification sauvegardées avec succès',
    planningDataDeleted: 'Données de planification supprimées avec succès',
    selectMachineFirst: 'Veuillez sélectionner une machine avant d\'importer des données',
    dataImportedSuccessfully: 'Données importées avec succès pour',
    equipmentAddedSuccessfully: 'Équipement ajouté avec succès',
    equipmentDataDeleted: 'Données d\'équipement supprimées avec succès',

    // Space Module
    spaceManagement: 'Gestion des Espaces',
    spaceStudyTitle: 'Étude d\'Espace',
    cuttingArea: 'Zone de Découpe',
    leadPrep: 'Préparation Fils',
    assembly: 'Assemblage',
    totalArea: 'Surface Totale',
    occupation: 'Occupation',
    availableSpace: 'Espace Disponible',
    availableArea: 'Surface Disponible',
    noSpaceData: 'Aucune donnée d\'espace disponible pour ce site',
    importExcelToDefineStructure: 'Importez un fichier Excel pour définir la structure du tableau',
    spaceDataSaved: 'Données d\'espace sauvegardées avec succès',
    spaceDataDeleted: 'Toutes les données d\'espace ont été supprimées avec succès',
    occupationRate: 'Taux d\'occupation',

    // HR Module
    hrManagement: 'Gestion RH',
    hrTitle: 'Gestion des Ressources Humaines',
    humanResources: 'Ressources Humaines',
    assemblyDirect: 'Assemblage Direct',
    direct: 'Direct',
    indirect: 'Indirect',
    sTotalAssembly: 'S-Total Assemblage',
    sTotalProduction: 'S-Total Production',
    sTotal: 'S-Total',
    totalPlant: 'Total Usine',
    noHRData: 'Aucune donnée RH disponible pour ce site',
    hrDataSaved: 'Données RH sauvegardées avec succès',
    hrDataDeleted: 'Toutes les données RH ont été supprimées avec succès',
    hrChart: 'Graphique RH',

    // Common Table Headers
    number: 'N°',
    actions: 'Actions',

    // Common Time Periods
    mo: 'MO',
    quarter: 'T',

    // Common Buttons Extended
    addNew: 'Ajouter Nouveau',
    saveChanges: 'Enregistrer les Modifications',
    discardChanges: 'Annuler les Modifications',
    confirmAction: 'Confirmer l\'Action',

    // Site Names
    siteNotRecognized: 'Site non reconnu',
    availableSites: 'Sites disponibles',

    // Loading States
    loadingSites: 'Chargement des sites...',
    loadingEquipment: 'Chargement des équipements...',
    savingData: 'Sauvegarde des données...',
    deletingData: 'Suppression des données...',

    // Validation Messages
    enterNumericValue: 'Veuillez entrer une valeur numérique entière',
    enterDecimalValue: 'Veuillez entrer une valeur numérique (décimale autorisée)',
    invalidDataFormat: 'Les données importées ne correspondent pas au format attendu',
    noValidData: 'Aucune donnée valide à sauvegarder'
  }
};

// English translations
const en = {
  translation: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    contact: 'Contact',
    login: 'Login',
    logout: 'Logout',
    menu: 'Menu',

    // Modules
    equipment: 'Equipment',
    standardEquipment: 'Standard Equipment',
    space: 'Space',
    hr: 'Human Resources',
    cofatGroup: 'CofatGroup',

    // Common actions
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
    refresh: 'Refresh',
    import: 'Import',
    export: 'Export',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',

    // Notifications
    saveSuccess: 'Data saved successfully',
    saveError: 'Error saving data',
    deleteSuccess: 'Data deleted successfully',
    deleteError: 'Error deleting data',
    loadError: 'Error loading data',
    importSuccess: 'Data imported successfully',

    // Confirmations
    confirmDelete: 'Are you sure you want to delete?',
    confirmDeleteAll: 'Are you sure you want to delete all data for this site?',
    yes: 'Yes',
    no: 'No',

    // Language
    language: 'Language',
    changeLanguage: 'Change Language',
    selectLanguage: 'Select Language',

    // Space module
    spaceStudy: 'Space Study',
    cuttingArea: 'Cutting Area',
    leadPrep: 'Lead Prep',
    assembly: 'Assembly',
    totalArea: 'Total Area',
    occupation: 'Occupation',
    availableArea: 'Available Area',

    // Space table labels
    'Cutting area': 'Cutting Area',
    'Lead prep': 'Lead Prep',
    'SCANIA': 'SCANIA',
    'CLAAS': 'CLAAS',
    'VW': 'VW',
    'PROJECT 4': 'PROJECT 4',
    'PROJECT 5': 'PROJECT 5',
    'PROJECT 6': 'PROJECT 6',
    'PROJECT 7': 'PROJECT 7',
    'S-Total Assembly': 'S-Total Assembly',
    'TOTAL AREA': 'TOTAL AREA',
    'Occupation': 'Occupation',
    'Available Area': 'Available Area',

    // Common interface elements
    'Import Excel': 'Import Excel',
    'SAVE': 'SAVE',
    'RECHARGER': 'RELOAD',
    'SUPPRIMER': 'DELETE',
    'Space Study': 'Space Study',
    'Project': 'Project',
    'Actualiser': 'Refresh',
    'CofatGroup': 'CofatGroup',
    'Consolidation Space': 'Space Consolidation',
    'Consolidation HR': 'HR Consolidation',

    // HR module
    hrManagement: 'HR Management',
    assemblyDirect: 'Assembly Direct',
    project: 'Project',
    totalPlant: 'Total Plant',

    // Equipment Planning
    machineNeed: 'Machine Need',
    availableMachine: 'Available Machine',
    toOrder: 'To Order',
    load: 'Load',

    // CofatGroup
    consolidatedView: 'Consolidated View',
    allSites: 'All Sites',
    consolidation: 'Consolidation',

    // Common UI
    loading: 'Loading...',
    noData: 'No data',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',

    // Sites
    sites: 'Sites',
    site: 'Site',


    // Time periods
    year: 'Year',
    month: 'Month',
    quarter: 'Quarter',

    // Table headers
    type: 'Type',
    category: 'Category',
    value: 'Value',
    total: 'Total',

    // Buttons
    close: 'Close',
    open: 'Open',
    show: 'Show',
    hide: 'Hide',

    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',

    // Settings
    settings: 'Settings',
    preferences: 'Preferences',
    profile: 'Profile',
    account: 'Account',

    // Admin
    admin: 'Administrator',
    adminDashboard: 'Admin Dashboard',
    userManagement: 'User Management',

    // Errors
    networkError: 'Network error',
    serverError: 'Server error',
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    forbidden: 'Access forbidden',

    // Specific error messages
    errorLoadingData: 'Error loading data',
    errorSavingData: 'Error saving data',
    errorDeletingData: 'Error deleting data',
    errorImportingData: 'Error importing data',
    errorExportingData: 'Error exporting data',
    errorConnecting: 'Server connection error',
    errorTimeout: 'Request timeout',
    errorInvalidData: 'Invalid data',
    errorPermission: 'Insufficient permissions',
    errorFileFormat: 'Unsupported file format',
    errorFileSize: 'File too large',
    errorRequired: 'This field is required',
    errorInvalidEmail: 'Invalid email address',
    errorPasswordTooShort: 'Password too short',
    errorPasswordMismatch: 'Passwords do not match',

    // Success messages
    successDataLoaded: 'Data loaded successfully',
    successDataSaved: 'Data saved successfully',
    successDataDeleted: 'Data deleted successfully',
    successDataImported: 'Data imported successfully',
    successDataExported: 'Data exported successfully',
    successFileUploaded: 'File uploaded successfully',
    successOperationCompleted: 'Operation completed successfully',
    successChangesApplied: 'Changes applied successfully',
    successUserCreated: 'User created successfully',
    successUserUpdated: 'User updated successfully',
    successPasswordChanged: 'Password changed successfully',
    successEmailSent: 'Email sent successfully',

    // Information messages
    infoLoading: 'Loading...',
    infoSaving: 'Saving...',
    infoDeleting: 'Deleting...',
    infoImporting: 'Importing...',
    infoExporting: 'Exporting...',
    infoProcessing: 'Processing...',
    infoConnecting: 'Connecting...',
    infoUploading: 'Uploading...',
    infoValidating: 'Validating...',

    // Warning messages
    warningUnsavedChanges: 'You have unsaved changes',
    warningDataLoss: 'This action will result in data loss',
    warningLargeFile: 'This file is large and may take time',
    warningOldBrowser: 'Your browser is not up to date',
    warningSlowConnection: 'Slow connection detected',
    warningMaintenanceMode: 'Maintenance mode enabled',

    // General user interface
    welcome: 'Welcome',
    welcomeBack: 'Welcome back',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    pleaseWait: 'Please wait',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    retry: 'Retry',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    skip: 'Skip',

    // Forms
    form: 'Form',
    field: 'Field',
    required: 'Required',
    optional: 'Optional',
    placeholder: 'Enter...',
    selectOption: 'Select an option',
    selectFile: 'Select file',
    dragDropFile: 'Drag and drop a file here',
    browse: 'Browse',
    upload: 'Upload',
    download: 'Download',

    // Tables and data
    table: 'Table',
    row: 'Row',
    column: 'Column',
    cell: 'Cell',
    data: 'Data',
    records: 'Records',
    items: 'Items',
    results: 'Results',
    found: 'Found',
    showing: 'Showing',
    of: 'of',
    page: 'Page',
    perPage: 'Per page',
    firstPage: 'First page',
    lastPage: 'Last page',

    // Data actions
    create: 'Create',
    read: 'Read',
    update: 'Update',
    duplicate: 'Duplicate',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    reset: 'Reset',
    clear: 'Clear',

    // Extended specific modules
    spaceModule: 'Space Module',
    hrModule: 'HR Module',
    equipmentModule: 'Equipment Module',
    cofatGroupModule: 'CofatGroup Module',

    // Page titles
    spacePage: 'Space Management',
    hrPage: 'Human Resources Management',
    equipmentPage: 'Equipment Management',
    cofatGroupPage: 'CofatGroup Consolidated View',
    dashboardPage: 'Dashboard',

    // Extended action buttons
    saveAndContinue: 'Save and continue',
    saveAndClose: 'Save and close',
    cancelAndClose: 'Cancel and close',
    deleteSelected: 'Delete selected',
    exportSelected: 'Export selected',
    importFromFile: 'Import from file',
    exportToFile: 'Export to file',

    // States and statuses
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
    deleted: 'Deleted',
    enabled: 'Enabled',
    disabled: 'Disabled',
    online: 'Online',
    offline: 'Offline',
    connected: 'Connected',
    disconnected: 'Disconnected',

    // Dates and time
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    thisMonth: 'This month',
    thisYear: 'This year',
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastYear: 'Last year',

    // Units and measurements
    unit: 'Unit',
    quantity: 'Quantity',
    amount: 'Amount',
    percentage: 'Percentage',
    count: 'Count',
    size: 'Size',
    length: 'Length',
    width: 'Width',
    height: 'Height',
    area: 'Area',
    volume: 'Volume',
    weight: 'Weight',

    // Equipment specific
    equipment: 'Equipment',
    standardEquipment: 'Standard Equipment',
    planningEquipment: 'Equipment Planning',
    equipmentType: 'Equipment Type',
    equipmentName: 'Equipment Name',
    equipmentCode: 'Equipment Code',
    equipmentStatus: 'Equipment Status',
    equipmentCategory: 'Equipment Category',
    machineNeed: 'Machine Need',
    availableMachine: 'Available Machine',
    toOrder: 'To Order',
    machineType: 'Machine Type',
    capacity: 'Capacity',

    // Home page
    welcome: 'Welcome',
    welcomeMessage: 'Welcome to COFAT Application',
    dashboard: 'Dashboard',
    overview: 'Overview',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    statistics: 'Statistics',
    modules: 'Modules',
    accessModule: 'Access Module',

    // Equipment actions
    addEquipment: 'Add Equipment',
    editEquipment: 'Edit Equipment',
    deleteEquipment: 'Delete Equipment',
    viewEquipment: 'View Equipment',
    equipmentList: 'Equipment List',
    equipmentDetails: 'Equipment Details',

    // Equipment statuses
    available: 'Available',
    inUse: 'In Use',
    maintenance: 'Maintenance',
    outOfOrder: 'Out of Order',
    ordered: 'Ordered',
    delivered: 'Delivered',

    // Equipment messages
    equipmentAdded: 'Equipment added successfully',
    equipmentUpdated: 'Equipment updated successfully',
    equipmentDeleted: 'Equipment deleted successfully',
    equipmentNotFound: 'Equipment not found',
    equipmentError: 'Equipment error',

    // Navigation and menus
    goToModule: 'Go to module',
    backToHome: 'Back to home',
    viewAll: 'View all',
    showMore: 'Show more',
    showLess: 'Show less',

    // Standard Equipment Module
    standardEquipmentTitle: 'Standard Equipment',
    standardEquipmentSubtitle: 'Equipment tracking and management by operation',
    selectOperations: 'Select Operations',
    allOperations: 'All Operations',
    selected: 'selected',
    searchPlaceholder: 'Search by code, equipment name...',

    // Operations
    operationCoupe: 'Wire Cutting',
    operationPreparation: 'Preparation',
    operationAssemblage: 'Assembly',
    operationControleElectrique: 'Electrical Control',
    operationConditionnement: 'Packaging',
    operationEquipementDivers: 'Miscellaneous Equipment',

    // Table headers
    equipmentCode: 'Equipment Code',
    operation: 'Operation',
    equipment: 'Equipment',
    supplierTechnology: 'Supplier/Technology',
    type: 'Type',
    calculationMethod: 'Calculation Method',
    dailyCapacity: 'Daily Capacity',
    lifespan: 'Lifespan (years)',
    estimatedCost: 'Estimated Cost (EUR)',
    workstationDimensions: 'Workstation Dimensions',
    referenceCDC: 'Reference CDC',
    referencePR: 'Reference PR',

    // Actions
    addEquipment: 'Add Equipment',
    exportExcel: 'Export Excel',
    exportPDF: 'Export PDF',
    saveSelected: 'Save Selected',
    deleteSelected: 'Delete Selected',

    // Messages
    pendingChanges: 'pending changes',
    exportSuccess: 'Export Successful',
    exportFailed: 'Export Failed',
    dataExportedTo: 'Data exported to',
    unableToExport: 'Unable to export data',
    noEquipmentFound: 'No equipment found',
    selectOperationOrSearch: 'Please select operations from the dropdown or use the search bar to display equipment data',
    tryAdjustingFilters: 'Try adjusting your filters or add new equipment',
    loadingData: 'Loading data...',
    totalEstimatedCost: 'Total Estimated Cost',

    // Modal
    newEquipment: 'New Equipment',
    identification: 'Identification',
    technicalSpecifications: 'Technical Specifications',
    costAndDimensions: 'Cost and Dimensions',
    equipmentCodeLabel: 'Equipment Code',
    operationLabel: 'Operation',
    equipmentReferenceLabel: 'Equipment Reference',
    typeLabel: 'Type',
    supplierTechnologyLabel: 'Supplier/Technology',
    calculationMethodLabel: 'Calculation Method',
    dailyCapacityLabel: 'Daily Capacity',
    lifespanLabel: 'Lifespan (years)',
    estimatedCostLabel: 'Estimated Cost (€)',
    workstationDimensionsLabel: 'Workstation Dimensions',
    referenceCDCLabel: 'Reference CDC',
    referencePRLabel: 'Reference PR',
    selectOption: 'Select...',
    enterPlaceholder: 'Enter',

    // Theme
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    toggleTheme: 'Toggle Theme',
    switchToLightMode: 'Switch to light mode',
    switchToDarkMode: 'Switch to dark mode',

    // Non Industrial Budget Module
    nonIndustrialBudget: 'Non Industrial Budget',
    nonIndustrialBudgetTitle: 'Non Industrial Budget',
    nonIndustrialBudgetSubtitle: 'Manage budgets for non-industrial departments',
    manageBudgets: 'Manage budgets for non-industrial departments',
    totalBudget: 'Total Budget',
    addNewItem: 'Add New Item',
    saveSelected: 'Save Selected',
    itemsCount: 'items',
    itemsSelected: 'selected',
    addNewBudgetItem: 'Add New Budget Item',
    noBudgetItems: 'No budget items yet',
    clickAddNewItem: 'Click "Add New Item" to create your first budget entry',

    // Departments
    departmentIT: 'IT',
    departmentHR: 'HR',
    departmentQuality: 'Quality',
    departmentBuilding: 'Building',
    departmentLogistics: 'Logistics',
    departmentMaintenance: 'Maintenance',
    departmentProduction: 'Production',

    // Budget Form Fields
    department: 'Department',
    area: 'Area',
    qty: 'Qty',
    currency: 'Currency',
    unitPrice: 'Unit Price',
    totalPrice: 'Total Price',

    // Budget Messages
    missingFields: 'Missing Fields',
    fillAllFields: 'Please fill in all required fields',
    budgetItemAdded: 'Budget item added successfully',
    failedToAddBudgetItem: 'Failed to add budget item',
    noSelection: 'No Selection',
    selectAtLeastOne: 'Please select at least one row',
    budgetItemsSaved: 'Budget items saved successfully',
    failedToSaveBudgetItems: 'Failed to save budget items',
    areYouSure: 'Are you sure?',
    aboutToDelete: 'You are about to delete',
    yesDelete: 'Yes, delete!',
    budgetItemsDeleted: 'items deleted successfully',
    failedToDeleteBudgetItems: 'Failed to delete budget items',

    // Equipment Planning Module
    equipmentPlanning: 'Equipment Planning',
    equipmentPlanningTitle: 'Equipment Planning',
    selectMachine: 'Select Machine',
    importData: 'Import Data',
    saveData: 'Save Data',
    deleteData: 'Delete Data',
    machineNeed: 'Machine Need',
    availableMachine: 'Available Machine',
    toOrder: 'To Order',
    loadOccupation: 'Load (Occupation)',
    planningDataSaved: 'Planning data saved successfully',
    planningDataDeleted: 'Planning data deleted successfully',
    selectMachineFirst: 'Please select a machine before importing data',
    dataImportedSuccessfully: 'Data imported successfully for',
    equipmentAddedSuccessfully: 'Equipment added successfully',
    equipmentDataDeleted: 'Equipment data deleted successfully',

    // Space Module
    spaceManagement: 'Space Management',
    spaceStudyTitle: 'Space Study',
    cuttingArea: 'Cutting Area',
    leadPrep: 'Lead Prep',
    assembly: 'Assembly',
    totalArea: 'Total Area',
    occupation: 'Occupation',
    availableSpace: 'Available Space',
    availableArea: 'Available Area',
    noSpaceData: 'No space data available for this site',
    importExcelToDefineStructure: 'Import an Excel file to define the table structure',
    spaceDataSaved: 'Space data saved successfully',
    spaceDataDeleted: 'All space data has been deleted successfully',
    occupationRate: 'Occupation Rate',

    // HR Module
    hrManagement: 'HR Management',
    hrTitle: 'Human Resources Management',
    humanResources: 'Human Resources',
    assemblyDirect: 'Assembly Direct',
    direct: 'Direct',
    indirect: 'Indirect',
    sTotalAssembly: 'S-Total Assembly',
    sTotalProduction: 'S-Total Production',
    sTotal: 'S-Total',
    totalPlant: 'Total Plant',
    noHRData: 'No HR data available for this site',
    hrDataSaved: 'HR data saved successfully',
    hrDataDeleted: 'All HR data has been deleted successfully',
    hrChart: 'HR Chart',

    // Common Table Headers
    number: 'No.',
    actions: 'Actions',

    // Common Time Periods
    mo: 'MO',
    quarter: 'Q',

    // Common Buttons Extended
    addNew: 'Add New',
    saveChanges: 'Save Changes',
    discardChanges: 'Discard Changes',
    confirmAction: 'Confirm Action',

    // Site Names
    siteNotRecognized: 'Site not recognized',
    availableSites: 'Available sites',

    // Loading States
    loadingSites: 'Loading sites...',
    loadingEquipment: 'Loading equipment...',
    savingData: 'Saving data...',
    deletingData: 'Deleting data...',

    // Validation Messages
    enterNumericValue: 'Please enter an integer numeric value',
    enterDecimalValue: 'Please enter a numeric value (decimal allowed)',
    invalidDataFormat: 'Imported data does not match expected format',
    noValidData: 'No valid data to save'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr,
      en
    },
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
