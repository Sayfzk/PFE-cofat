# 🔔 Guide d'Implémentation du Système de Notifications Automatiques

## Vue d'ensemble

Le système de notifications automatiques COFAT Capacity Management System fournit des alertes en temps réel pour chaque rôle utilisateur lors des opérations de sauvegarde, suppression et ajout dans les 4 modules principaux.

## 🎯 Fonctionnalités

### ✨ Caractéristiques principales
- **Notifications automatiques** : Déclenchées lors de save/delete/add
- **Personnalisées par rôle** : Messages adaptés selon admin/user/Achat/Super Admin
- **Interface moderne** : Toasts flottants + centre de notifications
- **Sons personnalisables** : Audio contextuel selon le type de notification
- **Persistance** : Historique sauvegardé en base de données
- **Non invasif** : N'interfère pas avec les fonctionnalités existantes

### 🎨 Types de notifications
- `success` ✅ : Opérations réussies (vert)
- `warning` ⚠️ : Suppressions, actions sensibles (orange) 
- `error` ❌ : Erreurs, accès refusés (rouge)
- `info` ℹ️ : Ajouts, informations générales (bleu)

---

## 📁 Structure des fichiers créés

### Frontend
```
src/
├── services/
│   └── NotificationService.js        # Service global singleton
├── hooks/
│   └── useNotifications.js          # Hook React personnalisé
├── components/
│   ├── notifications/
│   │   ├── NotificationToast.js      # Composant UI principal
│   │   └── NotificationToast.css     # Styles des notifications
│   └── examples/
│       └── ModuleWithNotifications.js # Template d'exemple
└── config/
    └── modules.js                    # Configuration des modules
```

### Backend
```
backend/
├── models/
│   └── Notification.js               # Modèle Sequelize
├── routers/
│   └── notifications.js              # API endpoints
└── migrations/
    └── create-notifications-table.js # Script de création table
```

---

## 🚀 Installation et Configuration

### 1. Installation backend

```bash
cd Cofat_Capacity_Study-backend
node migrations/create-notifications-table.js
```

### 2. Redémarrage serveur backend
Le serveur doit être redémarré pour prendre en compte les nouvelles routes notifications.

### 3. Installation frontend 
Aucune dépendance supplémentaire requise - utilise React et Lucide-react existants.

---

## 💻 Utilisation dans un module

### Exemple d'intégration simple

```javascript
import useNotifications from '../hooks/useNotifications';

const MonModule = () => {
  // 1. Initialiser le hook
  const {
    notifySaveSuccess,
    notifyDeleteSuccess,
    notifyAddSuccess,
    notifyError
  } = useNotifications('Mon Module');

  // 2. Utiliser dans vos fonctions
  const sauvegarder = async (data) => {
    try {
      const result = await apiCall();
      if (result.success) {
        // ✅ Notification automatique
        notifySaveSuccess({
          count: 1,
          summary: 'Données sauvegardées',
          details: 'Optionnel'
        });
      }
    } catch (error) {
      // ❌ Notification d'erreur
      notifyError(error, 'Sauvegarde');
    }
  };

  return <div>{/* Votre composant */}</div>;
};
```

### Exemple déjà intégré : StandardEquipment.js

Le module Standard Equipment a été entièrement intégré comme référence :
- ✅ Save operations (save all, save selection)
- ✅ Delete operations  
- ✅ Add operations
- ✅ Error handling

---

## 🎨 Interface utilisateur

### Badge de notification
- Affiché dans la navbar
- Compteur en temps réel des notifications non lues
- Clic pour ouvrir le centre de notifications

### Toasts flottants 
- Apparaissent en haut à droite lors d'actions
- Disparaissent automatiquement après 5s
- Fermeture manuelle possible

### Centre de notifications
- Liste complète des notifications récentes
- Filtrage par type/module
- Marquage lecture/non-lu
- Suppression individuelle/bulk
- Statistiques

---

## 🔧 Configuration par rôle

### Messages personnalisés selon le rôle

#### Admin / User
```javascript
{
  save: {
    title: '✅ Sauvegarde effectuée',
    message: 'Modification effectuée dans Module'
  },
  delete: {
    title: '🗑️ Suppression effectuée', 
    message: 'Éléments supprimés de Module'
  }
}
```

#### Achat
```javascript
{
  save: {
    title: '💰 Coûts mis à jour',
    message: 'Coûts estimés modifiés dans Module'
  },
  delete: {
    title: '❌ Accès refusé',
    message: 'Suppression non autorisée'
  }
}
```

#### Super Admin
```javascript
{
  save: {
    title: '🔧 Sauvegarde système',
    message: 'Modification système dans Module'
  }
}
```

---

## 🛠️ API Backend

### Endpoints disponibles

```http
# Récupérer notifications utilisateur
GET /api/notifications
GET /api/notifications?type=success&module=Standard Equipment&unread_only=true

# Créer notification
POST /api/notifications
{
  "type": "success",
  "title": "Titre",
  "message": "Message", 
  "module": "Module Name"
}

# Marquer comme lu
PUT /api/notifications/mark-read
{ "notification_ids": [1, 2, 3] }

# Supprimer
DELETE /api/notifications/123
DELETE /api/notifications?older_than_days=30

# Statistiques
GET /api/notifications/stats
```

---

## 🧪 Testing

### Test basique frontend
Utilisez le composant d'exemple créé :
```javascript
import ModuleWithNotifications from './components/examples/ModuleWithNotifications';

// Dans votre route de test
<ModuleWithNotifications moduleName="Planning Equipment" />
```

### Test backend
```bash
# Tester l'API
curl -X GET http://localhost:3001/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔄 Intégration dans d'autres modules

### Étapes pour ajouter à un nouveau module

1. **Importer le hook**
   ```javascript
   import useNotifications from '../hooks/useNotifications';
   ```

2. **Initialiser avec nom du module**
   ```javascript
   const { notifySaveSuccess, notifyDeleteSuccess, notifyAddSuccess, notifyError } = 
     useNotifications('Planning Equipment');
   ```

3. **Ajouter dans fonctions existantes**
   ```javascript
   // Après succès sauvegarde
   notifySaveSuccess({ count: 1, summary: 'Description' });
   
   // Après succès suppression  
   notifyDeleteSuccess({ count: selectedItems.length });
   
   // En cas d'erreur
   notifyError(error, 'Contexte de l'erreur');
   ```

### Modules à intégrer
- ✅ **Standard Equipment** - Intégré complètement
- ⏳ **Planning Equipment** - À intégrer
- ⏳ **Budget Equipment** - À intégrer  
- ⏳ **Critical Equipment** - À intégrer

---

## 🎯 Personnalisation avancée

### Ajouter nouveaux types de notifications
```javascript
// Dans NotificationService.js
notifyCustomAction(module, userRole, data) {
  const config = {
    title: '🔧 Action personnalisée',
    message: `Action dans ${module}`,
    type: 'info'
  };
  return this.addNotification({ ...config, module, userRole });
}
```

### Modifier l'apparence
Éditer `NotificationToast.css` pour personnaliser :
- Couleurs par type
- Animations  
- Positionnement
- Timing d'affichage

### Ajouter sons personnalisés
```javascript
// Dans playNotificationSound()
const audioFiles = {
  'success': '/sounds/success.mp3',
  'error': '/sounds/error.mp3'
};
```

---

## 📊 Monitoring et Performance

### Nettoyage automatique
Le système inclut un nettoyage automatique des anciennes notifications :

```javascript
// Nettoyer notifications lues > 30 jours
await Notification.cleanupOldNotifications(30);
```

### Limitations
- Maximum 50 notifications en mémoire frontend
- Auto-suppression toasts après 30s
- Base de données : index sur user_id, module, type, created_at

---

## 🐛 Dépannage

### Problèmes courants

**Les notifications n'apparaissent pas**
- Vérifier que NotificationToast est dans NavBar
- Contrôler la console pour erreurs JavaScript
- S'assurer que useNotifications est correctement appelé

**Backend erreurs 500**
- Vérifier que la table notifications existe
- Contrôler les permissions base de données
- Vérifier l'authentification token

**Performance lente**
- Nettoyer les anciennes notifications
- Vérifier les index base de données
- Limiter le nombre de notifications chargées

### Logs utiles
```javascript
// Frontend console
console.log('Notifications service:', notificationService.getAllNotifications());

// Backend logs
console.log('User notifications count:', await Notification.getUnreadCountForUser(userId));
```

---

## 📈 Roadmap Futures Améliorations

### V2 - Améliorations prévues
- 🔔 Notifications push en temps réel (WebSockets)
- 📧 Notifications email pour actions critiques  
- 🎨 Thèmes personnalisables
- 📱 Support mobile amélioré
- 🌐 Internationalisation (i18n)
- 📈 Analytics des notifications
- 🔕 Paramètres de notification utilisateur

### V3 - Fonctionnalités avancées
- 📅 Notifications programmées
- 👥 Notifications de groupe/équipe
- 🔗 Intégration Slack/Teams
- 🤖 IA pour notification intelligente
- 📊 Dashboard admin notifications

---

## 👥 Support et Contact

Pour toute question ou assistance avec le système de notifications :

**Documentation technique** : Ce fichier + commentaires dans le code
**Exemples de code** : `ModuleWithNotifications.js`
**Tests** : Utilisez le composant d'exemple pour valider l'intégration

---

**🎉 Le système de notifications automatiques est maintenant prêt !**

Utilisez ce guide pour intégrer facilement les notifications dans tous vos modules existants et futurs.