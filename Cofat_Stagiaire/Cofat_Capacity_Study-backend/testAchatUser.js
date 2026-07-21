const { User } = require('./models/user');
const sequelize = require('./db');

async function testAchatUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    // Chercher l'utilisateur Achat
    const achatUser = await User.findOne({ 
      where: { Username: 'Achat' } 
    });
    
    if (achatUser) {
      console.log('\n👤 Utilisateur Achat trouvé:');
      console.log('   - ID:', achatUser.UserId);
      console.log('   - Username:', achatUser.Username);
      console.log('   - Email:', achatUser.Email);
      console.log('   - Role:', achatUser.Role);
      console.log('   - Created:', achatUser.CreatedAt);
      
      console.log('\n🔑 Informations de connexion:');
      console.log('   - Nom d\'utilisateur: Achat');
      console.log('   - Mot de passe: achat123');
      console.log('   - Module autorisé: Standard Equipment uniquement');
      console.log('   - Permission: Modification du champ "Estimated_Cost_EUR" seulement');
      
    } else {
      console.log('❌ Utilisateur Achat non trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

testAchatUser();