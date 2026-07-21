const sequelize = require('./db');
const { User } = require('./models/user');

async function syncUserModel() {
  try {
    console.log('🔄 Synchronisation du modèle User avec la base de données...');
    
    // Synchroniser le modèle (cela va modifier la contrainte CHECK)
    await User.sync({ alter: true });
    
    console.log('✅ Synchronisation réussie!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
  } finally {
    await sequelize.close();
  }
}

syncUserModel();