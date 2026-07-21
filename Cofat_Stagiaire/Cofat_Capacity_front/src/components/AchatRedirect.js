// src/components/AchatRedirect.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const AchatRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Chargement...</div>
      </div>
    );
  }

  // If user is not authenticated, let other components handle it
  if (!user || !user.isAuthenticated) {
    return children;
  }

  // Debug log
  console.log('AchatRedirect - User:', user.username, 'Role:', user.role, 'Path:', location.pathname);

  // If user has Achat role and is trying to access restricted pages
  if (user.role === 'Achat') {
    const allowedPaths = [
      '/standard-equipment', 
      '/non-industrial-budget',  // Ajouté pour permettre l'accès au module Non Industrial Budget
      '/debug-achat', 
      '/contact', 
      '/unauthorized'
    ];
    const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
    
    if (!isAllowedPath) {
      console.log("Achat user redirected to Standard Equipment from:", location.pathname);
      return <Navigate to="/standard-equipment" replace />;
    }
  }

  // For other roles or Achat users on allowed pages, render children
  return children;
};

export default AchatRedirect;