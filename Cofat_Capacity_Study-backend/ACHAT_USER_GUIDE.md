# Guide Utilisateur Achat - Restrictions et Permissions

## 📋 Informations de Connexion

- **Nom d'utilisateur :** `Achat`
- **Mot de passe :** `achat123`
- **Rôle :** `Achat`

## 🎯 Accès et Restrictions

### ✅ **Accès Autorisé**
- **Standard Equipment** uniquement
- Modification du champ **"Coût Estimé (EUR)"** (`Estimated_Cost_EUR`)

### ❌ **Accès Restreint**
- **Equipment Planning** - Bloqué par redirection automatique
- **Space Planning** - Bloqué par redirection automatique  
- **Human Resources** - Bloqué par redirection automatique
- **Admin Dashboard** - Bloqué par rôle

### 🔒 **Fonctionnalités Désactivées dans Standard Equipment**
- ❌ Ajout de nouveaux équipements
- ❌ Suppression d'équipements  
- ❌ Modification des autres colonnes (seul le coût est modifiable)

## 🚀 **Fonctionnement**

### 1. **Connexion**
L'utilisateur Achat se connecte normalement avec ses identifiants.

### 2. **Redirection Automatique**
- Si l'utilisateur tente d'accéder à d'autres modules → **Redirection automatique vers Standard Equipment**
- Seule la navigation vers Standard Equipment est visible dans le menu

### 3. **Interface Adaptée**
- **Message informatif** : "Vous pouvez uniquement modifier la colonne Coût Estimé (EUR) des équipements"
- **Boutons masqués** : Ajout et suppression non visibles
- **Cellules verrouillées** : Autres colonnes affichent un 🔒 et ne sont pas éditables

### 4. **Permissions Backend**
- **Validation côté serveur** : Toute tentative de modification non autorisée est rejetée
- **Messages d'erreur explicites** : "Le rôle Achat ne peut modifier que le coût estimé"

## 🛠 **Implémentation Technique**

### **Frontend (React)**
- `AchatRedirect` : Redirection automatique
- `RoleBasedRoute` : Protection des routes par rôle
- `Sidebar` : Menu adapté selon le rôle
- `StandardEquipment` : Interface et permissions ajustées

### **Backend (Node.js)**
- Routes protégées avec validation du rôle
- Middleware de permissions pour les opérations CRUD
- Contrainte base de données mise à jour

### **Sécurité**
- ✅ Protection côté client ET serveur
- ✅ Validation des permissions à chaque requête
- ✅ Messages d'erreur informatifs
- ✅ Interface utilisateur adaptative

## 🎨 **Expérience Utilisateur**

### **Indicateurs Visuels**
- 📝 **Message d'information** en haut de page
- 🔒 **Icône de verrouillage** sur les cellules non modifiables  
- ✏️ **Icône d'édition** uniquement sur la colonne Coût
- 🎨 **Couleurs distinctives** pour les cellules modifiables/non modifiables

### **Navigation Simplifiée**
- Menu réduit aux options autorisées
- Aucun lien vers les modules restreints
- Interface claire et intuitive

---

## ✅ **Status des Fonctionnalités**

| Fonctionnalité | Status | Description |
|---------------|--------|-------------|
| Utilisateur créé | ✅ | Compte Achat configuré en base |
| Protection routes | ✅ | Redirection automatique implémentée |
| Menu adapté | ✅ | Sidebar masque les options non autorisées |
| Permissions backend | ✅ | Validation serveur des modifications |
| Interface utilisateur | ✅ | Cellules verrouillées et indicateurs visuels |
| Modification coûts | ✅ | Seule la colonne Estimated_Cost_EUR est éditable |

---

**🔐 L'utilisateur Achat est maintenant correctement configuré avec toutes les restrictions et permissions requises !**