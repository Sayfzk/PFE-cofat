# 🚀 Guide des Améliorations - Application COFAT Capacity

## 📋 Résumé des Nouvelles Fonctionnalités

### 1. 🌐 Système Multilingue (Français/Anglais)
**Localisation :** Icône globe dans la barre de navigation supérieure (à droite)

**Fonctionnalités :**
- Clic sur l'icône 🌐 pour ouvrir le menu de langues
- Sélection entre 🇫🇷 Français et 🇬🇧 English
- Langue sauvegardée automatiquement
- Traduction de toute l'interface utilisateur

**Test :**
1. Connectez-vous à l'application
2. Cliquez sur l'icône globe (🌐) en haut à droite
3. Sélectionnez "🇬🇧 English" ou "🇫🇷 Français"
4. Vérifiez que l'interface change de langue
5. Rechargez la page → la langue reste mémorisée

---

### 2. 🔐 Accès CofatGroup (Super Admin uniquement)

**Prérequis :** Connexion avec un compte ayant le rôle `admin`

**Localisation :** Menu latéral gauche → Section "CofatGroup" (visible uniquement pour les admins)

**Fonctionnalités :**
- **CofatGroup Equipment** : Consolidation de tous les équipements
- **CofatGroup Space** : Consolidation de tous les espaces
- **CofatGroup HR** : Consolidation de toutes les ressources humaines
- **Admin Dashboard** : Vue d'ensemble globale

**Test :**
1. Connectez-vous avec un compte admin
2. Dans le menu latéral, cherchez "CofatGroup" 
3. Cliquez pour déplier le sous-menu
4. Testez l'accès à chaque section (Equipment, Space, HR)
5. Vérifiez que les données de tous les sites sont consolidées

---

### 3. 🔔 Système de Notifications

**Fonctionnalités :**
- Notifications automatiques lors des sauvegardes
- Notifications lors des suppressions
- Affichage en temps réel dans la barre de navigation
- Messages personnalisés selon le rôle utilisateur

**Modules concernés :**
- ✅ Standard Equipment (déjà fonctionnel)
- ✅ Equipment Planning (maintenant fonctionnel)
- ✅ Space (maintenant fonctionnel)  
- ✅ HR (maintenant fonctionnel)

**Test :**
1. Allez dans n'importe quel module (Space, HR, Equipment Planning)
2. Importez des données Excel OU modifiez des données
3. Cliquez sur "SAVE" (Enregistrer)
4. Vérifiez qu'une notification apparaît
5. Testez aussi la suppression de données

---

### 4. 📊 Module Space - Nouveau Format

**Améliorations :**
- **7 projets Assembly** au lieu de 3 :
  1. SCANIA (maintenu)
  2. CLAAS (maintenu)
  3. VW (maintenu)
  4. PROJECT 4 (nouveau)
  5. PROJECT 5 (nouveau)
  6. PROJECT 6 (nouveau)
  7. PROJECT 7 (nouveau)
- **Ligne S-Total Assembly** : Somme automatique des projets Assembly
- **Affichage 0** si aucune donnée disponible

**Test :**
1. Allez dans Space → Choisissez un site (ex: Kairouan)
2. Vérifiez la présence des 7 projets dans l'ordre correct
3. Importez des données Excel avec les nouveaux projets
4. Vérifiez que la ligne "S-Total Assembly" se calcule automatiquement

---

### 5. 👥 Module HR - Nouveaux Projets

**Améliorations :**
- **7 projets Assembly Direct** au lieu de 2 :
  1. Project 1 (maintenu, renommé)
  2. Project 2 (maintenu, renommé)  
  3. Project 3 (nouveau)
  4. Project 4 (nouveau)
  5. Project 5 (nouveau)
  6. Project 6 (nouveau)
  7. Project 7 (nouveau)
- **Ligne S-Total Assembly** : Somme des effectifs Assembly

**Test :**
1. Allez dans HR → Choisissez un site
2. Vérifiez la présence des 7 projets Assembly Direct
3. Importez des données Excel avec les nouveaux projets
4. Vérifiez le calcul automatique de "S-Total Assembly"

---

## 🛠️ Instructions Techniques

### Démarrage de l'Application

**Frontend :**
```bash
cd d:\NVCapacity\Cofat_Capacity_front
npm start
```
→ Application accessible sur http://localhost:4000

**Backend :**
```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend
npm start
```
→ API accessible sur http://172.20.79.39:3001

### Comptes de Test

**Super Admin :**
- Rôle : `admin`
- Accès : Toutes les fonctionnalités + CofatGroup + Admin Dashboard

**Utilisateur Standard :**
- Rôle : `user`  
- Accès : Modules standard (pas de CofatGroup)

---

## 🐛 Résolution de Problèmes

### Problème : Sélecteur de langue non visible
**Solution :** Vérifiez que vous êtes connecté et que la navbar s'affiche correctement

### Problème : CofatGroup non accessible
**Solution :** Vérifiez que votre compte a le rôle `admin`

### Problème : Notifications ne s'affichent pas
**Solution :** 
1. Vérifiez la console du navigateur (F12)
2. Assurez-vous que le backend est démarré
3. Testez avec une action simple (sauvegarde)

### Problème : Nouveaux projets non visibles
**Solution :** 
1. Rechargez la page (Ctrl+F5)
2. Vérifiez que vous êtes sur la bonne version du code
3. Videz le cache du navigateur

---

## 📞 Support

Pour toute question ou problème :
1. Vérifiez d'abord cette documentation
2. Consultez la console du navigateur (F12) pour les erreurs
3. Vérifiez que backend et frontend sont démarrés
4. Contactez l'équipe de développement avec les détails de l'erreur

---

## ✅ Checklist de Validation

- [ ] Sélecteur de langue fonctionne (FR ↔ EN)
- [ ] Accès CofatGroup pour admin uniquement
- [ ] Notifications dans Equipment Planning
- [ ] Notifications dans Space  
- [ ] Notifications dans HR
- [ ] 7 projets Assembly dans Space (SCANIA, CLAAS, VW, PROJECT 4-7)
- [ ] 7 projets Assembly dans HR (Project 1-7)
- [ ] Calcul automatique S-Total Assembly
- [ ] Admin Dashboard accessible
- [ ] Consolidation CofatGroup fonctionnelle

**Date de mise à jour :** 06 Octobre 2025
**Version :** 2.0 - Améliorations Client Final
