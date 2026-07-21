const { User } = require('./models/User'); // Chemin vers votre modèle
const bcrypt = require('bcryptjs'); // Importer bcryptjs pour le hachage

async function createUsers() {
  try {
    const users = [
      //{
        //Username: 'Super Admin',
        //Email: 'SuperAdmin@Cofat.com',
        //Password: await bcrypt.hash('SuperAdmin1234', 10), // Hachage du mot de passe
        //Role: 'admin',
      //},
      //{
        //Username: 'User',
        //Email: 'User@Cofat.com',
        //Password: await bcrypt.hash('User1234', 10), // Hachage du mot de passe
        //Role: 'user',
      //},

       {
        Username: 'Achat',
        Email: 'Achat@Cofat.com',
        Password: await bcrypt.hash('Achat1234', 10), // Hachage du mot de passe
        Role: 'Achat',
      },
    ];

    for (const userData of users) {
      const user = await User.create({ ...userData, CreatedAt: new Date() });
      console.log('Utilisateur créé :', user);
    }
  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs :', error);
  }
}

createUsers();
