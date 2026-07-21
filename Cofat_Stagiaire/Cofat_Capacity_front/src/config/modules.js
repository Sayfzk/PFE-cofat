// Configuration des modules pour les notifications automatiques

export const MODULES = {
  STANDARD_EQUIPMENT: 'Standard Equipment',
  PLANNING_EQUIPMENT: 'Planning Equipment', 
  BUDGET_EQUIPMENT: 'Budget Equipment',
  CRITICAL_EQUIPMENT: 'Critical Equipment'
};

export const MODULE_COLORS = {
  [MODULES.STANDARD_EQUIPMENT]: '#3b82f6',
  [MODULES.PLANNING_EQUIPMENT]: '#10b981',
  [MODULES.BUDGET_EQUIPMENT]: '#f59e0b',
  [MODULES.CRITICAL_EQUIPMENT]: '#ef4444'
};

export const MODULE_ICONS = {
  [MODULES.STANDARD_EQUIPMENT]: '⚙️',
  [MODULES.PLANNING_EQUIPMENT]: '📅',
  [MODULES.BUDGET_EQUIPMENT]: '💰',
  [MODULES.CRITICAL_EQUIPMENT]: '🚨'
};

// Fonction utilitaire pour obtenir les informations d'un module
export const getModuleInfo = (moduleName) => {
  return {
    name: moduleName,
    color: MODULE_COLORS[moduleName] || '#64748b',
    icon: MODULE_ICONS[moduleName] || '📦'
  };
};