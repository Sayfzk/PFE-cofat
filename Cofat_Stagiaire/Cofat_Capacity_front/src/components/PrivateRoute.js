// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Chargement...</div>;
  }

  // If user is not authenticated, redirect to login
  if (!user || !user.isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have a valid role
  const validRoles = ['user', 'admin', 'Achat'];
  if (!validRoles.includes(user.role)) {
    console.log("User not authorized, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the protected component
  return children;
};

export default PrivateRoute;