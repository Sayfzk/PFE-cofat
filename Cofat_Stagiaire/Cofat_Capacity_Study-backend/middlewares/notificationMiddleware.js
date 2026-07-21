const { createNotificationForUser } = require('../routers/notifications');

/**
 * Middleware pour créer automatiquement des notifications après les opérations CRUD
 * @param {string} moduleName - Nom du module (ex: 'Planning Equipment')
 * @param {string} action - Type d'action ('save', 'delete', 'add')
 * @param {function} getDataSummary - Fonction pour extraire le résumé des données
 */
const autoNotify = (moduleName, action, getDataSummary = null) => {
  return async (req, res, next) => {
    // Intercepter la méthode res.json pour capturer la réponse
    const originalJson = res.json.bind(res);

    res.json = async function (data) {
      // Appeler la méthode originale d'abord
      originalJson(data);

      console.log(`🔔 NotificationMiddleware - Module: ${moduleName}, Action: ${action}`);
      console.log('🔔 [MIDDLEWARE] Interception res.json terminée');
      console.log('✅ [MIDDLEWARE] res.statusCode:', res.statusCode);
      console.log('✅ [MIDDLEWARE] data.success:', data.success);
      console.log('👤 [MIDDLEWARE] req.user:', req.user ? 'Trouvé' : 'Non trouvé');

      // Créer une notification seulement si la réponse est un succès
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user && data.success) {
        console.log('✅ Conditions remplies pour créer une notification');
        console.log('🔄 Tentative de création d\'une nouvelle notification');
        try {
          // Déterminer le type et le message selon l'action
          let type = 'info';
          let title = '';
          let message = '';
          let description = '';

          // Messages personnalisés selon le rôle
          const userRole = req.user.role || 'user';
          console.log('👤 Rôle utilisateur:', userRole);

          const roleMessages = getRoleMessages(userRole, moduleName, action, data, getDataSummary);
          console.log('📝 Messages générés:', roleMessages);

          type = roleMessages.type;
          title = roleMessages.title;
          message = roleMessages.message;
          description = roleMessages.description;

          // Créer la notification en base
          const userId = req.user.UserId || req.user.id || 1; // Fallback vers ID 1 si pas d'utilisateur
          console.log('🆔 UserId pour notification:', userId);

          const notificationPayload = {
            type,
            title,
            message,
            description,
            module: moduleName,
            action,
            data: getDataSummary ? JSON.stringify(getDataSummary(data, req)) : null
          };
          console.log('📦 Payload de notification:', notificationPayload);

          console.log('💾 Appel createNotificationForUser...');
          await createNotificationForUser(userId, notificationPayload);
          console.log('✅ createNotificationForUser terminé avec succès');

          const username = req.user.Username || req.user.username || 'Utilisateur';
          console.log(`🔔 Notification créée pour ${username} (${userRole}) - ${title}`);
        } catch (error) {
          console.error('Erreur lors de la création de notification automatique:', error);
          // Ne pas interrompre le flux normal en cas d'erreur de notification
        }
      }
    };

    next();
  };
};

/**
 * Obtenir les messages personnalisés selon le rôle
 */
function getRoleMessages(userRole, moduleName, action, data, getDataSummary) {
  const count = data.data?.length || data.deletedCount || data.updatedCount || 1;
  const summary = getDataSummary ? getDataSummary(data, null) : null;

  const roleMessages = {
    'admin': {
      save: {
        type: 'success',
        title: '✅ Sauvegarde effectuée',
        message: `Modification effectuée dans ${moduleName}`,
        description: summary || `${count} élément(s) modifié(s) avec succès`
      },
      delete: {
        type: 'warning',
        title: '🗑️ Suppression effectuée',
        message: `Éléments supprimés de ${moduleName}`,
        description: summary || `${count} élément(s) supprimé(s) définitivement`
      },
      add: {
        type: 'info',
        title: '➕ Ajout effectué',
        message: `Nouvel élément ajouté dans ${moduleName}`,
        description: summary || `${count} élément(s) créé(s)`
      }
    },
    'user': {
      save: {
        type: 'success',
        title: '✅ Données sauvegardées',
        message: `Vos modifications ont été enregistrées dans ${moduleName}`,
        description: summary || `${count} élément(s) mis à jour`
      },
      delete: {
        type: 'warning',
        title: '🗑️ Données supprimées',
        message: `Suppression effectuée dans ${moduleName}`,
        description: summary || `${count} élément(s) retiré(s)`
      },
      add: {
        type: 'info',
        title: '➕ Élément ajouté',
        message: `Nouvel élément créé dans ${moduleName}`,
        description: summary || `${count} élément(s) ajouté(s) avec succès`
      }
    },
    'Achat': {
      save: {
        type: 'success',
        title: '💰 Coûts mis à jour',
        message: `Coûts estimés modifiés dans ${moduleName}`,
        description: summary || `${count} élément(s) actualisé(s)`
      },
      delete: {
        type: 'error',
        title: '❌ Accès refusé',
        message: `Suppression non autorisée dans ${moduleName}`,
        description: `Votre rôle ne permet pas cette action`
      },
      add: {
        type: 'error',
        title: '❌ Ajout non autorisé',
        message: `Création non autorisée dans ${moduleName}`,
        description: `Votre rôle ne permet pas d'ajouter des éléments`
      }
    },
    'Super Admin': {
      save: {
        type: 'success',
        title: '🔧 Sauvegarde système',
        message: `Modification système dans ${moduleName}`,
        description: summary || `${count} élément(s) traité(s) par l'administrateur`
      },
      delete: {
        type: 'warning',
        title: '🔥 Suppression système',
        message: `Suppression administrative dans ${moduleName}`,
        description: summary || `${count} élément(s) supprimé(s) par l'administrateur`
      },
      add: {
        type: 'info',
        title: '🆕 Création système',
        message: `Nouvel élément créé dans ${moduleName}`,
        description: `Élément ajouté par l'administrateur système`
      }
    }
  };

  const config = roleMessages[userRole]?.[action] || roleMessages['user'][action];
  return {
    type: config.type,
    title: config.title,
    message: config.message,
    description: config.description
  };
}

/**
 * Middleware spécialisé pour les sauvegardes
 */
const notifySave = (moduleName, getDataSummary = null) => {
  return autoNotify(moduleName, 'save', getDataSummary);
};

/**
 * Middleware spécialisé pour les suppressions
 */
const notifyDelete = (moduleName, getDataSummary = null) => {
  return autoNotify(moduleName, 'delete', getDataSummary);
};

/**
 * Middleware spécialisé pour les ajouts
 */
const notifyAdd = (moduleName, getDataSummary = null) => {
  return autoNotify(moduleName, 'add', getDataSummary);
};

module.exports = {
  autoNotify,
  notifySave,
  notifyDelete,
  notifyAdd
};