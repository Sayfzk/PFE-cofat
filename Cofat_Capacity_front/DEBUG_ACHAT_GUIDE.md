# 🐛 Guide de Dépannage - Utilisateur Achat

## 🚨 Problème : Page blanche après connexion Achat

### ✅ **Étapes de diagnostic :**

1. **Vérifiez que les serveurs fonctionnent :**
   ```bash
   # Backend (port 3001)
   netstat -ano | findstr :3001
   
   # Frontend (port 4000) 
   netstat -ano | findstr :4000
   ```

2. **Connectez-vous comme utilisateur Achat :**
   - **URL :** http://localhost:4000/login
   - **Username :** `Achat`
   - **Password :** `achat123`

3. **Testez les URLs suivantes dans l'ordre :**
   - http://localhost:4000/debug-achat
   - http://localhost:4000/standard-equipment
   - http://localhost:4000/

### 🔍 **Vérifications dans la console du navigateur (F12) :**

1. **Console JavaScript :**
   - Recherchez des erreurs en rouge
   - Cherchez les messages de debug qui commencent par 🔍, 🔄, etc.

2. **Network Tab :**
   - Vérifiez si les requêtes vers l'API (port 3001) passent
   - Status 200 = OK, 401 = Non autorisé, 500 = Erreur serveur

3. **Application Tab > LocalStorage :**
   - Vérifiez qu'il y a une entrée `user`
   - Le contenu doit ressembler à :
   ```json
   {
     "username": "Achat",
     "role": "Achat", 
     "isAuthenticated": true
   }
   ```

### 🛠 **Solutions rapides :**

#### **Solution 1 : Clear Cache**
```javascript
// Dans la console du navigateur
localStorage.clear();
location.reload();
```

#### **Solution 2 : Forcer la redirection**
```javascript
// Dans la console du navigateur
window.location.href = '/standard-equipment';
```

#### **Solution 3 : Vérifier l'authentification**
```javascript
// Dans la console du navigateur
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### 📊 **Messages de debug attendus :**

Si tout fonctionne, vous devriez voir dans la console :
```
🔍 AchatDebug - Current state: { user: {...}, loading: false, ... }
SimpleStandardEquipment - User: {...}, Loading: false
Chargement de localStorage: {"username":"Achat","role":"Achat","isAuthenticated":true}
Utilisateur chargé: {...}
```

### 🎯 **Causes possibles et solutions :**

| Problème | Cause | Solution |
|----------|-------|----------|
| Page totalement blanche | Erreur JavaScript | Ouvrir F12 → Console, chercher les erreurs |
| Redirection en boucle | Logique de redirection défaillante | Vérifier les logs de navigation |
| "Non authentifié" | LocalStorage vide | Se reconnecter |
| Erreur 404 | Route mal configurée | Vérifier l'URL |
| Erreur 401 | Session expirée | Se reconnecter |

### 🔧 **Actions de dépannage avancé :**

1. **Redémarrer les serveurs :**
   ```bash
   # Backend
   cd Cofat_Capacity_Study-backend
   # Tuer le processus sur port 3001 si nécessaire
   taskkill /PID [PID] /F
   node main.js
   
   # Frontend  
   cd Cofat_Capacity_front
   npm start
   ```

2. **Vérifier la base de données :**
   ```bash
   cd Cofat_Capacity_Study-backend
   node testAchatUser.js
   ```

3. **Test de l'API directement :**
   ```bash
   curl -X POST http://172.20.79.39:3001/signin \
   -H "Content-Type: application/json" \
   -d '{"Username":"Achat","Password":"achat123"}'
   ```

---

## ✅ **Si la page de debug fonctionne :**

L'utilisateur Achat est correctement configuré ! Le problème vient du composant StandardEquipment principal. Dans ce cas :

1. Utilisez la version simple qui fonctionne
2. Ou identifiez l'erreur dans le composant complexe
3. Les permissions et redirections sont OK

---

**🎯 L'objectif est de voir au minimum la page de debug fonctionner pour confirmer que l'authentification et les permissions Achat marchent correctement.**