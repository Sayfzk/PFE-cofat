# Guide d'Implémentation de la Structure Dynamique pour le Module Space

## 📋 Vue d'ensemble

Ce guide explique comment appliquer la même logique de structure dynamique au module Space que celle implémentée pour le module HR.

## ✅ Fichiers Créés

### Backend
1. ✅ **models/Spaces.js** - Modèle mis à jour avec `category` et `rowOrder`
2. ✅ **migrations/add-rowOrder-category-to-space.js** - Migration Sequelize
3. ✅ **add-rowOrder-space-simple.js** - Script Node.js pour exécuter la migration
4. ✅ **add-rowOrder-space.sql** - Script SQL alternatif
5. ✅ **routers/spaceRoutes.js** - Routes mises à jour pour gérer `category` et `rowOrder`

### Frontend
1. ✅ **ExcelImporterSpace.js** - Nouveau composant d'import avec extraction dynamique

## 🔧 Étapes d'Installation

### Étape 1: Migration de la Base de Données

**Option A - Script Node.js (Recommandé):**
```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend
node add-rowOrder-space-simple.js
```

**Option B - Script SQL:**
1. Ouvrir SQL Server Management Studio
2. Ouvrir le fichier `add-rowOrder-space.sql`
3. Modifier le nom de la base de données (ligne 4)
4. Exécuter le script (F5)

### Étape 2: Redémarrer le Backend
```bash
# Arrêter le serveur (Ctrl+C)
# Puis le redémarrer
node server.js
```

### Étape 3: Mettre à Jour SpaceTable.js

Le fichier `SpaceTable.js` doit être modifié pour utiliser la même logique que `HrTable.js`. Voici les modifications nécessaires:

#### 3.1 Importer le nouveau composant
```javascript
// Remplacer
import ExcelImporter from './ExcelImporter';

// Par
import ExcelImporterSpace from './ExcelImporterSpace';
```

#### 3.2 Modifier la structure initiale
```javascript
// Remplacer la structure prédéfinie
const getEmptyTableStructure = () => [
  { label: 'Cutting area', category: 'SPACE', values: new Array(20).fill(0) },
  // ... autres lignes
];

// Par une structure vide
const getEmptyTableStructure = () => [];
```

#### 3.3 Modifier l'état initial
```javascript
const [data, setData] = useState({
  tableData: [],        // Structure vide
  years: [],            // Années dynamiques
  periods: {},          // Périodes dynamiques
  yearColSpans: {}      // Colonnes par année
});
```

#### 3.4 Mettre à jour handleDataImported
```javascript
const handleDataImported = (importedData) => {
  console.log('📊 Données Space importées:', importedData);
  
  try {
    const { tableData: importedTableData, years, periods, yearColSpans } = importedData;
    
    if (!importedTableData || importedTableData.length === 0) {
      console.error('❌ Aucune donnée importée');
      setSnackbar({ open: true, message: 'Aucune donnée trouvée dans le fichier Excel', severity: 'error' });
      return;
    }
    
    // Utiliser directement la structure dynamique
    console.log(`📊 Space - Structure dynamique importée:`);
    console.log(`  - ${importedTableData.length} lignes`);
    console.log(`  - Années: ${years.join(', ')}`);
    console.log(`  - Périodes:`, periods);
    
    // Mettre à jour l'état avec la structure complète importée
    setData({ 
      tableData: importedTableData, 
      years: years, 
      periods: periods,
      yearColSpans: yearColSpans
    });
    
    setSnackbar({ 
      open: true, 
      message: `Structure Space importée avec succès (${importedTableData.length} lignes). Cliquez sur Save pour sauvegarder.`, 
      severity: 'success' 
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'importation Space:', error);
    setSnackbar({ open: true, message: 'Erreur lors de l\'importation Space: ' + error.message, severity: 'error' });
  }
};
```

#### 3.5 Mettre à jour saveData
```javascript
const saveData = async (tableDataToSave = data.tableData) => {
  setLoading(true);
  try {
    const spaceData = [];
    
    // Calculer les index de colonnes dynamiquement
    let columnOffset = 0;
    const yearColumnOffsets = {};
    data.years.forEach(year => {
      yearColumnOffsets[year] = columnOffset;
      columnOffset += data.periods[year].length;
    });
    
    tableDataToSave.forEach((row, rowIndex) => {
      // Sauvegarder TOUTES les lignes avec leur ordre
      data.years.forEach((year) => {
        data.periods[year].forEach((period, periodIndex) => {
          const globalIndex = yearColumnOffsets[year] + periodIndex;
          
          spaceData.push({
            type: row.label,
            category: row.category,
            year: parseInt(year),
            month: period,
            area: parseInt(row.values[globalIndex]) || 0,
            rowOrder: rowIndex // Préserver l'ordre
          });
        });
      });
    });
    
    console.log(`💾 Space - Sauvegarde de ${spaceData.length} entrées pour le site ${siteCode}`);
    
    const res = await fetch(`${API_BASE_URL}/api/space/save`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: JSON.stringify({ siteCode, spaceData }),
    });
    
    if (!res.ok) throw new Error('Space Save failed');
    setSnackbar({ open: true, message: 'Données Space sauvegardées avec succès', severity: 'success' });
    
    // Recharger
    setTimeout(async () => {
      await loadData();
    }, 500);
  } catch (err) {
    console.error('Space Save error:', err);
    setSnackbar({ open: true, message: 'Erreur de sauvegarde Space: ' + err.message, severity: 'error' });
  } finally {
    setLoading(false);
  }
};
```

#### 3.6 Mettre à jour loadData
```javascript
const loadData = async () => {
  console.log(`📊 Space LoadData appelé pour le site: ${siteCode}`);
  setLoading(true);
  try {
    const url = `${API_BASE_URL}/api/space/site/${siteCode}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load Space data: ${res.status}`);
    const result = await res.json();
    
    if (result.success && result.data.length > 0) {
      console.log(`✅ Données Space trouvées pour ${siteCode}: ${result.data.length} entrées`);
      
      // Extraire la structure unique depuis la base de données en préservant l'ordre
      const uniqueRows = new Map();
      const yearsSet = new Set();
      const periodsMap = {};
      
      result.data.forEach(item => {
        const key = item.type;
        if (!uniqueRows.has(key)) {
          uniqueRows.set(key, {
            label: item.type,
            category: item.category || 'SPACE',
            values: [],
            rowOrder: item.rowOrder || 0
          });
        }
        
        yearsSet.add(item.year);
        if (!periodsMap[item.year]) {
          periodsMap[item.year] = new Set();
        }
        periodsMap[item.year].add(item.month);
      });
      
      // Construire la structure des périodes
      const years = Array.from(yearsSet).sort();
      const periods = {};
      const yearColSpans = {};
      
      years.forEach(year => {
        const yearPeriods = Array.from(periodsMap[year]).sort();
        periods[String(year)] = yearPeriods;
        yearColSpans[String(year)] = yearPeriods.length;
      });
      
      const allPeriods = Object.values(periods).flat();
      const totalColumns = allPeriods.length;
      
      // Initialiser et trier par rowOrder
      const loadedData = Array.from(uniqueRows.values())
        .sort((a, b) => a.rowOrder - b.rowOrder)
        .map(row => ({
          label: row.label,
          category: row.category,
          values: new Array(totalColumns).fill(0)
        }));
      
      // Remplir les valeurs
      result.data.forEach(item => {
        const rowIndex = loadedData.findIndex(row => row.label === item.type);
        if (rowIndex !== -1) {
          let columnIndex = 0;
          for (const year of years) {
            if (item.year === year) {
              const yearPeriods = periods[String(year)];
              const periodIndex = yearPeriods.indexOf(item.month);
              if (periodIndex !== -1) {
                loadedData[rowIndex].values[columnIndex + periodIndex] = item.area;
              }
              break;
            }
            columnIndex += periods[String(year)].length;
          }
        }
      });
      
      setData({ tableData: loadedData, years: years.map(String), periods, yearColSpans });
    } else {
      console.log(`🏴 Aucune donnée Space trouvée pour ${siteCode}`);
      setData({ tableData: [], years: [], periods: {}, yearColSpans: {} });
    }
  } catch (err) {
    console.error('Space Load error:', err);
    setSnackbar({ open: true, message: 'Erreur lors du chargement: ' + err.message, severity: 'error' });
    setData({ tableData: [], years: [], periods: {}, yearColSpans: {} });
  } finally {
    setLoading(false);
  }
};
```

#### 3.7 Mettre à jour l'affichage
```javascript
// Remplacer le composant ExcelImporter
<ExcelImporterSpace onDataImported={handleDataImported} />

// Organiser les colonnes dynamiquement
const yearColumns = data.years.map(year => ({
  year: year,
  periods: data.periods[year] || [],
  colspan: data.yearColSpans[year] || (data.periods[year] || []).length
}));

// Afficher un message si pas de données
const hasData = data.tableData.length > 0 && data.years.length > 0;

{!hasData && (
  <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
    <Typography variant="h6" color="text.secondary">
      Aucune donnée Space disponible pour ce site.
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      Importez un fichier Excel pour définir la structure du tableau.
    </Typography>
  </Paper>
)}
```

## 🎯 Résultat Attendu

Après ces modifications:

1. ✅ **Import Excel** → Extraction automatique de la structure (lignes, catégories, années, périodes)
2. ✅ **Affichage** → Tableau identique au fichier Excel
3. ✅ **Sauvegarde** → Données sauvegardées avec leur ordre
4. ✅ **Rechargement** → Structure préservée fidèlement

## 📊 Exemple de Structure Space

### Cofatec:
```
SPACE
  - Cutting area
  - Lead prep
Assembly
  - SCANIA
  - CLAAS
  - VW
  - PROJECT 4
S-Total Assembly
SUMMARY
  - TOTAL AREA
  - Occupation
  - Available Area
```

### Brasil (peut être différent):
```
SPACE
  - Cutting area
  - Lead prep
  - Warehouse
Assembly
  - DAF
  - Scania
  - Components
S-Total Assembly
SUMMARY
  - TOTAL AREA
  - Occupation
  - Available Area
```

## ⚠️ Points Importants

1. **Migration obligatoire** - Exécuter `add-rowOrder-space-simple.js` avant d'utiliser
2. **Redémarrage requis** - Le backend doit être redémarré après la migration
3. **Structure flexible** - Chaque site peut avoir sa propre structure
4. **Pas de calculs automatiques** - Toutes les valeurs viennent du fichier Excel

## 🆘 Dépannage

### Erreur "Invalid column name 'category'" ou "Invalid column name 'rowOrder'"
→ La migration n'a pas été exécutée. Exécuter `node add-rowOrder-space-simple.js`

### Les lignes ne sont pas dans le bon ordre
→ Réimporter le fichier Excel et sauvegarder

### Le tableau est vide après rechargement
→ Vérifier que les données ont bien été sauvegardées avec `rowOrder`

## 📝 Checklist Complète

- [ ] Exécuter la migration Space (`node add-rowOrder-space-simple.js`)
- [ ] Redémarrer le backend
- [ ] Mettre à jour SpaceTable.js avec les modifications ci-dessus
- [ ] Tester l'import d'un fichier Excel
- [ ] Vérifier l'affichage
- [ ] Sauvegarder
- [ ] Recharger et vérifier que l'ordre est préservé

---

**Note**: Ce guide suit exactement la même logique que l'implémentation HR. Référez-vous à `HR_DYNAMIC_STRUCTURE_IMPLEMENTATION.md` pour plus de détails sur la logique générale.
