// Service de notification global pour tous les modules
// Gère les notifications automatiques pour chaque rôle lors des opérations save/delete

import { getAuthHeaders } from '../utils/apiUtils';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
  }

  // Ajouter un listener pour les notifications
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notifier tous les listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  // Ajouter une notification
  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    this.notifications.unshift(newNotification);

    // Limiter à 50 notifications maximum
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.notifyListeners();

    // Auto-suppression après 30 secondes pour les notifications temporaires
    if (newNotification.autoRemove !== false) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, 30000);
    }

    return newNotification;
  }

  // Supprimer une notification
  removeNotification(id) {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
    this.notifyListeners();
  }

  // Marquer comme lu
  markAsRead(id) {
    const notification = this.notifications.find(notif => notif.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Marquer toutes comme lues
  markAllAsRead() {
    this.notifications.forEach(notif => notif.read = true);
    this.notifyListeners();
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount() {
    return this.notifications.filter(notif => !notif.read).length;
  }

  // Créer une notification pour une opération de sauvegarde
  async notifySave(module, userRole, data) {
    const roleMessages = {
      'admin': {
        title: '✅ Sauvegarde effectuée',
        message: `Modification effectuée dans ${module}`,
        description: `${data.count || 1} élément(s) modifié(s) avec succès`,
        type: 'success'
      },
      'user': {
        title: '✅ Données sauvegardées',
        message: `Vos modifications ont été enregistrées dans ${module}`,
        description: `${data.count || 1} élément(s) mis à jour`,
        type: 'success'
      },
      'Achat': {
        title: '💰 Coûts mis à jour',
        message: `Coûts estimés modifiés dans ${module}`,
        description: `${data.count || 1} élément(s) actualisé(s)`,
        type: 'success'
      },
      'Super Admin': {
        title: '🔧 Sauvegarde système',
        message: `Modification système dans ${module}`,
        description: `${data.count || 1} élément(s) traité(s) par l'administrateur`,
        type: 'success'
      }
    };

    const config = roleMessages[userRole] || roleMessages['user'];

    const notificationData = {
      ...config,
      module,
      userRole,
      action: 'save',
      data: data.summary || `${data.count || 1} élément(s)`,
      details: data.details || null
    };

    // Stocker en base de données via l'API
    const savedNotification = await this.createNotificationAPI(notificationData);

    // Si l'API échoue, ajouter quand même localement
    if (!savedNotification) {
      return this.addNotification(notificationData);
    }

    return savedNotification;
  }

  // Créer une notification pour une opération de suppression
  async notifyDelete(module, userRole, data) {
    const roleMessages = {
      'admin': {
        title: '🗑️ Suppression effectuée',
        message: `Éléments supprimés de ${module}`,
        description: `${data.count || 1} élément(s) supprimé(s) définitivement`,
        type: 'warning'
      },
      'user': {
        title: '🗑️ Données supprimées',
        message: `Suppression effectuée dans ${module}`,
        description: `${data.count || 1} élément(s) retiré(s)`,
        type: 'warning'
      },
      'Achat': {
        title: '❌ Accès refusé',
        message: `Suppression non autorisée dans ${module}`,
        description: `Votre rôle ne permet pas cette action`,
        type: 'error'
      },
      'Super Admin': {
        title: '🔥 Suppression système',
        message: `Suppression administrative dans ${module}`,
        description: `${data.count || 1} élément(s) supprimé(s) par l'administrateur`,
        type: 'warning'
      }
    };

    const config = roleMessages[userRole] || roleMessages['user'];

    const notificationData = {
      ...config,
      module,
      userRole,
      action: 'delete',
      data: data.summary || `${data.count || 1} élément(s)`,
      details: data.details || null
    };

    // Stocker en base de données via l'API
    const savedNotification = await this.createNotificationAPI(notificationData);

    // Si l'API échoue, ajouter quand même localement
    if (!savedNotification) {
      return this.addNotification(notificationData);
    }

    return savedNotification;
  }

  // Créer une notification pour une opération d'ajout
  async notifyAdd(module, userRole, data) {
    const roleMessages = {
      'admin': {
        title: '➕ Nouvel élément',
        message: `Ajout effectué dans ${module}`,
        description: `${data.count || 1} nouvel élément créé`,
        type: 'info'
      },
      'user': {
        title: '➕ Élément ajouté',
        message: `Nouvel élément créé dans ${module}`,
        description: data.name || `Élément ajouté avec succès`,
        type: 'info'
      },
      'Achat': {
        title: '❌ Ajout non autorisé',
        message: `Création non autorisée dans ${module}`,
        description: `Votre rôle ne permet pas d'ajouter des éléments`,
        type: 'error'
      },
      'Super Admin': {
        title: '🆕 Création système',
        message: `Nouvel élément créé dans ${module}`,
        description: `Élément ajouté par l'administrateur système`,
        type: 'info'
      }
    };

    const config = roleMessages[userRole] || roleMessages['user'];

    const notificationData = {
      ...config,
      module,
      userRole,
      action: 'add',
      data: data.summary || data.name || 'Nouvel élément',
      details: data.details || null
    };

    // Stocker en base de données via l'API
    const savedNotification = await this.createNotificationAPI(notificationData);

    // Si l'API échoue, ajouter quand même localement
    if (!savedNotification) {
      return this.addNotification(notificationData);
    }

    return savedNotification;
  }

  // Créer une notification d'erreur
  notifyError(module, userRole, error) {
    return this.addNotification({
      title: '❌ Erreur',
      message: `Erreur dans ${module}`,
      description: error.message || 'Une erreur est survenue',
      type: 'error',
      module,
      userRole,
      action: 'error',
      data: error.details || null,
      autoRemove: false // Les erreurs ne se suppriment pas automatiquement
    });
  }

  // Obtenir toutes les notifications
  getAllNotifications() {
    return [...this.notifications];
  }

  // Filtrer les notifications par module
  getNotificationsByModule(module) {
    return this.notifications.filter(notif => notif.module === module);
  }

  // Filtrer les notifications par type
  getNotificationsByType(type) {
    return this.notifications.filter(notif => notif.type === type);
  }

  // Vider toutes les notifications
  clearAllNotifications() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Récupérer les notifications depuis l'API
  async loadNotificationsFromAPI() {
    try {
      const response = await fetch('http://172.23.23.31:9001/api/notifications', {
        method: 'GET',
        credentials: 'include', // Pour inclure les cookies d'authentification
        headers: {
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.notifications) {
          // Convertir les notifications API vers le format frontend
          const notifications = result.data.notifications.map(notif => ({
            id: notif.id,
            timestamp: notif.created_at,
            read: notif.read,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            description: notif.description,
            module: notif.module,
            userRole: 'loaded', // Indicateur pour les notifications chargées
            action: notif.action,
            data: notif.data || null,
            details: notif.details,
            autoRemove: false // Les notifications chargées ne se suppriment pas auto
          }));

          // Remplacer les notifications existantes par celles chargées
          this.notifications = notifications;
          this.notifyListeners();

          console.log(`💾 ${notifications.length} notification(s) chargée(s) depuis l'API`);
          return notifications;
        }
      } else {
        console.error('Erreur lors du chargement des notifications:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
    return [];
  }

  // Marquer une notification comme lue via l'API
  async markAsReadAPI(notificationId) {
    try {
      const response = await fetch('http://172.23.23.31:9001/api/notifications/mark-read', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          notification_ids: [notificationId]
        })
      });

      if (response.ok) {
        // Mettre à jour localement aussi
        this.markAsRead(notificationId);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
    return false;
  }

  // Créer une notification via l'API
  async createNotificationAPI(notificationData) {
    try {
      const response = await fetch('http://172.23.23.31:9001/api/notifications', {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Ajouter la notification localement aussi
          const notification = {
            id: result.data.id,
            timestamp: result.data.created_at,
            read: false,
            autoRemove: false,
            ...notificationData
          };

          this.notifications.unshift(notification);
          this.notifyListeners();
          return notification;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création de notification:', error);
    }
    return null;
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;
