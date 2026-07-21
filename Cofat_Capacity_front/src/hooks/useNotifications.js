import { useCallback } from 'react';
import notificationService from '../services/NotificationService';
import { useAuth } from '../Context/AuthContext';

/**
 * Hook personnalisé pour utiliser les notifications dans les modules
 * Fournit des méthodes simplifiées pour déclencher les notifications
 */
const useNotifications = (moduleName) => {
  // Gestion robuste du contexte d'authentification
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user;
  } catch (error) {
    console.warn('useAuth non disponible, utilisation du localStorage');
    // Fallback vers localStorage si useAuth n'est pas disponible
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch (e) {
        console.error('Erreur parsing user localStorage:', e);
      }
    }
  }
  
  // Fonction pour notifier une sauvegarde réussie
  const notifySaveSuccess = useCallback((data = {}) => {
    const userRole = user?.role || 'user';
    return notificationService.notifySave(moduleName, userRole, {
      count: data.count || 1,
      summary: data.summary,
      details: data.details
    });
  }, [moduleName, user?.role]);

  // Fonction pour notifier une suppression réussie
  const notifyDeleteSuccess = useCallback((data = {}) => {
    const userRole = user?.role || 'user';
    return notificationService.notifyDelete(moduleName, userRole, {
      count: data.count || 1,
      summary: data.summary,
      details: data.details
    });
  }, [moduleName, user?.role]);

  // Fonction pour notifier un ajout réussi
  const notifyAddSuccess = useCallback((data = {}) => {
    const userRole = user?.role || 'user';
    return notificationService.notifyAdd(moduleName, userRole, {
      count: data.count || 1,
      name: data.name,
      summary: data.summary,
      details: data.details
    });
  }, [moduleName, user?.role]);

  // Fonction pour notifier une erreur
  const notifyError = useCallback((error, details = null) => {
    const userRole = user?.role || 'user';
    return notificationService.notifyError(moduleName, userRole, {
      message: error.message || error,
      details: details
    });
  }, [moduleName, user?.role]);

  // Fonction générique pour notifier une action personnalisée
  const notify = useCallback((type, title, message, options = {}) => {
    const userRole = user?.role || 'user';
    return notificationService.addNotification({
      type,
      title,
      message,
      description: options.description,
      module: moduleName,
      userRole,
      action: options.action || 'custom',
      data: options.data,
      details: options.details,
      autoRemove: options.autoRemove
    });
  }, [moduleName, user?.role]);

  return {
    // Méthodes principales
    notifySaveSuccess,
    notifyDeleteSuccess,
    notifyAddSuccess,
    notifyError,
    notify,
    
    // Accès direct au service si besoin
    notificationService,
    
    // Info utilisateur courante
    currentUser: user,
    currentModule: moduleName
  };
};

export default useNotifications;