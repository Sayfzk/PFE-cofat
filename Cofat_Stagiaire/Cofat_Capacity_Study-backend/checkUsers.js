const sequelize = require('./db');
const { User } = require('./models/user');

async function checkUsers() {
  try {
    console.log('📋 Vérification des utilisateurs existants...');
    
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    const users = await User.findAll({
      attributes: ['UserId', 'Username', 'Email', 'Role']
    });
    
    console.log('\n👥 Utilisateurs existants:');
    users.forEach(user => {
      console.log(`ID: ${user.UserId}, Username: ${user.Username}, Email: ${user.Email}, Role: ${user.Role}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();