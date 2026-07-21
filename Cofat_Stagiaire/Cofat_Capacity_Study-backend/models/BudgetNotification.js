const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const BudgetNotification = sequelize.define('BudgetNotification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('NEW_REQUEST', 'PRICE_UPDATED', 'REQUEST_VALIDATED', 'REQUEST_MODIFIED'),
    allowNull: false,
    comment: 'Type de notification'
  },
  department: {
    type: DataTypes.ENUM('IT', 'HR', 'QUALITY', 'BUILDING', 'LOGISTICS', 'MAINTENANCE', 'PRODUCTION'),
    allowNull: false,
    comment: 'Département concerné'
  },
  budgetItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID de l\'item budgétaire concerné'
  },
  fromUser: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Utilisateur qui a effectué l\'action'
  },
  toRole: {
    type: DataTypes.ENUM('Achat', 'User', 'Admin'),
    allowNull: false,
    comment: 'Rôle destinataire de la notification'
  },
  toUser: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Utilisateur spécifique (optionnel)'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Message de la notification'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Montant concerné'
  },
  equipment: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nom de l\'équipement'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Notification lue ou non'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de lecture'
  }
}, {
  tableName: 'BudgetNotifications',
  timestamps: true
});

module.exports = BudgetNotification;
