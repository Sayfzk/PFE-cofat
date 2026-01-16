# 🚀 Exécution de la Migration Space - GUIDE RAPIDE

## ⚠️ Problème Actuel

Erreur lors de la sauvegarde Space car les colonnes `category` et `rowOrder` n'existent pas encore dans la table Spaces.

## ✅ Solution en 2 Étapes

### Étape 1: Exécuter la Migration

**Dans un terminal PowerShell ou CMD:**

```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend
node migrate-space.js
```

**Résultat attendu:**
```
🔄 Migration Space - Ajout de category et rowOrder...
✅ Colonne category ajoutée
✅ Colonne rowOrder ajoutée
✅ Index space_site_order_index créé
✅ Valeurs rowOrder initialisées
✅ Migration Space terminée avec succès!
🔄 Redémarrez le backend: npm start
```

### Étape 2: Redémarrer le Backend

**Dans le terminal du backend:**

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis redémarrer
npm start
```

OU

```bash
node main.js
```

## 🎯 Tester

1. Aller sur `http://localhost:3000/space/brazil`
2. Importer `D:\OneDrive - Cofat\Documents\SpaceBresil.xlsx`
3. Cliquer sur "SAVE"
4. ✅ Plus d'erreur!

## 🆘 Si la Migration Échoue

**Alternative - Script SQL Direct:**

Ouvrez SQL Server Management Studio et exécutez:

```sql
USE [capacity_study]; -- Remplacer par votre nom de base
GO

-- Ajouter category
ALTER TABLE Spaces ADD category NVARCHAR(50) NULL;
GO

-- Ajouter rowOrder
ALTER TABLE Spaces ADD rowOrder INT NULL DEFAULT 0;
GO

-- Créer l'index
CREATE INDEX space_site_order_index ON Spaces (siteId, rowOrder);
GO

-- Initialiser les valeurs
UPDATE Spaces SET rowOrder = 0 WHERE rowOrder IS NULL;
GO

PRINT '✅ Migration terminée!';
```

## 📝 Vérification

Pour vérifier que les colonnes ont été ajoutées:

```sql
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Spaces' 
AND COLUMN_NAME IN ('category', 'rowOrder');
```

**Résultat attendu:**
```
COLUMN_NAME | DATA_TYPE
------------|----------
category    | nvarchar
rowOrder    | int
```

---

**Note:** Cette migration doit être exécutée **une seule fois**. Après, le module Space fonctionnera avec la structure dynamique.
