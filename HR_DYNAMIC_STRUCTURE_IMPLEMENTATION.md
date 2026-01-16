# Implémentation de la Structure Dynamique pour le Module HR

## Vue d'ensemble

Le module HR a été modifié pour supporter des structures de tableau **complètement dynamiques** basées sur les fichiers Excel importés. Chaque site (Cofatec, Brasil, etc.) peut maintenant avoir sa propre structure unique de tableau.

## Changements Implémentés

### 1. ExcelImporterHR.js - Extraction Dynamique

**Fichier**: `d:\NVCapacity\Cofat_Capacity_front\src\components\user\pages\ExcelImporterHR.js`

#### Fonctionnalités:
- ✅ **Extraction automatique des années et périodes** depuis le fichier Excel
- ✅ **Détection dynamique des colonnes** (MO 01-12 pour 2025, Q 01-04 pour 2026/2027)
- ✅ **Extraction de toutes les lignes** avec leurs catégories depuis le fichier Excel
- ✅ **Support de structures différentes** pour chaque site

#### Logique d'extraction:
```javascript
// Extrait dynamiquement:
1. Les années (2025, 2026, 2027) et leurs positions
2. Les périodes pour chaque année (mois ou trimestres)
3. Toutes les lignes de données avec:
   - Colonne A: Catégorie (Direct, Assembly Direct, Indirect, etc.)
   - Colonne B: Label de la ligne (Cutting area, Lead prep area, projets, etc.)
   - Colonnes suivantes: Valeurs numériques
```

#### Exemple de structure extraite pour Cofatec:
```
Direct
  - Cutting area
  - Lead prep area
  - International E44
  - VW Tayron
  - LS Flexibility
  - BEV-A
  - Stellantis J4U
  - VW Golf 8
Assembly Direct
  - [Projets spécifiques]
S-Total production
Indirect
  - Production
  - Eng
  - Quality
  - Maintenance
S-Total
Total Plant
```

#### Exemple de structure extraite pour Brasil:
```
Direct
  - Cutting area
  - Lead prep area
  - DAF 10.268
  - Frame
  - Scania GW
  - Scania GW2
  - Battery cable
  - Scania DWO
Assembly Direct
  - Sysops (Mahle, Denso e Valeo)
  - Components
  - Bumper
  - Doors
  - IP
S-Total Assembly
Total production
Production (Leader)
Eng (Agent Method)
Indirect
  - Quality (Inspection)
  - Maintenance (Technical)
  - Logistic (Warehouse)
S-Total
Total Plant
```

### 2. HrTable.js - Affichage Dynamique

**Fichier**: `d:\NVCapacity\Cofat_Capacity_front\src\components\user\pages\HrTable.js`

#### Fonctionnalités:
- ✅ **Structure vide par défaut** - Pas de structure prédéfinie
- ✅ **Affichage dynamique** basé sur les données importées ou chargées
- ✅ **Support des années et périodes variables**
- ✅ **Gestion des catégories dynamiques**
- ✅ **Message informatif** quand aucune donnée n'est disponible

#### État de données:
```javascript
const [data, setData] = useState({
  tableData: [],        // Lignes dynamiques
  years: [],            // Années extraites
  periods: {},          // Périodes par année
  yearColSpans: {}      // Nombre de colonnes par année
});
```

#### Chargement depuis la base de données:
- Extrait automatiquement la structure unique depuis les données sauvegardées
- Reconstruit les années, périodes et lignes dynamiquement
- Affiche exactement la même structure que celle importée

### 3. Backend - Stockage Flexible

**Fichiers**: 
- `d:\NVCapacity\Cofat_Capacity_Study-backend\models\HR.js`
- `d:\NVCapacity\Cofat_Capacity_Study-backend\routers\hrRoutes.js`

#### Structure de la table HR:
```sql
HR {
  id: INTEGER (PK)
  siteId: INTEGER (FK -> Sites)
  type: STRING(100)      -- Nom de la ligne (flexible)
  category: STRING(50)   -- Catégorie (flexible)
  year: INTEGER          -- Année
  month: STRING(10)      -- Période (MO 01-12, Q 01-04)
  count: INTEGER         -- Valeur
}
```

#### Points clés:
- ✅ **Pas de contraintes sur les types/catégories** - Accepte n'importe quel nom
- ✅ **Index unique** sur (siteId, type, year, month)
- ✅ **Upsert automatique** pour éviter les doublons
- ✅ **Cascade delete** quand un site est supprimé

## Workflow d'utilisation

### 1. Import d'un fichier Excel

```
1. L'utilisateur clique sur "Import Excel"
2. Sélectionne un fichier Excel avec la structure du site
3. ExcelImporterHR extrait:
   - Les années et périodes
   - Toutes les lignes avec catégories
   - Toutes les valeurs numériques
4. HrTable affiche la structure extraite
5. L'utilisateur clique sur "Save"
6. Les données sont sauvegardées dans la base
```

### 2. Chargement depuis la base de données

```
1. L'utilisateur accède au module HR pour un site
2. HrTable charge les données depuis l'API
3. La structure est reconstruite dynamiquement:
   - Extraction des lignes uniques
   - Extraction des années et périodes
   - Reconstruction du tableau
4. Affichage du tableau avec la structure du site
```

### 3. Changement de site

```
1. L'utilisateur change de site dans l'URL
2. Le tableau est réinitialisé (structure vide)
3. Les nouvelles données sont chargées
4. La nouvelle structure est affichée
```

## Avantages de cette approche

### ✅ Flexibilité totale
- Chaque site peut avoir sa propre structure
- Pas de limitation sur le nombre de lignes
- Pas de limitation sur les noms de catégories/lignes

### ✅ Maintenance simplifiée
- Pas besoin de modifier le code pour ajouter un nouveau site
- Pas de structure codée en dur
- Structure définie par les fichiers Excel métier

### ✅ Cohérence des données
- La structure affichée est toujours celle du fichier Excel importé
- Pas de décalage entre l'Excel et le frontend
- Sauvegarde et rechargement fidèles

### ✅ Évolutivité
- Facile d'ajouter de nouveaux sites
- Facile de modifier la structure d'un site existant
- Support de structures complexes

## Format des fichiers Excel

### Structure attendue:

```
Ligne 1: [vide] | [vide] | 2025 | ... | 2026 | ... | 2027 | ...
Ligne 2: [vide] | [vide] | MO 01 | MO 02 | ... | Q 01 | Q 02 | ...
Ligne 3+: Catégorie | Label | valeur1 | valeur2 | ...
```

### Exemples:

**Cofatec:**
```
manufacturing range plant | Project | 2025 | ... | 2026 | ... | 2027 | ...
                         |         | MO 01 | MO 02 | ... | Q 01 | Q 02 | ...
Direct                   | Cutting area | 5 | 5 | ...
Direct                   | Lead prep area | 18 | 18 | ...
                         | International E44 | 42 | 42 | ...
```

**Brasil:**
```
manufacturing range plant | Project | 2025 | ... | 2026 | ... | 2027 | ...
                         |         | MO 01 | MO 02 | ... | Q 01 | Q 02 | ...
Direct                   | Cutting area | 4 | 14 | ...
Direct                   | Lead prep area | 45 | 59 | ...
                         | DAF 10.268 | 0 | 0 | ...
```

## Tests recommandés

### Test 1: Import Cofatec
1. Aller sur `/hr/cofatec`
2. Importer le fichier Excel Cofatec
3. Vérifier que la structure affichée correspond à l'image 1
4. Sauvegarder
5. Recharger la page
6. Vérifier que la structure est conservée

### Test 2: Import Brasil
1. Aller sur `/hr/brazil`
2. Importer le fichier Excel Brasil
3. Vérifier que la structure affichée correspond à l'image 2
4. Sauvegarder
5. Recharger la page
6. Vérifier que la structure est conservée

### Test 3: Changement de site
1. Aller sur `/hr/cofatec` (avec données)
2. Aller sur `/hr/brazil` (avec données)
3. Vérifier que les structures sont différentes et correctes
4. Retourner sur `/hr/cofatec`
5. Vérifier que la structure Cofatec est affichée

### Test 4: Site sans données
1. Aller sur `/hr/mateur` (sans données)
2. Vérifier le message "Aucune donnée HR disponible"
3. Importer un fichier Excel
4. Vérifier l'affichage
5. Sauvegarder et recharger

## Notes importantes

### 🔴 Limitations actuelles
- Les fichiers Excel doivent avoir les années 2025, 2026, 2027
- Les périodes doivent être au format "MO XX" ou "Q XX"
- Les données doivent commencer à la colonne C (index 2)

### 🟡 Points d'attention
- La première ligne avec une catégorie doit avoir les deux colonnes remplies
- Les lignes suivantes de la même catégorie peuvent avoir seulement la colonne B
- Les lignes spéciales (S-Total, Total Plant) ont la même valeur dans les deux colonnes

### 🟢 Améliorations possibles
- Support de plus d'années (2028, 2029, etc.)
- Support de formats de périodes personnalisés
- Validation plus stricte des fichiers Excel
- Export Excel avec la structure actuelle
- Copie de structure entre sites

## Résumé

Le module HR est maintenant **complètement dynamique** et peut gérer n'importe quelle structure de tableau définie dans un fichier Excel. Chaque site peut avoir sa propre structure unique, et le système s'adapte automatiquement pour afficher et sauvegarder les données correctement.

Cette approche élimine le besoin de coder en dur les structures de tableau et permet une grande flexibilité pour les utilisateurs métier.
