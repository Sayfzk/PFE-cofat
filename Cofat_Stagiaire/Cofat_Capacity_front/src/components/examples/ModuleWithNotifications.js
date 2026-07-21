import React, { useState } from 'react';
import { Save, Trash2, Plus, AlertCircle } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import { MODULES } from '../../config/modules';

/**
 * Exemple de module avec intégration automatique des notifications
 * Ce template peut être copié et adapté pour n'importe quel module
 */
const ModuleWithNotifications = ({ moduleName = MODULES.STANDARD_EQUIPMENT }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hook de notifications - Il suffit de passer le nom du module
  const {
    notifySaveSuccess,
    notifyDeleteSuccess, 
    notifyAddSuccess,
    notifyError,
    currentUser
  } = useNotifications(moduleName);

  // Exemple de fonction de sauvegarde avec notification automatique
  const handleSave = async (itemData) => {
    setLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Logique de sauvegarde...
      const success = Math.random() > 0.2; // 80% de succès
      
      if (success) {
        // ✅ Notification automatique de succès
        notifySaveSuccess({
          count: 1,
          summary: `Élément ${itemData.name} sauvegardé`,
          details: `Modifié par ${currentUser?.username || 'utilisateur'}`
        });
      } else {
        throw new Error('Erreur simulée lors de la sauvegarde');
      }
    } catch (error) {
      // ❌ Notification automatique d'erreur
      notifyError(error, 'Sauvegarde d\'élément');
    } finally {
      setLoading(false);
    }
  };

  // Exemple de fonction de suppression avec notification automatique
  const handleDelete = async (itemIds) => {
    setLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = Math.random() > 0.3; // 70% de succès
      
      if (success) {
        // 🗑️ Notification automatique de suppression
        notifyDeleteSuccess({
          count: itemIds.length,
          summary: `${itemIds.length} élément(s) supprimé(s)`,
          details: 'Suppression définitive'
        });
      } else {
        throw new Error('Erreur simulée lors de la suppression');
      }
    } catch (error) {
      // ❌ Notification automatique d'erreur
      notifyError(error, 'Suppression d\'éléments');
    } finally {
      setLoading(false);
    }
  };

  // Exemple de fonction d'ajout avec notification automatique
  const handleAdd = async (newItemData) => {
    setLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const success = Math.random() > 0.1; // 90% de succès
      
      if (success) {
        // ➕ Notification automatique d'ajout
        notifyAddSuccess({
          name: newItemData.name,
          summary: `Nouvel élément créé`,
          details: `Type: ${newItemData.type}, Créé par: ${currentUser?.username || 'utilisateur'}`
        });
      } else {
        throw new Error('Erreur simulée lors de l\'ajout');
      }
    } catch (error) {
      // ❌ Notification automatique d'erreur  
      notifyError(error, 'Ajout d\'élément');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Exemple: {moduleName}</h1>
        <p style={{ color: '#64748b', marginBottom: '16px' }}>
          Ce composant démontre l'intégration automatique des notifications. 
          Utilisateur actuel: <strong>{currentUser?.username || 'Non connecté'}</strong> ({currentUser?.role || 'Aucun rôle'})
        </p>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
          border: '1px solid #29b6f6',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#0277bd'
        }}>
          <AlertCircle size={16} style={{ display: 'inline-block', marginRight: '8px' }} />
          <strong>Instructions d'intégration:</strong>
          <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Importer <code>useNotifications</code> depuis <code>../../hooks/useNotifications</code></li>
            <li>Appeler le hook avec le nom de votre module</li>
            <li>Utiliser les méthodes <code>notifySaveSuccess</code>, <code>notifyDeleteSuccess</code>, <code>notifyAddSuccess</code>, <code>notifyError</code></li>
            <li>Les notifications apparaîtront automatiquement selon le rôle de l'utilisateur</li>
          </ol>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => handleSave({ name: 'Item Test', type: 'Example' })}
          disabled={loading}
          style={{
            background: '#22c55e',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.6 : 1
          }}
        >
          <Save size={16} />
          Tester Sauvegarde
        </button>

        <button
          onClick={() => handleDelete([1, 2, 3])}
          disabled={loading}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.6 : 1
          }}
        >
          <Trash2 size={16} />
          Tester Suppression
        </button>

        <button
          onClick={() => handleAdd({ name: 'Nouvel Item', type: 'Test' })}
          disabled={loading}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.6 : 1
          }}
        >
          <Plus size={16} />
          Tester Ajout
        </button>
      </div>

      {loading && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          🔄 Opération en cours... Une notification apparaîtra bientôt !
        </div>
      )}

      <div style={{ marginTop: '32px', padding: '16px', background: '#f1f5f9', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '12px' }}>Code d'intégration type:</h3>
        <pre style={{ 
          background: '#1e293b', 
          color: '#e2e8f0', 
          padding: '16px', 
          borderRadius: '6px', 
          fontSize: '13px',
          overflow: 'auto'
        }}>
{`// Dans votre composant React
import useNotifications from '../hooks/useNotifications';

const MonModule = () => {
  const {
    notifySaveSuccess,
    notifyDeleteSuccess,
    notifyAddSuccess,
    notifyError
  } = useNotifications('Mon Module');

  const sauvegarder = async (data) => {
    try {
      const result = await apiCall();
      if (result.success) {
        // ✅ Notification automatique
        notifySaveSuccess({
          count: 1,
          summary: 'Données sauvegardées',
          details: 'Détails optionnels'
        });
      }
    } catch (error) {
      // ❌ Notification d'erreur automatique
      notifyError(error, 'Sauvegarde');
    }
  };

  // ... reste du composant
};`}
        </pre>
      </div>
    </div>
  );
};

export default ModuleWithNotifications;