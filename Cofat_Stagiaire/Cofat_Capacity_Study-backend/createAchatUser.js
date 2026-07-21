const bcrypt = require('bcryptjs');
const { User } = require('./models/User');
const sequelize = require('./db');

async function createAchatUser() {
  try {
    // Établir la connexion à la base
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('achat123', 10);

    // Créer l'utilisateur Achat
    const achatUser = await User.create({
      Username: 'Achat',
      Email: 'achat@cofat.com',
      Password: hashedPassword,
      Role: 'Achat',
      CreatedAt: new Date().toISOString().slice(0, 10) // Format YYYY-MM-DD
    });

    console.log('✅ Utilisateur Achat créé avec succès:');
    console.log('   - Username:', achatUser.Username);
    console.log('   - Email:', achatUser.Email);
    console.log('   - Role:', achatUser.Role);
    console.log('   - UserId:', achatUser.UserId);
    console.log('');
    console.log('🔑 Informations de connexion:');
    console.log('   - Nom d\'utilisateur: Achat');
    console.log('   - Mot de passe: achat123');

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('⚠️ L\'utilisateur Achat existe déjà');
    } else {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    }
  } finally {
    await sequelize.close();
  }
}

createAchatUser();