const sequelize = require('../db');
const Equipment = require('./Equipment');
const Site = require('./Site');
const EquipmentPlanning = require('./EquipmentPlanning');
const Spaces = require('./Spaces'); // Changé de Space à Spaces
const HR = require('./HR'); // Nouveau modèle HR
const { User } = require('./User');
const Notification = require('./Notification');
const NonIndustrialBudget = require('./NonIndustrialBudget'); // Nouveau modèle Budget
const BudgetNotification = require('./BudgetNotification'); // Notifications Budget

// 📌 Définir les relations

// 🔗 Un site peut avoir plusieurs équipements
Site.hasMany(Equipment, { foreignKey: 'siteId' });
Equipment.belongsTo(Site, { foreignKey: 'siteId' });

// 🔗 Un site peut avoir plusieurs plannings d’équipements
Site.hasMany(EquipmentPlanning, { foreignKey: 'siteId' });
EquipmentPlanning.belongsTo(Site, { foreignKey: 'siteId' });

// 🔗 Un équipement peut avoir plusieurs entrées dans le planning
Equipment.hasMany(EquipmentPlanning, { foreignKey: 'equipmentId' });
EquipmentPlanning.belongsTo(Equipment, { foreignKey: 'equipmentId' });

// Associations
Site.hasMany(Spaces, { foreignKey: 'siteId' });
Spaces.belongsTo(Site, { foreignKey: 'siteId' });

// 🔗 Relations Site-HR
Site.hasMany(HR, { foreignKey: 'siteId' });
HR.belongsTo(Site, { foreignKey: 'siteId' });

// 🔔 Relations User-Notification
User.hasMany(Notification, { foreignKey: 'user_id', sourceKey: 'UserId' });
Notification.belongsTo(User, { foreignKey: 'user_id', targetKey: 'UserId' });

// 💰 Relations Budget-Notification
NonIndustrialBudget.hasMany(BudgetNotification, { foreignKey: 'budgetItemId' });
BudgetNotification.belongsTo(NonIndustrialBudget, { foreignKey: 'budgetItemId' });

const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Désactiver temporairement les contraintes
      await sequelize.query('SET CONSTRAINTS ALL DEFERRED');
      
      await sequelize.sync({ alter: true });
      
      // Recréer les contraintes manuellement
      await sequelize.query(`
        ALTER TABLE EquipmentPlanning 
        ADD CONSTRAINT FK_EquipmentPlanning_Sites
        FOREIGN KEY (siteId) REFERENCES Sites(id)
        ON DELETE CASCADE
      `);
      
      console.log("🧪 DB synchronisée avec contraintes corrigées");
    } else {
      // Production: utiliser des migrations manuelles
      await sequelize.sync();
      console.log("✅ DB synchronisée (production)");
    }
  } catch (error) {
    console.error("❌ Erreur de synchronisation:", error);
  }
};

module.exports = {
  sequelize,
  Equipment,
  Site,
  EquipmentPlanning,
  Spaces, // Ajout de Spaces
  HR, // Ajout de HR
  User, // Ajout de User
  Notification, // Ajout de Notification
  NonIndustrialBudget, // Ajout de NonIndustrialBudget
  BudgetNotification, // Ajout de BudgetNotification
  syncDatabase
};
