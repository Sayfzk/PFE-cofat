// src/utils/authUtils.js

/**
 * Vérifie si l'utilisateur est authentifié et a le rôle approprié
 * @param {string} requiredRole - Le rôle requis pour accéder à la ressource
 * @returns {boolean} - True si l'utilisateur est authentifié et a le rôle approprié
 */
export const checkAuth = (requiredRole = 'responsible') => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return false;
      
      const user = JSON.parse(userData);
      return user?.isAuthenticated && user?.role === requiredRole;
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error);
      // En cas d'erreur, on considère l'utilisateur comme non authentifié
      return false;
    }
  };
  
  /**
   * Obtient les informations de l'utilisateur actuellement connecté
   * @returns {Object|null} - Les informations de l'utilisateur ou null si non connecté
   */
  export const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  };
  
  /**
   * Déconnecte l'utilisateur actuel
   */
  export const logout = () => {
    localStorage.removeItem('user');
  };
  
  /**
   * Définit les informations de l'utilisateur connecté
   * @param {Object} userData - Les informations de l'utilisateur à enregistrer
   */
  export const setCurrentUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  };