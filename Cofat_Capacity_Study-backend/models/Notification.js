const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CofatSearch_User',
      key: 'UserId',
    },
    comment: 'ID de l\'utilisateur destinataire de la notification'
  },
  type: {
    type: DataTypes.ENUM('success', 'warning', 'error', 'info'),
    allowNull: false,
    defaultValue: 'info',
    comment: 'Type de notification (success, warning, error, info)'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Titre de la notification'
  },
  message: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Message principal de la notification'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description détaillée optionnelle'
  },
  module: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Module d\'origine (Standard Equipment, Planning Equipment, etc.)'
  },
  action: {
    type: DataTypes.ENUM('save', 'delete', 'add', 'error', 'custom'),
    allowNull: false,
    defaultValue: 'custom',
    comment: 'Type d\'action qui a déclenché la notification'
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Données supplémentaires liées à la notification (JSON string)'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Détails supplémentaires'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Indique si la notification a été lue'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date et heure de lecture de la notification'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['module']
    },
    {
      fields: ['type']
    },
    {
      fields: ['read']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Méthodes d'instance pour gérer les données JSON
Notification.prototype.setData = function(dataObj) {
  this.data = dataObj ? JSON.stringify(dataObj) : null;
};

Notification.prototype.getData = function() {
  return this.data ? JSON.parse(this.data) : null;
};

// Méthodes statiques utiles
Notification.getUnreadCountForUser = async function(userId) {
  return await this.count({
    where: {
      user_id: userId,
      read: false
    }
  });
};

Notification.markAsReadForUser = async function(userId, notificationIds = null) {
  const where = { user_id: userId };
  if (notificationIds) {
    where.id = notificationIds;
  }
  
  return await this.update(
    { 
      read: true, 
      read_at: new Date() 
    },
    { where }
  );
};

Notification.getRecentForUser = async function(userId, limit = 50) {
  return await this.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit
  });
};

Notification.cleanupOldNotifications = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.destroy({
    where: {
      created_at: {
        [sequelize.Sequelize.Op.lt]: cutoffDate
      },
      read: true
    }
  });
};

module.exports = Notification;