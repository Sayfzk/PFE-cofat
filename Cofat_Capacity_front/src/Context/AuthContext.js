// src/Context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Chargement de localStorage:', storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.isAuthenticated) {
          setUser(parsedUser);
          console.log('Utilisateur chargé:', parsedUser);
        } else {
          localStorage.removeItem('user');
          console.log('Utilisateur non authentifié dans localStorage, supprimé');
        }
      } catch (err) {
        console.error('Erreur de parsing utilisateur:', err);
        localStorage.removeItem('user');
      }
    } else {
      console.log('Aucun utilisateur dans localStorage');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://172.23.23.31:9001/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: username, Password: password }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      const userData = {
        username: data.username || username,
        role: data.role,
        isAuthenticated: true
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Connexion réussie, utilisateur défini:', userData);
      return data;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      localStorage.removeItem('user');
      console.log('Déconnexion réussie');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};