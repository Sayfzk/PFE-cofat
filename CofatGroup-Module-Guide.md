# 🔗 Module CofatGroup - Guide Complet

## 🎯 **Objectif du Module**

Le module **CofatGroup** permet de visualiser et analyser les équipements consolidés qui sont présents sur plusieurs sites COFAT. Il agrège automatiquement les données d'équipements identiques (même `equipmentId`) présents sur différents sites.

### **Fonctionnalités Principales**
- ✅ **Consolidation automatique** par `equipmentId`
- ✅ **Agrégation des valeurs** : Machine Need + Available Machine + To Order
- ✅ **Calcul de charge moyenne** par période
- ✅ **Visualisations graphiques** (Top 5, évolutions)
- ✅ **Interface accordion** pour détails par équipement
- ✅ **Identification des équipements multi-sites**

---

## 🏗️ **Architecture Technique**

### **Backend API** (`/api/cofat-group/`)
```javascript
GET /consolidated     // Données consolidées par équipement
GET /equipment/:id/details  // Détails d'un équipement spécifique  
GET /summary         // Statistiques globales
```

### **Frontend** (`/cofat-group`)
- **React Component** : `CofatGroup.js`
- **Styles** : `CofatGroup.css`
- **Navigation** : Intégré dans sidebar
- **Charts** : Chart.js (Bar, Line)

### **Base de Données**
```sql
-- Utilise les tables existantes
- EquipmentPlanning (données par site/équipement/période)
- Equipment (informations équipements)
- Sites (informations sites)
```

---

## 📊 **Logique d'Agrégation**

### **Exemple Concret**
Supposons que l'équipement **"Komax 300"** existe sur 3 sites :

| Site | Q01 Machine Need | Q01 Available | Q01 To Order | Q01 Load |
|------|------------------|---------------|--------------|----------|
| Tunis | 18 | 18 | 2 | 100% |
| Mateur | 20 | 20 | 0 | 111% |
| Kairouan | 15 | 15 | 0 | 94% |

### **Résultat Consolidé**
```
Komax 300 (3 sites: Tunis, Mateur, Kairouan)
├── Q01 Machine Need: 53 (18+20+15)
├── Q01 Available: 53 (18+20+15)  
├── Q01 To Order: 2 (2+0+0)
└── Q01 Load: 102% (moyenne: (100+111+94)/3)
```

---

## 🎨 **Interface Utilisateur**

### **1. Cartes de Résumé** 📈
- **Équipements Uniques** : Nombre total d'équipements consolidés
- **Sites Actifs** : Nombre de sites avec données
- **Entrées Planning** : Total des entrées dans la base
- **Équipements Multi-Sites** : Équipements présents sur >1 site

### **2. Graphiques** 📊
- **Bar Chart** : Top 5 équipements (Besoin vs Disponibilité)
- **Line Chart** : Évolution de la charge par période

### **3. Tables Consolidées** 📋
- **Format Accordion** : Un équipement par section
- **4 Métriques** : Machine Need, Available Machine, To Order, Load
- **Toutes Périodes** : 2025 (MO 01-12), 2026/2027 (Q 01-04)
- **Code Couleur** : Charge normale/pleine/dépassée

---

## 🚀 **Instructions de Test**

### **1. Démarrer les Serveurs**
```bash
# Terminal 1 - Backend
cd D:\NVCapacity\Cofat_Capacity_Study-backend
npm start

# Terminal 2 - Frontend  
cd D:\NVCapacity\Cofat_Capacity_front
npm start
```

### **2. Accéder au Module**
- **URL** : `http://localhost:4000/cofat-group`
- **Navigation** : Sidebar > CofatGroup (icône réseau)
- **Prérequis** : Données d'équipements existantes dans plusieurs sites

### **3. Tests Fonctionnels**

#### **✅ Test 1 : Chargement Initial**
1. Accéder à `/cofat-group`
2. **Attendre** : Chargement des données
3. **Vérifier** : 
   - Cartes de résumé affichées
   - Nombre d'équipements consolidés > 0
   - Graphiques générés si données disponibles

#### **✅ Test 2 : Équipements Multi-Sites**
1. **Rechercher** : Équipements avec chip "X sites" où X > 1
2. **Cliquer** : Expand accordion
3. **Vérifier** :
   - Tableau détaillé avec toutes les périodes
   - Valeurs agrégées correctes
   - Liste des sites concernés en bas

#### **✅ Test 3 : Actualisation**
1. **Cliquer** : Bouton "Actualiser"
2. **Vérifier** : 
   - Rechargement des données
   - Message de succès
   - Données à jour

#### **✅ Test 4 : Responsive Design**
1. **Redimensionner** : Fenêtre du navigateur
2. **Vérifier** : 
   - Interface s'adapte
   - Tableaux restent scrollables
   - Cartes s'empilent sur mobile

---

## 🔧 **API Testing**

### **Test Direct des Endpoints**
```bash
# 1. Données consolidées
curl http://172.20.79.39:3001/api/cofat-group/consolidated

# 2. Résumé statistique
curl http://172.20.79.39:3001/api/cofat-group/summary

# 3. Détails d'un équipement (remplacer EQUIP_ID)
curl http://172.20.79.39:3001/api/cofat-group/equipment/EQUIP_ID/details
```

### **Réponse Attendue (Consolidated)**
```json
{
  "success": true,
  "data": [
    {
      "equipment": {
        "equipmentId": "KOMAX_300",
        "nom": "Komax 300",
        "equipmentCode": "KX300",
        "referenceEquipment": "REF123"
      },
      "sites": ["Tunis", "Mateur"],
      "totalSites": 2,
      "periods": {
        "2025-Q 01": {
          "year": 2025,
          "month": "Q 01", 
          "machineNeed": 38,
          "availableMachine": 38,
          "toOrder": 2,
          "load": 105.5
        }
      }
    }
  ],
  "count": 15,
  "summary": {
    "totalEquipments": 15,
    "totalSites": 7,
    "totalPlanningEntries": 450
  }
}
```

---

## 🐛 **Troubleshooting**

### **Problème : Aucune donnée consolidée**
**Causes possibles :**
1. Aucune donnée d'équipement dans la base
2. Aucun équipement présent sur plusieurs sites
3. Problème de connexion API

**Solutions :**
```bash
# Vérifier les données d'équipements
curl http://172.20.79.39:3001/api/equipment-planning/sites

# Vérifier les logs du serveur backend
# Rechercher : "CofatGroup - X entrées récupérées depuis la base"
```

### **Problème : Graphiques ne s'affichent pas**
**Causes possibles :**
1. Chart.js non chargé correctement
2. Données insuffisantes (< 1 équipement)
3. Erreur JavaScript dans la console

**Solutions :**
1. Ouvrir Console développeur (F12)
2. Vérifier erreurs JavaScript
3. Vérifier que `consolidatedData.length > 0`

### **Problème : Calculs d'agrégation incorrects**
**Debug :**
1. Ouvrir Console développeur
2. Rechercher logs : "🔄 Reconstruction CofatGroup"
3. Vérifier que les valeurs sont bien sommées

---

## ✅ **Validation des Autres Modules**

### **Modules à Tester (non affectés)**
- ✅ **Equipment Planning** : `/equipement/mateur`
- ✅ **Space** : `/space/mateur`  
- ✅ **HR** : `/hr/mateur`
- ✅ **Standard Equipment** : `/standard-equipment`
- ✅ **Admin Dashboard** : `/admin/dashboard`

### **Points de Validation**
1. **Navigation** : Sidebar fonctionne normalement
2. **Données** : Chaque module affiche ses données spécifiques
3. **APIs** : Aucun conflit d'endpoints
4. **Performance** : Pas de ralentissement

---

## 🎯 **Cas d'Usage Business**

### **Scenario 1 : Planification Globale**
- **Utilisateur** : Responsable Planning Groupe
- **Besoin** : Vue consolidée des équipements critiques
- **Action** : Consulter CofatGroup pour identifier les goulets d'étranglement

### **Scenario 2 : Optimisation Multi-Sites**
- **Utilisateur** : Directeur Opérations
- **Besoin** : Redistribuer les équipements entre sites
- **Action** : Analyser les charges par site dans les détails

### **Scenario 3 : Investissements**
- **Utilisateur** : Contrôleur de Gestion
- **Besoin** : Justifier achats d'équipements
- **Action** : Utiliser graphiques et métriques consolidées

---

## 📈 **Métriques de Succès**

### **Technique**
- ✅ API répond en < 2 secondes
- ✅ Interface responsive sur mobile/desktop
- ✅ Aucun conflit avec modules existants
- ✅ Logs détaillés pour debug

### **Fonctionnel**
- ✅ Agrégation correcte des valeurs numériques
- ✅ Identification des équipements multi-sites
- ✅ Navigation intuitive (accordion)
- ✅ Graphiques informatifs

### **Business**
- ✅ Vue consolidée équipements groupe
- ✅ Aide à la prise de décision
- ✅ Optimisation des investissements
- ✅ Visibilité sur utilisation globale

---

## 🚀 **Prochaines Évolutions**

### **Version 1.1**
- [ ] **Export Excel** des données consolidées
- [ ] **Filtres** par site, équipement, période
- [ ] **Alertes** pour surcapacité/sous-capacité

### **Version 1.2**
- [ ] **Prédictions** basées sur tendances
- [ ] **Comparaisons** année sur année
- [ ] **Dashboard temps réel** avec WebSocket

---

**Le module CofatGroup est maintenant opérationnel et prêt pour la production !** 🎉