const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key';

// Middleware pour vérifier si l'utilisateur est authentifié
function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }

    req.user = user;
    next();
  });
}

// Middleware pour vérifier les permissions en fonction des rôles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit pour ce rôle' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };