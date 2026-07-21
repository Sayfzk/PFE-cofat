// src/hooks/useAchatRedirect.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export const useAchatRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ne pas rediriger pendant le chargement
    if (loading || !user) return;

    // Si l'utilisateur est Achat et n'est pas sur une page autorisée
    if (user.role === 'Achat') {
      const allowedPaths = [
        '/standard-equipment', 
        '/non-industrial-budget',  // Ajouté pour permettre l'accès au module Non Industrial Budget
        '/debug-achat', 
        '/contact', 
        '/unauthorized'
      ];
      const isOnAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
      
      if (!isOnAllowedPath) {
        console.log('🔄 Redirection utilisateur Achat de', location.pathname, 'vers /standard-equipment');
        navigate('/standard-equipment', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  return {
    isAchatUser: user?.role === 'Achat',
    isLoading: loading,
    user
  };
};