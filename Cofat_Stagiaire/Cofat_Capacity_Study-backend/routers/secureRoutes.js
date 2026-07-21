const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddlewares');  // Importer les middlewares

const router = express.Router();

// Route protégée pour l'admin
router.get('/admin-dashboard', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({ message: `Bienvenue Admin : ${req.user.email}` });
});

// Route protégée pour l'utilisateur ou l'admin
router.get('/user-dashboard', authenticateToken, authorizeRoles('user', 'admin'), (req, res) => {
  res.status(200).json({ message: `Bienvenue Utilisateur : ${req.user.email}` });
});


  

module.exports = router;
