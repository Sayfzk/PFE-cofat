// src/components/FixedStandardEquipment.js
// Version corrigée qui charge automatiquement les données
import React, { useState, useEffect } from 'react';

const FixedStandardEquipment = () => {
  const [currentUser, setCurrentUser] = useState({ role: 'user' });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  console.log('🚀 FixedStandardEquipment - Début du chargement');

  useEffect(() => {
    console.log('👤 FixedStandardEquipment - Chargement de l\'utilisateur');
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.isAuthenticated) {
          setCurrentUser(parsedUser);
          console.log('✅ Utilisateur défini:', parsedUser.role);
        }
      }
    } catch (err) {
      console.error('❌ Erreur utilisateur:', err);
      setError('Erreur de chargement utilisateur');
    }
    setLoading(false);
  }, []);

  // Chargement automatique des données
  useEffect(() => {
    if (currentUser && !loading) {
      loadEquipments();
    }
  }, [currentUser, loading]);

  const loadEquipments = async () => {
    try {
      console.log('📡 Chargement des équipements...');
      const response = await fetch('http://172.23.23.31:9001/api/standard-equipment');

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data || []);
        console.log('✅ Données chargées:', result.data?.length || 0, 'équipements');
      } else {
        throw new Error(result.error || 'Erreur de chargement');
      }
    } catch (err) {
      console.error('❌ Erreur de chargement des équipements:', err);
      setError(err.message);
      setData([]); // Données vides en cas d'erreur
    }
  };

  const canEditField = (field) => {
    if (currentUser.role === 'Achat') {
      return field === 'Estimated_Cost_EUR';
    }
    return true;
  };

  console.log('🎨 FixedStandardEquipment - Rendu, données:', data.length, 'utilisateur:', currentUser.role);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>⏳ Chargement de Standard Equipment...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
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

      {/* Gestion des erreurs */}
      {error && (
        <div style={{
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#721c24'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span><strong>Erreur:</strong> {error}</span>
          </div>
        </div>
      )}

      {/* Actions de contrôle */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={loadEquipments}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Recharger les données
          </button>

          {currentUser.role !== 'Achat' && (
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ➕ Ajouter un équipement
            </button>
          )}

          <span style={{ color: '#6c757d' }}>
            {data.length} équipement(s) chargé(s)
          </span>
        </div>
      </div>

      {/* Table des équipements */}
      {data.length > 0 ? (
        <div style={{
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Code</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Équipement</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Coût Estimé (EUR)</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>{item.Code_Eq || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{item.Equipment_Reference || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{item.Type || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>
                    {canEditField('Estimated_Cost_EUR') ? (
                      <input
                        type="number"
                        defaultValue={item.Estimated_Cost_EUR || 0}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          width: '100px'
                        }}
                      />
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {item.Estimated_Cost_EUR || 0} €
                        <span title="Non modifiable pour votre rôle">🔒</span>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {canEditField('Equipment_Reference') ? (
                      <button style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
                        ✏️ Modifier
                      </button>
                    ) : (
                      <span style={{ color: '#6c757d', fontSize: '12px' }}>🔒 Lecture seule</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.length > 10 && (
            <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#f8f9fa', fontSize: '14px', color: '#6c757d' }}>
              Affichage des 10 premiers équipements sur {data.length} total
            </div>
          )}
        </div>
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3>Aucun équipement trouvé</h3>
          <p>Cliquez sur "Recharger les données" pour récupérer les équipements</p>
        </div>
      )}

      {/* Informations de session */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#e9ecef',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Utilisateur:</strong> {currentUser.username} ({currentUser.role})</span>
          <span><strong>Statut:</strong> ✅ Connecté</span>
        </div>
      </div>
    </div>
  );
};

export default FixedStandardEquipment;