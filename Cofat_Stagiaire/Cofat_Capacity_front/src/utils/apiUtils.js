// src/utils/apiUtils.js
/**
 * Utilitaire pour ajouter les headers d'authentification aux requêtes API
 */

export const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (user && user.isAuthenticated) {
    headers['x-user-role'] = user.role || 'user';
    headers['x-user-name'] = user.username || 'Unknown';
    headers['x-user-id'] = user.UserId || user.id || '1';
  }

  return headers;
};

/**
 * Fonction fetch avec headers d'authentification automatiques
 */
export const fetchWithAuth = async (url, options = {}) => {
  const authHeaders = getAuthHeaders();
  
  const finalOptions = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers
    }
  };

  console.log('🔗 API Request:', url, finalOptions);
  
  return fetch(url, finalOptions);
};

/**
 * POST avec authentification
 */
export const postWithAuth = async (url, data) => {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * DELETE avec authentification
 */
export const deleteWithAuth = async (url) => {
  return fetchWithAuth(url, {
    method: 'DELETE'
  });
};
