# ✅ Checklist de Déploiement - Cofat Capacity Study

## 📋 Avant le déploiement

### Sur la machine de développement

- [ ] **Backend : Vérifier les dépendances**
  ```bash
  cd d:\NVCapacity\Cofat_Capacity_Study-backend
  npm install
  ```

- [ ] **Frontend : Créer le build de production**
  ```bash
  cd d:\NVCapacity\Cofat_Capacity_front
  npm run build
  ```

- [ ] **Vérifier les fichiers de configuration**
  - [ ] `web.config` présent dans backend
  - [ ] `web.config` présent dans frontend
  - [ ] `.env.production` configuré pour le backend
  - [ ] `.env.production` configuré pour le frontend

---

## 🖥️ Sur le serveur 172.23.23.31

### Prérequis

- [ ] **Node.js installé** (version 18.x ou 20.x)
  ```bash
  node --version
  npm --version
  ```

- [ ] **iisnode installé**
  - Télécharger : https://github.com/Azure/iisnode/releases
  - Installer : `iisnode-full-v0.2.26-x64.msi`

- [ ] **URL Rewrite Module installé**
  - Télécharger : https://www.iis.net/downloads/microsoft/url-rewrite

- [ ] **IIS démarré**
  ```powershell
  Get-Service W3SVC
  ```

---

## 📦 Déploiement du Backend

### 1. Copier les fichiers

- [ ] Créer le dossier : `C:\inetpub\wwwroot\cofat-backend`
- [ ] Copier tous les fichiers du backend :
  - [ ] `main.js`
  - [ ] `package.json`
  - [ ] `package-lock.json`
  - [ ] `web.config`
  - [ ] `.env.production` (renommer en `.env`)
  - [ ] Dossier `models/`
  - [ ] Dossier `routers/`
  - [ ] Dossier `middlewares/`
  - [ ] Dossier `utils/`
  - [ ] Créer dossier vide `Uploads/`
  - [ ] Créer dossier vide `iisnode/`
  - [ ] Créer dossier vide `logs/`

### 2. Installer les dépendances

- [ ] Ouvrir CMD en tant qu'administrateur
  ```bash
  cd C:\inetpub\wwwroot\cofat-backend
  npm install --production
  ```

### 3. Configurer IIS

- [ ] Exécuter le script PowerShell :
  ```powershell
  cd d:\NVCapacity\scripts
  .\deploy-backend.ps1
  ```

  OU manuellement :

- [ ] Ouvrir **Gestionnaire IIS**
- [ ] Créer un nouveau site :
  - Nom : `Cofat-Backend-API`
  - Chemin : `C:\inetpub\wwwroot\cofat-backend`
  - IP : `172.23.23.31`
  - Port : `3005`
- [ ] Créer le pool d'applications :
  - Nom : `Cofat-Backend-API`
  - Version .NET : `Aucun code managé`
  - Mode pipeline : `Intégré`

### 4. Configurer les permissions

- [ ] Exécuter en PowerShell :
  ```powershell
  icacls "C:\inetpub\wwwroot\cofat-backend" /grant "IIS_IUSRS:(OI)(CI)F" /T
  icacls "C:\inetpub\wwwroot\cofat-backend\Uploads" /grant "IIS_IUSRS:(OI)(CI)F" /T
  icacls "C:\inetpub\wwwroot\cofat-backend\iisnode" /grant "IIS_IUSRS:(OI)(CI)F" /T
  ```

### 5. Configurer le pare-feu

- [ ] Autoriser le port 3005 :
  ```powershell
  New-NetFirewallRule -DisplayName "Cofat Backend API" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
  ```

### 6. Tester le backend

- [ ] Démarrer le site dans IIS
- [ ] Ouvrir un navigateur : `http://172.23.23.31:3005/`
- [ ] Vérifier les logs : `C:\inetpub\wwwroot\cofat-backend\iisnode\`

---

## 🎨 Déploiement du Frontend

### 1. Copier les fichiers

- [ ] Créer le dossier : `C:\inetpub\wwwroot\cofat-frontend`
- [ ] Copier **tout le contenu** du dossier `build/` :
  - [ ] `index.html`
  - [ ] `web.config`
  - [ ] Dossier `static/`
  - [ ] Tous les autres fichiers

### 2. Configurer IIS

- [ ] Exécuter le script PowerShell :
  ```powershell
  cd d:\NVCapacity\scripts
  .\deploy-frontend.ps1
  ```

  OU manuellement :

- [ ] Ouvrir **Gestionnaire IIS**
- [ ] Créer un nouveau site :
  - Nom : `Cofat-Frontend`
  - Chemin : `C:\inetpub\wwwroot\cofat-frontend`
  - IP : `172.23.23.31`
  - Port : `80`
- [ ] Créer le pool d'applications :
  - Nom : `Cofat-Frontend`
  - Version .NET : `Aucun code managé`
  - Mode pipeline : `Intégré`

### 3. Configurer les permissions

- [ ] Exécuter en PowerShell :
  ```powershell
  icacls "C:\inetpub\wwwroot\cofat-frontend" /grant "IIS_IUSRS:(OI)(CI)R" /T
  ```

### 4. Configurer le pare-feu

- [ ] Autoriser le port 80 :
  ```powershell
  New-NetFirewallRule -DisplayName "Cofat Frontend HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
  ```

### 5. Tester le frontend

- [ ] Démarrer le site dans IIS
- [ ] Ouvrir un navigateur : `http://172.23.23.31/`
- [ ] Vérifier que l'application se charge correctement

---

## 🔧 Configuration finale

### Vérifier la connexion Backend ↔ Frontend

- [ ] Ouvrir le frontend : `http://172.23.23.31/`
- [ ] Ouvrir la console du navigateur (F12)
- [ ] Vérifier qu'il n'y a pas d'erreurs CORS
- [ ] Tester une connexion (login, etc.)

### Vérifier la base de données

- [ ] Le backend peut se connecter à MySQL
- [ ] Les tables existent
- [ ] Les données sont accessibles

### Redémarrer IIS

- [ ] Exécuter en PowerShell :
  ```powershell
  iisreset
  ```

---

## 🧪 Tests finaux

- [ ] **Test 1 : Accès au frontend**
  - URL : `http://172.23.23.31/`
  - Résultat attendu : Page d'accueil s'affiche

- [ ] **Test 2 : Accès au backend**
  - URL : `http://172.23.23.31:3005/`
  - Résultat attendu : Réponse JSON ou message

- [ ] **Test 3 : Login**
  - Action : Se connecter avec un compte
  - Résultat attendu : Connexion réussie

- [ ] **Test 4 : Navigation**
  - Action : Naviguer entre les pages
  - Résultat attendu : Pas d'erreur 404

- [ ] **Test 5 : API Calls**
  - Action : Charger des données (équipements, budget, etc.)
  - Résultat attendu : Données chargées correctement

- [ ] **Test 6 : Upload de fichiers**
  - Action : Uploader un fichier
  - Résultat attendu : Upload réussi

---

## 📊 Monitoring

### Logs à surveiller

- [ ] **Backend logs** : `C:\inetpub\wwwroot\cofat-backend\iisnode\`
- [ ] **IIS logs** : `C:\inetpub\logs\LogFiles\`
- [ ] **Console navigateur** : F12 → Console

### Commandes utiles

```powershell
# Redémarrer IIS
iisreset

# Redémarrer un site spécifique
Stop-WebSite -Name "Cofat-Backend-API"
Start-WebSite -Name "Cofat-Backend-API"

# Vérifier les sites actifs
Get-Website

# Vérifier les pools d'applications
Get-IISAppPool
```

---

## 🚨 En cas de problème

### Backend ne démarre pas

- [ ] Vérifier les logs : `C:\inetpub\wwwroot\cofat-backend\iisnode\`
- [ ] Vérifier que Node.js est installé : `node --version`
- [ ] Vérifier que iisnode est installé
- [ ] Vérifier les permissions du dossier
- [ ] Vérifier le fichier `.env`

### Frontend affiche une page blanche

- [ ] Vérifier la console du navigateur (F12)
- [ ] Vérifier que `web.config` est présent
- [ ] Vérifier que URL Rewrite est installé
- [ ] Vérifier les chemins dans le build

### Erreur CORS

- [ ] Vérifier la configuration CORS dans `main.js`
- [ ] Vérifier que l'URL du frontend est correcte
- [ ] Redémarrer le backend

### Erreur 404 sur les routes React

- [ ] Vérifier que `web.config` contient les règles de réécriture
- [ ] Vérifier que URL Rewrite est installé
- [ ] Redémarrer le site frontend

---

## 📞 Support

Pour toute question ou problème :
- Consulter le guide complet : `GUIDE_DEPLOIEMENT_IIS.md`
- Contacter l'équipe IT de Cofat

---

**Date** : Novembre 2025  
**Version** : 1.0
