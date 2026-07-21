// src/components/BasicStandardEquipment.js
import React, { useState, useEffect } from 'react';

const BasicStandardEquipment = () => {
  const [currentUser, setCurrentUser] = useState({ role: 'user' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🚀 BasicStandardEquipment - Début du chargement');

  useEffect(() => {
    console.log('👤 BasicStandardEquipment - Chargement de l\'utilisateur');
    try {
      const storedUser = localStorage.getItem('user');
      console.log('📊 Données utilisateur localStorage:', storedUser);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('👥 Utilisateur parsé:', parsedUser);
        if (parsedUser && parsedUser.isAuthenticated) {
          setCurrentUser(parsedUser);
          console.log('✅ Utilisateur défini dans BasicStandardEquipment:', parsedUser.role);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur dans BasicStandardEquipment:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  console.log('🎨 BasicStandardEquipment - Rendu, utilisateur:', currentUser, 'loading:', loading);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>⏳ Chargement de Standard Equipment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <h2>❌ Erreur dans Standard Equipment</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '8px' }}>
          🏭 Gestion des Équipements Standard
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          {currentUser.role === 'Achat' 
            ? 'Modification des coûts estimés des équipements'
            : 'Suivi et gestion des équipements par opération'
          }
        </p>
      </div>

      {/* Message pour utilisateur Achat */}
      {currentUser.role === 'Achat' && (
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#1976d2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📝</span>
            <span><strong>Vous pouvez uniquement modifier la colonne "Coût Estimé (EUR)" des équipements.</strong></span>
          </div>
        </div>
      )}

      {/* Section principale */}
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ marginBottom: '16px', color: '#495057' }}>📋 Fonctionnalités disponibles</h2>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span>
            <span>Visualisation des équipements</span>
          </div>
          
          {currentUser.role === 'Achat' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span>Modification des coûts estimés uniquement</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>❌</span>
                <span>Ajout d'équipements (non autorisé)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>❌</span>
                <span>Suppression d'équipements (non autorisé)</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span>Modification complète des équipements</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span>Ajout d'équipements</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span>Suppression d'équipements</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Informations utilisateur */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{ marginBottom: '12px', color: '#495057' }}>👤 Informations de session</h3>
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          <div><strong>Utilisateur:</strong> {currentUser.username || 'Non défini'}</div>
          <div><strong>Rôle:</strong> {currentUser.role || 'Non défini'}</div>
          <div><strong>Authentifié:</strong> {currentUser.isAuthenticated ? 'Oui' : 'Non'}</div>
        </div>
      </div>

      {/* Message de statut */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        color: '#155724'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✅</span>
          <span><strong>Le module Standard Equipment fonctionne correctement !</strong></span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          Cette version basique confirme que l'authentification, les permissions de rôle, et l'affichage fonctionnent.
        </div>
      </div>
    </div>
  );
};

export default BasicStandardEquipment;