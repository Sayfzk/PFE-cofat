import React from 'react';
import useNotifications from '../../hooks/useNotifications';

const NotificationTest = () => {
  const {
    notifySaveSuccess,
    notifyDeleteSuccess,
    notifyAddSuccess,
    notifyError,
    currentUser
  } = useNotifications('Test Module');

  const testSuccess = () => {
    notifySaveSuccess({
      count: 1,
      summary: 'Test réussi',
      details: 'Le hook useNotifications fonctionne correctement'
    });
  };

  const testError = () => {
    notifyError(new Error('Test d\'erreur'), 'Test de notification d\'erreur');
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f9ff', 
      border: '1px solid #0ea5e9',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h3>🧪 Test des Notifications</h3>
      <p>Utilisateur actuel: <strong>{currentUser?.username || 'Non connecté'}</strong></p>
      <p>Rôle: <strong>{currentUser?.role || 'Aucun'}</strong></p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button 
          onClick={testSuccess}
          style={{
            background: '#22c55e',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ✅ Test Succès
        </button>
        
        <button 
          onClick={testError}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ❌ Test Erreur
        </button>
      </div>
      
      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
        Si les boutons fonctionnent sans erreur, le hook useNotifications est corrigé !
      </p>
    </div>
  );
};

export default NotificationTest;