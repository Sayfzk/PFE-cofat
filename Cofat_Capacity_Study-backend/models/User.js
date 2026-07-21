const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define(
  'User',
  {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Role: { 
      type: DataTypes.ENUM('admin', 'user', 'Achat'), 
      defaultValue: 'user' 
    },
    CreatedAt: {
      type: DataTypes.DATEONLY, // Utilisez DATEONLY pour exclure l'heure
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATEONLY, // Utilisez DATEONLY ici aussi si nécessaire
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'CofatSearch_User',
    hooks: {
      beforeCreate: (user) => {
        if (user.CreatedAt) {
          // Formater la date au format YYYY-MM-DD
          user.CreatedAt = new Date(user.CreatedAt).toISOString().slice(0, 10);
        }
      },
    },
  }
);

module.exports = { User };
