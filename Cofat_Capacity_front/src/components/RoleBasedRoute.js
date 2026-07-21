// src/components/RoleBasedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles = [], redirectTo = "/unauthorized" }) => {
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

  // If specific roles are required and user doesn't have the right role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log(`User role '${user.role}' not authorized for this route. Allowed roles: ${allowedRoles.join(', ')}`);
    return <Navigate to={redirectTo} replace />;
  }

  // Render the protected component
  return children;
};

export default RoleBasedRoute;