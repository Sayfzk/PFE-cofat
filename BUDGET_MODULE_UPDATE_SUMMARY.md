# 💰 Non Industrial Budget Module - Mise à Jour Complète

## ✅ Travaux Effectués

### 1. Backend - Système de Notifications ✅

#### Fichiers Créés
1. **`models/BudgetNotification.js`** ✅
   - Modèle pour les notifications du module Budget
   - Types: NEW_REQUEST, PRICE_UPDATED, REQUEST_VALIDATED, REQUEST_MODIFIED
   - Champs: type, department, budgetItemId, fromUser, toRole, toUser, message, amount, equipment, isRead

2. **`utils/budgetNotificationHelper.js`** ✅
   - Fonctions utilitaires pour gérer les notifications
   - `createBudgetNotification()` - Créer une notification
   - `getUnreadNotifications()` - Récupérer les notifications non lues
   - `markAsRead()` - Marquer comme lue
   - `markAllAsRead()` - Tout marquer comme lu
   - `getUnreadCount()` - Compter les non lues

#### Fichiers Modifiés
1. **`models/index.js`** ✅
   - Ajout du modèle BudgetNotification
   - Relations Budget-Notification

2. **`routers/nonIndustrialBudgetRoutes.js`** ✅
   - Import des helpers de notification
   - Route POST /create → Envoie notification à Achat quand User crée un item
   - Route PUT /update/:id → Envoie notification selon le rôle:
     - Si Achat modifie prix → notifie le User créateur
     - Si User modifie → notifie Achat
   - Nouveaux endpoints:
     - `GET /notifications/unread` - Récupérer notifications non lues
     - `GET /notifications/count` - Compter notifications non lues
     - `PUT /notifications/:id/read` - Marquer une notification comme lue
     - `PUT /notifications/read-all` - Marquer toutes comme lues

### 2. Logique Métier Implémentée ✅

#### Notifications Automatiques
- ✅ User ajoute un item → Notification à Achat
- ✅ User modifie un item → Notification à Achat
- ✅ Achat modifie prix/devise → Notification au User créateur

#### Calculs Automatiques
- ✅ TotalPrice = Qty × UnitPrice (calculé automatiquement dans le modèle)
- ✅ Mise à jour en temps réel lors des modifications

---

## 🔄 Prochaines Étapes - Frontend

### 3. Interface Utilisateur à Améliorer

#### A. Design Moderne avec Tailwind + shadcn/ui

**Fichier à créer/modifier:** `NonIndustrialBudget.js`

```jsx
// Style général
- Coins arrondis (rounded-2xl)
- Ombres douces (shadow-md, shadow-lg)
- Espacement confortable (p-4, gap-3)
- Couleurs cohérentes avec le thème

// Tableau élégant
- Alternance de couleurs (even:bg-gray-50)
- En-têtes avec fond léger
- Survol doux (hover:bg-gray-100)
- Cases à cocher pour sélection multiple
- Ligne "Total Budget" fixe en bas
```

#### B. Permissions Strictes par Rôle

**Rôle Achat:**
```jsx
const isAchat = user?.role === 'Achat';

// Champs éditables uniquement:
- Currency (dropdown)
- Unit Price (input number)
- Total Price (calculé auto, read-only)

// Tous les autres champs: disabled={true}
```

**Rôle User:**
```jsx
const isUser = user?.role === 'User';

// Champs NON éditables:
- Currency (disabled)
- Unit Price (disabled)
- Total Price (disabled)

// Autres champs: éditables
// Peut ajouter nouvelle ligne via formulaire modal
```

#### C. Formulaire Modal Moderne

```jsx
// Bouton "Add New Line"
→ Ouvre modal avec formulaire propre
→ Validation des champs
→ Relié au département actif
→ Design moderne avec shadcn/ui Dialog
```

#### D. Calculs en Temps Réel

```jsx
// Lors de la modification de Qty ou UnitPrice
const handleFieldChange = (id, field, value) => {
  if (field === 'qty' || field === 'unitPrice') {
    const item = budgetData.find(i => i.id === id);
    const qty = field === 'qty' ? value : item.qty;
    const price = field === 'unitPrice' ? value : item.unitPrice;
    const total = qty * price;
    
    // Mettre à jour totalPrice automatiquement
    updateItem(id, { ...item, [field]: value, totalPrice: total });
  }
};
```

#### E. Ligne Total Budget

```jsx
// En bas du tableau
<tr className="bg-blue-50 font-bold sticky bottom-0">
  <td colSpan="6" className="text-right px-4 py-3">
    Total Budget:
  </td>
  <td className="px-4 py-3">
    {calculateTotal(budgetData).toFixed(2)} {currency}
  </td>
</tr>
```

### 4. Intégration des Notifications

#### A. Hook pour les Notifications

**Fichier à créer:** `hooks/useBudgetNotifications.js`

```jsx
import { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';

export const useBudgetNotifications = (userRole, username) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/non-industrial-budget/notifications/unread', {
        params: { role: userRole, username }
      });
      setNotifications(response.data.data);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/non-industrial-budget/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/non-industrial-budget/notifications/read-all', {
        role: userRole,
        username
      });
      fetchNotifications(); // Refresh
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userRole, username]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
```

#### B. Composant Notification Badge

**Fichier à créer:** `components/BudgetNotificationBadge.js`

```jsx
import React from 'react';
import { Bell } from 'lucide-react';
import { useBudgetNotifications } from '../hooks/useBudgetNotifications';

const BudgetNotificationBadge = ({ userRole, username }) => {
  const { unreadCount } = useBudgetNotifications(userRole, username);

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default BudgetNotificationBadge;
```

#### C. Panneau de Notifications

**Fichier à créer:** `components/BudgetNotificationPanel.js`

```jsx
import React from 'react';
import { X, Check, CheckCheck } from 'lucide-react';
import { useBudgetNotifications } from '../hooks/useBudgetNotifications';

const BudgetNotificationPanel = ({ userRole, username, onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useBudgetNotifications(userRole, username);

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
        <h3 className="font-bold text-lg">Budget Notifications</h3>
        <div className="flex gap-2">
          <button onClick={markAllAsRead} className="text-blue-600 hover:text-blue-800">
            <CheckCheck className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No new notifications</p>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer"
              onClick={() => markAsRead(notif.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm">{notif.type.replace('_', ' ')}</span>
                <span className="text-xs text-gray-500">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{notif.message}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs bg-blue-200 px-2 py-1 rounded">{notif.department}</span>
                <span className="text-sm font-bold">{notif.amount} {notif.currency}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetNotificationPanel;
```

---

## 📝 Instructions de Mise en Œuvre

### Étape 1: Tester le Backend

```bash
# Démarrer le backend
cd d:/NVCapacity/Cofat_Capacity_Study-backend
npm start

# Vérifier que la table BudgetNotifications est créée
# Vérifier les logs pour "✅ Base de données synchronisée"
```

### Étape 2: Importer les Données Excel

```bash
# Fermer le fichier Excel d'abord !
node import-excel-budget.js

# Vérifier que les données sont importées
# Le script affichera le nombre de lignes importées par département
```

### Étape 3: Mettre à Jour le Frontend

1. **Créer les hooks et composants de notification**
   - `hooks/useBudgetNotifications.js`
   - `components/BudgetNotificationBadge.js`
   - `components/BudgetNotificationPanel.js`

2. **Améliorer `NonIndustrialBudget.js`**
   - Ajouter les permissions strictes par rôle
   - Améliorer le design avec Tailwind
   - Ajouter la ligne Total Budget
   - Intégrer les notifications

3. **Tester les permissions**
   - Se connecter en tant que User → Vérifier les champs disabled
   - Se connecter en tant que Achat → Vérifier que seuls Currency et Unit Price sont éditables
   - Créer un item en tant que User → Vérifier que Achat reçoit une notification
   - Modifier le prix en tant que Achat → Vérifier que User reçoit une notification

### Étape 4: Intégration Globale

1. **Ajouter le badge de notification dans la Sidebar**
   ```jsx
   import BudgetNotificationBadge from './BudgetNotificationBadge';
   
   // Dans le menu
   <BudgetNotificationBadge userRole={user.role} username={user.username} />
   ```

2. **Tester le flux complet**
   - User ajoute un item → Achat voit la notification
   - Achat met à jour le prix → User voit la notification
   - Notifications apparaissent dans le système global

---

## 🎯 Résultat Final Attendu

### Pour le Rôle Achat
- ✅ Voit toutes les demandes des Users
- ✅ Peut modifier uniquement Currency et Unit Price
- ✅ Reçoit notification quand User ajoute/modifie
- ✅ Voit le Total Budget en bas du tableau

### Pour le Rôle User
- ✅ Peut ajouter de nouvelles lignes via formulaire modal
- ✅ Peut modifier tous les champs sauf Currency, Unit Price, Total Price
- ✅ Reçoit notification quand Achat valide/modifie le prix
- ✅ Voit le Total Budget de son département

### Interface Générale
- ✅ Design ultra-moderne avec Tailwind + shadcn/ui
- ✅ Tableau élégant avec alternance de couleurs
- ✅ Ligne Total Budget fixe en bas
- ✅ Notifications intégrées au système global
- ✅ Calculs automatiques en temps réel
- ✅ Responsive sur mobile/tablet/desktop

---

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs du backend
2. Vérifier la console du navigateur
3. Tester les endpoints API avec curl/Postman
4. Consulter ce document

**Status:** Backend ✅ Complet | Frontend ⏳ En Attente de Mise en Œuvre
