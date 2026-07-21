// src/components/SimpleStandardEquipment.js
import React from 'react';
import { useAuth } from '../Context/AuthContext';

const SimpleStandardEquipment = () => {
  const { user, loading } = useAuth();

  console.log('SimpleStandardEquipment - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>🔄 Chargement...</h2>
      </div>
    );
  }

  if (!user || !user.isAuthenticated) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>❌ Non authentifié</h2>
        <p>Vous devez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✅ Standard Equipment - Version Simple</h1>
      
      <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>👤 Informations utilisateur</h2>
        <ul>
          <li><strong>Nom:</strong> {user.username}</li>
          <li><strong>Rôle:</strong> {user.role}</li>
          <li><strong>Authentifié:</strong> {user.isAuthenticated ? 'Oui' : 'Non'}</li>
        </ul>
      </div>

      {user.role === 'Achat' && (
        <div style={{ background: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>🔒 Utilisateur Achat détecté</h3>
          <p>Vous pouvez uniquement modifier les coûts estimés des équipements.</p>
          <p>Les fonctionnalités d'ajout et de suppression sont désactivées pour votre rôle.</p>
        </div>
      )}

      <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
        <h3>📋 Module Standard Equipment</h3>
        <p>Cette page fonctionne correctement !</p>
        <p>URL actuelle: <code>{window.location.pathname}</code></p>
        <p>Si vous voyez ce message, cela signifie que :</p>
        <ul>
          <li>✅ L'authentification fonctionne</li>
          <li>✅ La route est correctement configurée</li>
          <li>✅ Le composant se charge sans erreur</li>
          <li>✅ Les permissions de rôle sont détectées</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => console.log('User object:', user)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Log User Info
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Recharger la page
        </button>
      </div>
    </div>
  );
};

export default SimpleStandardEquipment;