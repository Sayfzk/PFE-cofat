# 🚀 Guide de Déploiement sur IIS - Cofat Capacity Study

## 📋 Prérequis sur le serveur 172.23.23.31

### 1. Installer Node.js
- Télécharger Node.js LTS depuis https://nodejs.org/
- Version recommandée : 18.x ou 20.x
- Vérifier l'installation : `node --version` et `npm --version`

### 2. Installer iisnode
- Télécharger depuis : https://github.com/Azure/iisnode/releases
- Installer `iisnode-full-v0.2.26-x64.msi` (ou version plus récente)
- Redémarrer IIS après installation

### 3. Installer URL Rewrite Module
- Télécharger depuis : https://www.iis.net/downloads/microsoft/url-rewrite
- Installer le module
- Redémarrer IIS

### 4. Vérifier les composants IIS
Ouvrir "Gestionnaire des services Internet (IIS)" et vérifier que ces modules sont installés :
- ✅ URL Rewrite
- ✅ iisnode
- ✅ Application Initialization (optionnel mais recommandé)

---

## 📦 ÉTAPE 1 : Préparer le Backend (Node.js)

### 1.1 Sur votre machine de développement

```bash
# Aller dans le dossier backend
cd d:\NVCapacity\Cofat_Capacity_Study-backend

# Installer les dépendances de production
npm install --production

# Créer un dossier pour le déploiement
mkdir deploy-backend
```

### 1.2 Copier les fichiers nécessaires

Copier ces fichiers/dossiers dans `deploy-backend` :
- ✅ `main.js`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `web.config` (créé automatiquement)
- ✅ `.env.production` (créé automatiquement)
- ✅ Dossier `models/`
- ✅ Dossier `routers/`
- ✅ Dossier `middlewares/`
- ✅ Dossier `utils/` (si existe)
- ✅ Dossier `Uploads/` (créer vide si n'existe pas)
- ✅ Dossier `node_modules/` (ou réinstaller sur le serveur)

### 1.3 Modifier main.js pour la production

Ouvrir `main.js` et modifier la configuration CORS :

```javascript
// Remplacer la section CORS par :
app.use(cors({
  origin: [
    "http://172.23.23.31",           // Frontend sur IIS
    "http://172.23.23.31:80",        // Alternative avec port
    "http://localhost:4000"          // Dev local (optionnel)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-user-role', 'x-user-name', 'x-user-id']
}));
```

### 1.4 Transférer sur le serveur

```bash
# Compresser le dossier
# Transférer vers le serveur : \\172.23.23.31\c$\inetpub\wwwroot\cofat-backend\
```

---

## 🎨 ÉTAPE 2 : Préparer le Frontend (React)

### 2.1 Créer le fichier .env.production

Créer `d:\NVCapacity\Cofat_Capacity_front\.env.production` :

```env
REACT_APP_API_URL=http://172.23.23.31/api
REACT_APP_BACKEND_URL=http://172.23.23.31/api
```

### 2.2 Modifier axiosInstance.js

Ouvrir `src/utils/axiosInstance.js` et vérifier :

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://172.23.23.31/api';
```

### 2.3 Build de production

```bash
# Aller dans le dossier frontend
cd d:\NVCapacity\Cofat_Capacity_front

# Créer le build de production
npm run build
```

Cela créera un dossier `build/` avec tous les fichiers optimisés.

### 2.4 Transférer sur le serveur

```bash
# Copier tout le contenu du dossier build/ vers :
# \\172.23.23.31\c$\inetpub\wwwroot\cofat-frontend\
```

---

## 🖥️ ÉTAPE 3 : Configuration IIS sur le serveur

### 3.1 Créer le site Backend (API)

1. Ouvrir **Gestionnaire des services Internet (IIS)**
2. Clic droit sur **Sites** → **Ajouter un site Web**
3. Configurer :
   - **Nom du site** : `Cofat-Backend-API`
   - **Chemin physique** : `C:\inetpub\wwwroot\cofat-backend`
   - **Type** : http
   - **Adresse IP** : 172.23.23.31
   - **Port** : 3005
   - **Nom d'hôte** : (laisser vide)

4. Cliquer sur **Pool d'applications** → **Cofat-Backend-API**
   - **Version .NET CLR** : Aucun code managé
   - **Mode pipeline** : Intégré

5. Paramètres avancés du pool :
   - **Activer les applications 32 bits** : False
   - **Identité** : ApplicationPoolIdentity

### 3.2 Créer le site Frontend

1. Clic droit sur **Sites** → **Ajouter un site Web**
2. Configurer :
   - **Nom du site** : `Cofat-Frontend`
   - **Chemin physique** : `C:\inetpub\wwwroot\cofat-frontend`
   - **Type** : http
   - **Adresse IP** : 172.23.23.31
   - **Port** : 80
   - **Nom d'hôte** : (laisser vide)

3. Cliquer sur **Pool d'applications** → **Cofat-Frontend**
   - **Version .NET CLR** : Aucun code managé
   - **Mode pipeline** : Intégré

### 3.3 Configurer les permissions

Pour le Backend :
```powershell
# Ouvrir PowerShell en tant qu'administrateur
icacls "C:\inetpub\wwwroot\cofat-backend" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\wwwroot\cofat-backend\Uploads" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\wwwroot\cofat-backend\iisnode" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

Pour le Frontend :
```powershell
icacls "C:\inetpub\wwwroot\cofat-frontend" /grant "IIS_IUSRS:(OI)(CI)R" /T
```

### 3.4 Installer les dépendances Node.js sur le serveur

```bash
# Ouvrir CMD en tant qu'administrateur
cd C:\inetpub\wwwroot\cofat-backend
npm install --production
```

---

## 🔧 ÉTAPE 4 : Configuration du Reverse Proxy (Optionnel mais recommandé)

Si vous voulez que le frontend et le backend soient sur le même domaine :

### 4.1 Modifier le site Frontend

1. Sélectionner le site **Cofat-Frontend**
2. Double-cliquer sur **Réécriture d'URL**
3. Ajouter une règle de proxy pour l'API :

```xml
<rule name="ReverseProxyToAPI" stopProcessing="true">
  <match url="^api/(.*)" />
  <action type="Rewrite" url="http://172.23.23.31:3005/{R:1}" />
</rule>
```

Cela permettra d'accéder à l'API via `http://172.23.23.31/api/...`

---

## 🧪 ÉTAPE 5 : Tests et Vérification

### 5.1 Tester le Backend

```bash
# Ouvrir un navigateur et tester :
http://172.23.23.31:3005/

# Ou avec curl :
curl http://172.23.23.31:3005/
```

### 5.2 Tester le Frontend

```bash
# Ouvrir un navigateur :
http://172.23.23.31/
```

### 5.3 Vérifier les logs

Backend :
```
C:\inetpub\wwwroot\cofat-backend\iisnode\
```

Frontend : Utiliser les outils de développement du navigateur (F12)

---

## 🔥 ÉTAPE 6 : Configuration du Pare-feu

```powershell
# Ouvrir PowerShell en tant qu'administrateur

# Autoriser le port 80 (Frontend)
New-NetFirewallRule -DisplayName "Cofat Frontend HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Autoriser le port 3005 (Backend)
New-NetFirewallRule -DisplayName "Cofat Backend API" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
```

---

## 📊 ÉTAPE 7 : Monitoring et Maintenance

### 7.1 Redémarrer les sites

```powershell
# Redémarrer IIS
iisreset

# Ou redémarrer un site spécifique
Stop-WebSite -Name "Cofat-Backend-API"
Start-WebSite -Name "Cofat-Backend-API"
```

### 7.2 Vérifier les logs

- **Backend** : `C:\inetpub\wwwroot\cofat-backend\iisnode\`
- **IIS** : `C:\inetpub\logs\LogFiles\`

### 7.3 Mise à jour de l'application

Pour mettre à jour :
1. Arrêter le site dans IIS
2. Remplacer les fichiers
3. Redémarrer le site

---

## 🛠️ Dépannage

### Problème : "500 Internal Server Error"
- Vérifier les logs dans `iisnode/`
- Vérifier que Node.js est installé
- Vérifier les permissions des dossiers

### Problème : "Cannot connect to backend"
- Vérifier que le backend est démarré
- Vérifier le pare-feu
- Vérifier la configuration CORS dans `main.js`

### Problème : "404 Not Found" sur React Router
- Vérifier que `web.config` est présent dans le dossier frontend
- Vérifier que URL Rewrite est installé

### Problème : "Module iisnode not found"
- Réinstaller iisnode
- Redémarrer IIS

---

## 📞 Support

Pour toute question, contacter l'équipe IT de Cofat.

---

## ✅ Checklist finale

- [ ] Node.js installé sur le serveur
- [ ] iisnode installé
- [ ] URL Rewrite installé
- [ ] Backend déployé dans `C:\inetpub\wwwroot\cofat-backend`
- [ ] Frontend déployé dans `C:\inetpub\wwwroot\cofat-frontend`
- [ ] `web.config` présent dans les deux dossiers
- [ ] Permissions configurées
- [ ] Sites IIS créés et démarrés
- [ ] Pare-feu configuré
- [ ] Tests effectués avec succès
- [ ] CORS configuré correctement
- [ ] Base de données accessible

---

**Date de création** : Novembre 2025  
**Version** : 1.0  
**Auteur** : Équipe Cofat IT
