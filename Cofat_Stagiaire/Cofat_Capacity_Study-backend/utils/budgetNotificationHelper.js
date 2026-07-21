const BudgetNotification = require('../models/BudgetNotification');

/**
 * Créer une notification pour le module Budget
 */
async function createBudgetNotification({
  type,
  department,
  budgetItemId,
  fromUser,
  toRole,
  toUser = null,
  equipment,
  amount
}) {
  try {
    // Générer le message selon le type
    let message = '';
    
    switch (type) {
      case 'NEW_REQUEST':
        message = `${fromUser} a ajouté une nouvelle demande pour ${equipment} (${department}) - Montant: ${amount}`;
        break;
      case 'REQUEST_MODIFIED':
        message = `${fromUser} a modifié la demande pour ${equipment} (${department}) - Nouveau montant: ${amount}`;
        break;
      case 'PRICE_UPDATED':
        message = `Le prix de ${equipment} (${department}) a été mis à jour par ${fromUser} - Nouveau montant: ${amount}`;
        break;
      case 'REQUEST_VALIDATED':
        message = `Votre demande pour ${equipment} (${department}) a été validée - Montant: ${amount}`;
        break;
      default:
        message = `Notification concernant ${equipment} (${department})`;
    }

    // Créer la notification
    const notification = await BudgetNotification.create({
      type,
      department,
      budgetItemId,
      fromUser,
      toRole,
      toUser,
      message,
      equipment,
      amount,
      isRead: false
    });

    return notification;
  } catch (error) {
    console.error('Error creating budget notification:', error);
    throw error;
  }
}

/**
 * Récupérer les notifications non lues pour un rôle
 */
async function getUnreadNotifications(role, username = null) {
  try {
    const where = {
      toRole: role,
      isRead: false
    };

    if (username) {
      where.toUser = username;
    }

    const notifications = await BudgetNotification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Marquer une notification comme lue
 */
async function markAsRead(notificationId) {
  try {
    const notification = await BudgetNotification.findByPk(notificationId);
    
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
      return notification;
    }
    
    return null;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Marquer toutes les notifications comme lues pour un rôle
 */
async function markAllAsRead(role, username = null) {
  try {
    const where = {
      toRole: role,
      isRead: false
    };

    if (username) {
      where.toUser = username;
    }

    const result = await BudgetNotification.update(
      { 
        isRead: true,
        readAt: new Date()
      },
      { where }
    );

    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Obtenir le nombre de notifications non lues
 */
async function getUnreadCount(role, username = null) {
  try {
    const where = {
      toRole: role,
      isRead: false
    };

    if (username) {
      where.toUser = username;
    }

    const count = await BudgetNotification.count({ where });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
}

module.exports = {
  createBudgetNotification,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
