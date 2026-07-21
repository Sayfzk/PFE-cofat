// src/components/AchatDebug.js
import React from 'react';
import { useAuth } from '../Context/AuthContext';

const AchatDebug = () => {
  const { user, loading } = useAuth();

  console.log('🔍 AchatDebug - Current state:', {
    user,
    loading,
    isAuthenticated: user?.isAuthenticated,
    role: user?.role,
    pathname: window.location.pathname
  });

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>🔄 Chargement...</h2>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!user || !user.isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>❌ Non authentifié</h2>
        <p>Utilisateur: {JSON.stringify(user)}</p>
        <p>Veuillez vous connecter.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🐛 Debug - Utilisateur Achat</h2>
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📊 Informations de l'utilisateur:</h3>
        <ul>
          <li><strong>Nom:</strong> {user.username}</li>
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>Rôle:</strong> {user.role}</li>
          <li><strong>Authentifié:</strong> {user.isAuthenticated ? '✅ Oui' : '❌ Non'}</li>
        </ul>
      </div>

      <div style={{ background: '#e8f5e8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>🔍 État de la navigation:</h3>
        <ul>
          <li><strong>URL actuelle:</strong> {window.location.pathname}</li>
          <li><strong>Est-ce un utilisateur Achat?:</strong> {user.role === 'Achat' ? '✅ Oui' : '❌ Non'}</li>
        </ul>
      </div>

      <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
        <h3>⚡ Actions de test:</h3>
        <button 
          onClick={() => console.log('User object:', user)}
          style={{ margin: '5px', padding: '10px', cursor: 'pointer' }}
        >
          Log User Object
        </button>
        <button 
          onClick={() => window.location.href = '/standard-equipment'}
          style={{ margin: '5px', padding: '10px', cursor: 'pointer' }}
        >
          Aller à Standard Equipment
        </button>
        <button 
          onClick={() => localStorage.clear()}
          style={{ margin: '5px', padding: '10px', cursor: 'pointer', background: '#ff6b6b', color: 'white' }}
        >
          Clear LocalStorage
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>JSON complet de l'utilisateur:</strong></p>
        <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AchatDebug;