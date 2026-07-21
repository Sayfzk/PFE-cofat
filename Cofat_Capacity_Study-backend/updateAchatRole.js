const sequelize = require('./db');
const { User } = require('./models/user');

async function updateAchatRole() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    // Mettre à jour le rôle de l'utilisateur Achat
    const [affectedCount] = await User.update(
      { Role: 'Achat' },
      { where: { Username: 'Achat' } }
    );
    
    if (affectedCount > 0) {
      console.log('✅ Rôle de l\'utilisateur Achat mis à jour avec succès!');
      
      // Afficher les informations mises à jour
      const updatedUser = await User.findOne({ where: { Username: 'Achat' } });
      console.log('\n👥 Informations de l\'utilisateur:');
      console.log(`   - ID: ${updatedUser.UserId}`);
      console.log(`   - Username: ${updatedUser.Username}`);
      console.log(`   - Email: ${updatedUser.Email}`);
      console.log(`   - Role: ${updatedUser.Role}`);
      console.log('');
      console.log('🔑 Informations de connexion:');
      console.log('   - Nom d\'utilisateur: Achat');
      console.log('   - Mot de passe: achat123');
    } else {
      console.log('⚠️ Utilisateur Achat non trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

updateAchatRole();