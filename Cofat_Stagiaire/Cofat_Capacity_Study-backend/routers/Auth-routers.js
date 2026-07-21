const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

const router = express.Router();

const JWT_SECRET = 'your_secret_key'; // À stocker dans une variable d'environnement

// Middleware pour limiter les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite de 5 tentatives
  message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
});

// Schéma de validation pour la connexion
const loginSchema = Joi.object({
  Username: Joi.string().required(),
  Password: Joi.string().min(6).required(),
});

// Connexion
router.post('/signin', loginLimiter, async (req, res) => {
  console.log('Requête reçue sur /signin', req.body);

  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { Username, Password } = req.body;

  try {
    const user = await User.findOne({ where: { Username } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, username: user.Username, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({ message: 'Connexion réussie', role: user.Role });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Déconnexion
router.post('/signout', (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ message: 'Déconnexion réussie' });
});

// Statut d'authentification
router.get('/auth/status', (req, res) => {
  const token = req.cookies.authToken;
  if (!token) return res.json({ isLoggedIn: false });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ isLoggedIn: true, user: decoded });
  } catch (err) {
    console.error('Erreur de vérification JWT:', err);
    res.json({ isLoggedIn: false });
  }
});

module.exports = router;
