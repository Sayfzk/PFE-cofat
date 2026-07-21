const sequelize = require('./db');

async function updateRoleConstraint() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    console.log('🔄 Suppression de l\'ancienne contrainte CHECK...');
    // Supprimer l'ancienne contrainte
    await sequelize.query(
      "ALTER TABLE CofatSearch_User DROP CONSTRAINT CK__CofatSearc__Role__5887175A"
    );
    
    console.log('✨ Création de la nouvelle contrainte CHECK...');
    // Créer la nouvelle contrainte avec le rôle Achat inclus
    await sequelize.query(
      "ALTER TABLE CofatSearch_User ADD CONSTRAINT CK_CofatSearch_User_Role CHECK (Role IN ('admin', 'user', 'Achat'))"
    );
    
    console.log('✅ Contrainte mise à jour avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

updateRoleConstraint();