# Installation de la Correction HR rowOrder

## ⚠️ Problème Actuel

Vous voyez cette erreur:
```
Invalid column name 'rowOrder'
```

Cela signifie que la colonne `rowOrder` n'existe pas encore dans la table HR de votre base de données.

## 🔧 Solution: 3 Méthodes

### Méthode 1: Script Node.js (Recommandé)

1. **Arrêter le serveur backend** (Ctrl+C dans le terminal du backend)

2. **Ouvrir un nouveau terminal** dans le dossier backend:
   ```
   cd d:\NVCapacity\Cofat_Capacity_Study-backend
   ```

3. **Exécuter le script**:
   ```
   node add-rowOrder-simple.js
   ```

4. **Vérifier le résultat**:
   - Si vous voyez "✅ Migration terminée avec succès!" → Parfait!
   - Si vous voyez "⚠️ La colonne rowOrder existe déjà" → C'est bon aussi!

5. **Redémarrer le serveur backend**:
   ```
   node server.js
   ```

### Méthode 2: Script SQL (Alternative)

Si la Méthode 1 ne fonctionne pas:

1. **Ouvrir SQL Server Management Studio**

2. **Se connecter à votre serveur** (SER-GPAO)

3. **Ouvrir le fichier**: `d:\NVCapacity\Cofat_Capacity_Study-backend\add-rowOrder-column.sql`

4. **Modifier la première ligne** avec le nom de votre base de données:
   ```sql
   USE [capacity_study]; -- Remplacer par votre nom de base
   ```

5. **Exécuter le script** (F5)

6. **Vérifier les messages**:
   - "✅ Colonne rowOrder ajoutée avec succès"
   - "✅ Index hr_site_order_index créé avec succès"
   - "✅ Migration terminée avec succès!"

7. **Redémarrer le serveur backend**

### Méthode 3: Commande SQL Manuelle

Si vous préférez exécuter les commandes SQL une par une:

```sql
-- 1. Ajouter la colonne
ALTER TABLE [HR] ADD [rowOrder] INT NULL DEFAULT 0;

-- 2. Créer l'index
CREATE INDEX [hr_site_order_index] ON [HR] ([siteId], [rowOrder]);

-- 3. Mettre à jour les valeurs NULL
UPDATE [HR] SET [rowOrder] = 0 WHERE [rowOrder] IS NULL;
```

## ✅ Vérification

Après avoir exécuté la migration:

1. **Redémarrer le backend** (obligatoire!)

2. **Aller sur le module HR**:
   ```
   http://localhost:3000/hr/cofatec
   ```

3. **Vérifier qu'il n'y a plus d'erreur** dans la console

4. **Importer un fichier Excel**

5. **Cliquer sur Save**

6. **Cliquer sur Refresh**

7. ✅ **L'ordre des lignes doit être préservé**

## 🔍 Diagnostic

### Comment vérifier si la colonne existe?

Exécuter cette requête SQL:

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'HR' AND COLUMN_NAME = 'rowOrder';
```

**Résultat attendu**:
```
COLUMN_NAME | DATA_TYPE | IS_NULLABLE
------------|-----------|------------
rowOrder    | int       | YES
```

Si la requête ne retourne rien → La colonne n'existe pas → Exécuter la migration

### Comment vérifier si l'index existe?

```sql
SELECT name, type_desc
FROM sys.indexes
WHERE object_id = OBJECT_ID('HR') AND name = 'hr_site_order_index';
```

**Résultat attendu**:
```
name                   | type_desc
-----------------------|----------
hr_site_order_index    | NONCLUSTERED
```

## 🆘 Problèmes Courants

### Erreur: "Column already exists"
✅ **C'est bon!** La colonne existe déjà. Passez à l'étape suivante (redémarrer le backend).

### Erreur: "Permission denied"
❌ Vous n'avez pas les droits pour modifier la table.
→ Demander à l'administrateur de la base de données d'exécuter le script SQL.

### Erreur: "Cannot find module './db'"
❌ Vous n'êtes pas dans le bon dossier.
→ Assurez-vous d'être dans `d:\NVCapacity\Cofat_Capacity_Study-backend`

### L'erreur persiste après la migration
❌ Le backend n'a pas été redémarré.
→ **Arrêter complètement le backend** (Ctrl+C) puis le **redémarrer**.

## 📋 Checklist Complète

- [ ] Arrêter le serveur backend
- [ ] Exécuter la migration (Méthode 1, 2 ou 3)
- [ ] Vérifier le message de succès
- [ ] Redémarrer le serveur backend
- [ ] Tester le module HR
- [ ] Importer un fichier Excel
- [ ] Sauvegarder
- [ ] Recharger
- [ ] Vérifier que l'ordre est préservé

## 🎯 Résultat Attendu

Après la migration réussie:

**Avant**:
```
Import Excel → Save → Refresh → ❌ Ordre différent
```

**Après**:
```
Import Excel → Save → Refresh → ✅ Même ordre préservé
```

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifier les logs du backend pour voir l'erreur exacte
2. Vérifier que la colonne existe avec la requête SQL de diagnostic
3. S'assurer que le backend a bien été redémarré
4. Vérifier que vous utilisez la dernière version du code

---

**Important**: Cette migration doit être exécutée **une seule fois**. Une fois la colonne ajoutée, elle restera dans la base de données de façon permanente.
