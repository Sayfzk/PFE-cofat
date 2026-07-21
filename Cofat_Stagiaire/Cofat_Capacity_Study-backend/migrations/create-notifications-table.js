const sequelize = require('../db');
const Notification = require('../models/Notification');

async function createNotificationsTable() {
  try {
    console.log('🔄 Création de la table notifications...');
    
    // Forcer la recréation complète du modèle (attention: supprime les données existantes)
    await Notification.sync({ force: true });
    
    console.log('✅ Table notifications créée avec succès');
    
    // Créer quelques notifications d'exemple pour tester
    console.log('🔄 Création de notifications d\'exemple...');
    
    // Note: Remplacez par de vrais IDs d'utilisateur de votre table users
    const exampleNotifications = [
      {
        user_id: 1, // Assurez-vous que cet utilisateur existe
        type: 'info',
        title: '🚀 Système de notifications activé',
        message: 'Le système de notifications automatiques est maintenant actif',
        description: 'Vous recevrez désormais des notifications pour toutes vos actions dans les modules',
        module: 'System',
        action: 'custom'
      },
      {
        user_id: 1,
        type: 'success',
        title: '✅ Configuration réussie',
        message: 'Votre profil a été configuré avec succès',
        module: 'Standard Equipment',
        action: 'save'
      }
    ];
    
    for (const notification of exampleNotifications) {
      try {
        await Notification.create(notification);
        console.log(`📧 Notification créée: ${notification.title}`);
      } catch (err) {
        console.warn(`⚠️ Impossible de créer la notification d'exemple: ${err.message}`);
      }
    }
    
    console.log('🎉 Migration des notifications terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table notifications:', error);
    throw error;
  }
}

// Exporter la fonction pour pouvoir l'utiliser
module.exports = createNotificationsTable;

// Exécuter si le script est appelé directement
if (require.main === module) {
  createNotificationsTable()
    .then(() => {
      console.log('Migration terminée, fermeture de la connexion...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}