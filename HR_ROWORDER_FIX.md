# Correction de l'Ordre des Lignes HR après Rechargement

## Problème Identifié

Après l'importation d'un fichier Excel et la sauvegarde, le rechargement des données affichait les lignes dans un ordre différent de celui du fichier Excel importé. Cela était dû au fait que la base de données ne préservait pas l'ordre original des lignes.

## Solution Implémentée

### 1. Ajout du champ `rowOrder` au modèle HR

**Fichier**: `models/HR.js`

Ajout d'un nouveau champ pour stocker l'ordre des lignes:

```javascript
rowOrder: {
  type: DataTypes.INTEGER,
  allowNull: true,
  defaultValue: 0,
  comment: 'Order of the row in the table for display purposes'
}
```

### 2. Migration de la base de données

**Fichier**: `migrations/add-rowOrder-to-hr.js`

Migration pour ajouter le champ `rowOrder` à la table HR existante:

```javascript
await queryInterface.addColumn('HR', 'rowOrder', {
  type: Sequelize.INTEGER,
  allowNull: true,
  defaultValue: 0
});

await queryInterface.addIndex('HR', ['siteId', 'rowOrder'], {
  name: 'hr_site_order_index'
});
```

### 3. Mise à jour du Frontend

**Fichier**: `HrTable.js`

#### Sauvegarde avec rowOrder:
```javascript
tableDataToSave.forEach((row, rowIndex) => {
  // ...
  hrData.push({
    type: row.label,
    category: row.category,
    year: parseInt(year),
    month: period,
    count: parseInt(row.values[globalIndex]) || 0,
    rowOrder: rowIndex // ✅ Préserver l'ordre
  });
});
```

#### Chargement avec tri par rowOrder:
```javascript
const loadedData = Array.from(uniqueRows.values())
  .sort((a, b) => a.rowOrder - b.rowOrder) // ✅ Trier par ordre
  .map(row => ({
    label: row.label,
    category: row.category,
    values: new Array(totalColumns).fill(0)
  }));
```

#### Calcul dynamique des index de colonnes:
```javascript
// Calculer les offsets de colonnes pour chaque année
let columnOffset = 0;
const yearColumnOffsets = {};
data.years.forEach(year => {
  yearColumnOffsets[year] = columnOffset;
  columnOffset += data.periods[year].length;
});

// Utiliser les offsets pour calculer l'index global
const globalIndex = yearColumnOffsets[year] + periodIndex;
```

### 4. Mise à jour du Backend

**Fichier**: `routers/hrRoutes.js`

#### GET - Tri par rowOrder:
```javascript
const hrData = await HR.findAll({
  where: { siteId: site.id },
  order: [['rowOrder', 'ASC'], ['type', 'ASC'], ['year', 'ASC'], ['month', 'ASC']]
});
```

#### POST - Sauvegarde du rowOrder:
```javascript
const upsertPromises = hrData.map(entry => HR.upsert({
  siteId: site.id,
  type: entry.type,
  category: entry.category,
  year: entry.year,
  month: entry.month,
  count: entry.count || 0,
  rowOrder: entry.rowOrder !== undefined ? entry.rowOrder : 0
}));
```

## Étapes d'Installation

### 1. Exécuter la migration

```bash
cd Cofat_Capacity_Study-backend
node run-hr-migration.js
```

### 2. Redémarrer le backend

```bash
# Arrêter le serveur backend
# Puis le redémarrer
node server.js
```

### 3. Tester le frontend

1. Aller sur le module HR d'un site (ex: `/hr/cofatec`)
2. Importer un fichier Excel
3. Vérifier que l'ordre des lignes correspond au fichier Excel
4. Cliquer sur "Save"
5. Cliquer sur "Refresh" ou recharger la page
6. ✅ Vérifier que l'ordre des lignes est préservé

## Avantages de cette solution

### ✅ Ordre préservé
- L'ordre des lignes du fichier Excel est maintenant préservé après sauvegarde et rechargement
- Chaque ligne a un index unique qui définit sa position dans le tableau

### ✅ Compatibilité
- Les données existantes continuent de fonctionner (rowOrder par défaut = 0)
- Pas besoin de réimporter les données existantes

### ✅ Flexibilité
- Permet de réorganiser les lignes si nécessaire
- Support de structures différentes pour chaque site

### ✅ Performance
- Index sur (siteId, rowOrder) pour des requêtes rapides
- Tri efficace lors du chargement

## Structure de la table HR après migration

```sql
CREATE TABLE HR (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  siteId INTEGER NOT NULL,
  type VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  month VARCHAR(10) NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  rowOrder INTEGER DEFAULT 0,  -- ✅ NOUVEAU CHAMP
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  
  UNIQUE KEY unique_hr_entry (siteId, type, year, month),
  KEY hr_site_index (siteId),
  KEY hr_type_index (type),
  KEY hr_period_index (year, month),
  KEY hr_site_order_index (siteId, rowOrder)  -- ✅ NOUVEL INDEX
);
```

## Exemple de données

### Avant (ordre aléatoire):
```
rowOrder | type              | category
---------|-------------------|------------------
0        | Production        | Indirect
0        | Cutting area      | Direct
0        | Quality           | Indirect
0        | Lead prep area    | Direct
```

### Après import Excel (ordre préservé):
```
rowOrder | type              | category
---------|-------------------|------------------
0        | Cutting area      | Direct
1        | Lead prep area    | Direct
2        | International E44 | Direct
3        | VW Tayron         | Assembly Direct
4        | Production        | Indirect
5        | Quality           | Indirect
```

## Workflow complet

```
1. Import Excel
   ↓
2. ExcelImporterHR extrait les lignes dans l'ordre
   ↓
3. HrTable affiche les lignes dans l'ordre
   ↓
4. Utilisateur clique "Save"
   ↓
5. Frontend envoie rowOrder pour chaque ligne
   ↓
6. Backend sauvegarde avec rowOrder
   ↓
7. Utilisateur clique "Refresh"
   ↓
8. Backend charge et trie par rowOrder
   ↓
9. Frontend affiche dans le même ordre ✅
```

## Notes importantes

### 🔴 Migration requise
- La migration doit être exécutée avant d'utiliser cette fonctionnalité
- Sans migration, le champ rowOrder n'existera pas et causera des erreurs

### 🟡 Données existantes
- Les données existantes auront rowOrder = 0
- Elles s'afficheront dans l'ordre alphabétique par type
- Pour corriger, réimporter le fichier Excel et sauvegarder

### 🟢 Nouvelles données
- Toutes les nouvelles importations préserveront l'ordre automatiquement
- Pas d'action manuelle nécessaire

## Résumé

Cette correction garantit que l'ordre des lignes du tableau HR est **toujours identique** à celui du fichier Excel importé, même après sauvegarde et rechargement. Cela résout le problème où les lignes s'affichaient dans un ordre différent après le rechargement.
