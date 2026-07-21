/**
 * Middleware d'authentification compatible avec le système existant
 * Ce middleware simule un utilisateur authentifié basé sur les données de la requête
 * pour les notifications, en attendant un vrai système d'authentification
 */

const compatibleAuth = (req, res, next) => {
  console.log('🔍 CompatibleAuth - Début authentification');
  console.log('📝 URL:', req.method, req.url);
  console.log('🍪 Cookies:', req.cookies);
  console.log('📦 Body role:', req.body?.role);
  
  // Si l'utilisateur est déjà défini (par un autre middleware), on continue
  if (req.user && req.user.UserId) {
    console.log('✅ Utilisateur déjà défini:', req.user);
    return next();
  }

  // Essayer de récupérer les infos utilisateur depuis les headers (envoyés par le frontend)
  const userRole = req.headers['x-user-role'];
  const userName = req.headers['x-user-name'];
  const userId = req.headers['x-user-id'];
  
  console.log('📋 Headers utilisateur:', { userRole, userName, userId });

  if (userRole || userName) {
    req.user = {
      UserId: userId ? parseInt(userId) : 1,
      Username: userName || `User_${userRole}`,
      role: userRole || 'user'
    };
    console.log('✅ Utilisateur depuis headers:', req.user);
    return next();
  }

  // Essayer de récupérer les infos utilisateur depuis les cookies de session
  const authToken = req.cookies?.authToken;
  console.log('🔑 Token trouvé:', !!authToken);
  
  if (authToken) {
    // Si on a un token, essayer de le décoder (sans validation stricte pour la compatibilité)
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(authToken); // Décoder sans vérifier la signature
      
      if (decoded && decoded.UserId) {
        req.user = {
          UserId: decoded.UserId,
          Username: decoded.Username || decoded.username,
          role: decoded.role || decoded.Role || 'user'
        };
        console.log('✅ Utilisateur depuis token JWT:', req.user);
        return next();
      }
    } catch (err) {
      console.warn('Erreur décodage token:', err.message);
    }
  }

  // Fallback : créer un utilisateur générique basé sur le rôle dans le body (pour compatibilité)
  const roleFromBody = req.body?.role;
  
  if (roleFromBody) {
    // Créer un utilisateur fictif pour les notifications
    req.user = {
      UserId: 1, // ID générique - dans un vrai système, cela viendrait de la session
      Username: `User_${roleFromBody}`,
      role: roleFromBody
    };
    
    console.log(`🔑 Authentification compatible: Rôle ${roleFromBody} détecté`);
    console.log('👤 Utilisateur créé:', req.user);
    return next();
  }

  // Si aucune info d'auth trouvée, créer un utilisateur par défaut
  req.user = {
    UserId: 1,
    Username: 'Anonymous',
    role: 'user'
  };
  
  console.log('⚠️ Aucune authentification trouvée, utilisateur par défaut créé');
  next();
};

/**
 * Version plus permissive pour les routes existantes
 * Ne bloque pas la requête même sans authentification
 */
const compatibleAuthOptional = (req, res, next) => {
  try {
    compatibleAuth(req, res, next);
  } catch (error) {
    // En cas d'erreur, on continue quand même avec un utilisateur par défaut
    req.user = {
      UserId: 1,
      Username: 'System',
      role: 'user'
    };
    
    console.warn('🔄 Erreur authentification, fallback utilisé:', error.message);
    next();
  }
};

module.exports = {
  compatibleAuth,
  compatibleAuthOptional
};