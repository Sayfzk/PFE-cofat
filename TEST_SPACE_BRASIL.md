# 🧪 Test du Module Space Brasil

## ✅ Migration Terminée

La migration a réussi! Les colonnes `category` et `rowOrder` ont été ajoutées à la table Spaces.

## 🚀 Étapes de Test

### 1. Redémarrer le Backend

**Dans le terminal du backend:**
```bash
# Arrêter le serveur actuel (Ctrl+C)
npm start
```

### 2. Ouvrir la Console du Navigateur

1. Ouvrir Chrome/Edge
2. Appuyer sur **F12**
3. Aller dans l'onglet **Console**

### 3. Aller sur le Module Space Brasil

```
http://localhost:3000/space/brazil
```

### 4. Importer le Fichier Excel

1. Cliquer sur **"Import Excel"**
2. Sélectionner: `D:\OneDrive - Cofat\Documents\SpaceBresil.xlsx`
3. **Observer les logs dans la console**

### 5. Vérifier les Logs

Vous devriez voir dans la console:

```
💾 Excel Space data loaded - Total rows: X
📊 Non-empty rows: Y
📅 Year header row found at index: 2
📆 Period header row found at index: 3
📆 Period header row data: [vide, vide, "MO 01", "MO 02", ...]

🔍 Extraction dynamique des lignes Space à partir de la ligne: 4
✅ Ligne extraite: [SPACE] Cutting area - X valeurs non-zéro
✅ Ligne extraite: [SPACE] Lead prep - X valeurs non-zéro
✅ Ligne extraite: [OTHERS (WAREHOUSE, OFFICE + GOODS AISLE, ETC.)] OTHERS (WAREHOUSE, OFFICE + GOODS AISLE, ETC.) - X valeurs
✅ Ligne extraite: [Assembly] DAF 10.259 - X valeurs non-zéro
✅ Ligne extraite: [Assembly] Scania Fratic - X valeurs non-zéro
... (toutes les lignes Assembly)
✅ Ligne extraite: [S-Total Assembly] S-Total Assembly - X valeurs
✅ Ligne extraite: [SUMMARY] TOTAL AREA needed - X valeurs
✅ Ligne extraite: [SUMMARY] Total Area - X valeurs
✅ Ligne extraite: [SUMMARY] Occupation - X valeurs
✅ Ligne extraite: [SUMMARY] Available space - X valeurs

📊 Données Space finales extraites: 17 lignes
📊 Structure: [liste des lignes]
```

### 6. Vérifier le Tableau

Le tableau doit afficher:

**Catégories attendues:**
- ✅ **SPACE**: Cutting area, Lead prep
- ✅ **OTHERS (WAREHOUSE, OFFICE + GOODS AISLE, ETC.)**: 1 ligne
- ✅ **Assembly**: DAF 10.259, Scania Fratic, Scania GW / GZ, Battery cable, Scania PWR, Ryelagh (Mahle Centro e Valves), Scania components, Scania Bumper, Scania doors, Scania H*
- ✅ **S-Total Assembly**: 1 ligne
- ✅ **SUMMARY**: TOTAL AREA needed, Total Area, Occupation, Available space

**Périodes attendues:**
- ✅ **2025**: MO 01 à MO 12 (12 colonnes)
- ✅ **2026**: Q 01 à Q 04 (4 colonnes)
- ✅ **2027**: Q 01 à Q 04 (4 colonnes)

**Total: 20 colonnes**

### 7. Sauvegarder

1. Cliquer sur **"SAVE"**
2. **Observer les logs dans la console**

Vous devriez voir:
```
💾 Space - Sauvegarde de 340 entrées pour le site BRA
  (17 lignes × 20 périodes = 340 entrées)
🔍 Space - Aperçu des données à sauvegarder: [...]
```

### 8. Recharger

1. Cliquer sur **"REFRESH"** ou recharger la page (F5)
2. **Vérifier que la structure est préservée**

Vous devriez voir:
```
📊 Space LoadData appelé pour le site: BRA
🌐 Space Appel API: http://172.20.79.39:3005/api/space/site/BRA
✅ Données Space trouvées pour BRA: 340 entrées
📊 Structure Space extraite de la base:
  - lignes: 17
  - années: [2025, 2026, 2027]
  - périodes: {2025: [...], 2026: [...], 2027: [...]}
  - totalColonnes: 20
✅ Space - Données chargées: 17 lignes
```

## 🔍 Problèmes Possibles

### Problème 1: "Le fichier Excel est vide"

**Vérifier dans la console:**
- Les logs montrent combien de lignes ont été lues?
- Les années sont-elles détectées?

**Solution:**
- Vérifier que le fichier Excel a bien les années 2025, 2026, 2027 dans une ligne
- Vérifier que les périodes (MO 01, Q 01, etc.) sont dans la ligne suivante

### Problème 2: "Erreur lors de la sauvegarde"

**Vérifier dans la console backend:**
- Y a-t-il une erreur SQL?
- Les colonnes `category` et `rowOrder` existent-elles?

**Solution:**
- Vérifier que la migration a bien été exécutée
- Redémarrer le backend

### Problème 3: "L'ordre n'est pas préservé"

**Vérifier:**
- Le champ `rowOrder` est-il bien envoyé lors de la sauvegarde?
- Le tri par `rowOrder` est-il appliqué lors du chargement?

**Solution:**
- Vérifier les logs de sauvegarde
- Vérifier les logs de chargement

## 📊 Structure Attendue du Fichier Excel

```
Ligne 1: [Titre ou vide]
Ligne 2: SPACE | Project | 2025 | 2025 | ... | 2026 | ... | 2027 | ...
Ligne 3: [vide] | [vide] | MO 01 | MO 02 | ... | Q 01 | ... | Q 01 | ...
Ligne 4: SPACE | Cutting area | 416 | 416 | ...
Ligne 5: [vide] | Lead prep | 259 | 259 | ...
Ligne 6: OTHERS (...) | [vide] | 2976 | 2976 | ...
Ligne 7: Assembly | DAF 10.259 | 309 | 309 | ...
...
```

## ✅ Résultat Attendu

Après l'import et la sauvegarde:
- ✅ Le tableau affiche exactement la même structure que le fichier Excel
- ✅ Les catégories sont correctes
- ✅ Les valeurs sont correctes (y compris les pourcentages)
- ✅ L'ordre des lignes est préservé
- ✅ Après rechargement, la structure est identique

---

**Si vous rencontrez un problème, copiez les logs de la console et envoyez-les moi!**
