# 🧮 GUIDE CofatGroup - Tableaux Consolidés Identiques

## 📋 **Objectif**
Créer des vues CofatGroup qui affichent **exactement les mêmes tableaux** que Space et HR, mais avec des **sommes globales** de tous les sites.

## 🎯 **Spécifications**

### **CofatGroup Space**
- **Affichage :** Tableau identique à SpaceTable.js
- **Structure :** Même lignes (Cutting area, Lead prep, SCANIA, CLAAS, VW, PROJECT 4-7, S-Total Assembly, etc.)
- **Données :** Somme de tous les sites pour chaque champ
- **Colonnes :** Mêmes périodes (2025: MO 01-12, 2026-2027: Q 01-04)

### **CofatGroup HR**
- **Affichage :** Tableau identique à HrTable.js  
- **Structure :** Même lignes HR
- **Données :** Somme de tous les sites pour chaque champ
- **Colonnes :** Mêmes périodes

## 🔧 **Implémentation Technique**

### **Backend - Route de Consolidation**
```javascript
// /api/cofat-group/space - Consolider tous les sites Space
app.get('/api/cofat-group/space', async (req, res) => {
  // 1. Récupérer toutes les données Space de tous les sites
  // 2. Grouper par type/ligne (Cutting area, SCANIA, etc.)
  // 3. Sommer les valeurs pour chaque période
  // 4. Retourner la structure identique à SpaceTable
});

// /api/cofat-group/hr - Consolider tous les sites HR  
app.get('/api/cofat-group/hr', async (req, res) => {
  // 1. Récupérer toutes les données HR de tous les sites
  // 2. Grouper par type/ligne HR
  // 3. Sommer les valeurs pour chaque période
  // 4. Retourner la structure identique à HrTable
});
```

### **Frontend - Composants Identiques**
```javascript
// CofatGroupSpace.js - Copie exacte de SpaceTable.js
// - Même structure de tableau
// - Même colonnes et lignes  
// - Même styling
// - Données depuis /api/cofat-group/space

// CofatGroupHr.js - Copie exacte de HrTable.js
// - Même structure de tableau
// - Même colonnes et lignes
// - Même styling  
// - Données depuis /api/cofat-group/hr
```

## 📊 **Exemple Consolidation Space**

**Sites individuels :**
```
Site TUN - SCANIA MO 01: 100
Site BRA - SCANIA MO 01: 200  
Site GER - SCANIA MO 01: 150
```

**CofatGroup Space - SCANIA MO 01: 450** (100+200+150)

## 🚀 **État Actuel**

### **✅ Déjà Fonctionnel**
- Backend route `/api/cofat-group/space` existe
- Logique de consolidation implémentée
- CofatGroupSpace.js créé

### **🔧 À Finaliser**  
- Adapter l'affichage pour être identique à SpaceTable
- Créer CofatGroupHr.js identique à HrTable
- Tester la consolidation complète

## 🧪 **Instructions de Test**

1. **Accès Admin Requis**
   - Connectez-vous avec un compte administrateur
   - Sidebar → CofatGroup → Space/HR

2. **Vérification Consolidation**
   - Comparez les totaux CofatGroup avec la somme manuelle des sites
   - Vérifiez que la structure est identique aux tableaux originaux

3. **Test Complet**
   - Space : Même tableau que SpaceTable mais avec sommes globales
   - HR : Même tableau que HrTable mais avec sommes globales

## 📞 **Support**

**Fichiers Clés :**
- `CofatGroupSpace.js` - Vue consolidée Space
- `CofatGroupHr.js` - Vue consolidée HR (à créer)
- `/api/cofat-group/*` - Routes de consolidation backend

**L'objectif est d'avoir des tableaux visuellement identiques mais avec des données consolidées de tous les sites ! 🎯**
