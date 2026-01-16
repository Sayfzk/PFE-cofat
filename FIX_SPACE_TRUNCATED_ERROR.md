# 🔧 Correction de l'Erreur "String or binary data would be truncated"

## ❌ Erreur Actuelle

```
Failed to load resource: the server responded with a status of 500
❌ Erreur serveur: {"success":false,"error":"String or binary data would be truncated."}
Space Save error: Error: Space Save failed: 500
```

## 🔍 Cause du Problème

La colonne `category` dans la table `Spaces` est limitée à **50 caractères**, mais votre fichier Excel contient des catégories plus longues:

**Exemple:**
```
"OTHERS (WAREHOUSE, OFFICE + GOODS AISLE, ETC.)"
```
Cette chaîne fait **48 caractères**, mais avec les variations possibles, elle peut dépasser 50.

## ✅ Solution

Augmenter la taille de la colonne `category` de **50** à **150 caractères**.

## 🚀 Étapes de Correction

### Étape 1: Arrêter le Backend

Dans le terminal du backend, appuyer sur **Ctrl+C**

### Étape 2: Exécuter le Script de Correction

**Dans un terminal PowerShell/CMD:**

```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend
node fix-space-category-length.js
```

**Résultat attendu:**
```
🔄 Modification de la taille de la colonne category...
✅ Colonne category modifiée en NVARCHAR(150) avec succès!

🔄 Redémarrez le backend: npm start

✅ Vous pouvez maintenant sauvegarder des catégories longues comme:
   "OTHERS (WAREHOUSE, OFFICE + GOODS AISLE, ETC.)"
```

### Étape 3: Redémarrer le Backend

```bash
npm start
```

### Étape 4: Tester

1. Aller sur `http://localhost:3000/space/brazil`
2. Recharger la page (**F5**)
3. Importer le fichier Excel
4. Cliquer sur **"SAVE"**
5. ✅ La notification verte devrait apparaître: **"Données Space sauvegardées avec succès"**

## 🔍 Vérification

### Avant la Correction

```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Spaces' AND COLUMN_NAME = 'category';
```

**Résultat:**
```
category | nvarchar | 50  ← Trop petit!
```

### Après la Correction

```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Spaces' AND COLUMN_NAME = 'category';
```

**Résultat:**
```
category | nvarchar | 150  ← Suffisant!
```

## 📋 Longueurs des Catégories dans votre Excel

| Catégorie | Longueur |
|-----------|----------|
| SPACE | 5 ✅ |
| Assembly | 8 ✅ |
| OTHERS (WAREHOUSE, OFFICE + GOODS AISLE, ETC.) | 48 ⚠️ |
| S-Total Assembly | 16 ✅ |
| SUMMARY | 7 ✅ |

**Note:** Avec 150 caractères, toutes les catégories passent largement!

## ⚠️ Si le Script Échoue

**Exécutez ce SQL manuellement dans SQL Server Management Studio:**

```sql
USE [capacity_study]; -- Remplacer par votre nom de base
GO

ALTER TABLE Spaces ALTER COLUMN category NVARCHAR(150) NULL;
GO

PRINT '✅ Colonne category modifiée!';
```

## 🎯 Test de la Notification

Après la correction, testez les notifications:

### Test 1: Sauvegarde Réussie
1. Importer le fichier Excel
2. Cliquer sur **"SAVE"**
3. ✅ Notification verte en haut: **"Données Space sauvegardées avec succès"**

### Test 2: Rechargement
1. Cliquer sur **"REFRESH"**
2. ✅ Les données doivent être identiques

### Test 3: Fermeture Manuelle
1. Déclencher une notification
2. Cliquer sur le **X**
3. ✅ La notification se ferme

## 📊 Modifications Appliquées

| Fichier | Modification |
|---------|--------------|
| `Spaces.js` | `category: STRING(50)` → `STRING(150)` |
| Base de données | `category NVARCHAR(50)` → `NVARCHAR(150)` |

## ✅ Résultat Final

Après cette correction:
- ✅ Les catégories longues sont acceptées
- ✅ La sauvegarde fonctionne
- ✅ Les notifications s'affichent correctement
- ✅ Plus d'erreur "String or binary data would be truncated"

---

**Exécutez le script maintenant pour corriger l'erreur!**

```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend
node fix-space-category-length.js
```
