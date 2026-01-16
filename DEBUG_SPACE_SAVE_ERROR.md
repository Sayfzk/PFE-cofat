# 🔍 Diagnostic de l'Erreur de Sauvegarde Space

## ❌ Erreur Actuelle

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Space Save error: Error: Space Save failed
```

## 🔍 Étapes de Diagnostic

### Étape 1: Vérifier les Logs Frontend

1. Ouvrir la console du navigateur (**F12**)
2. Aller sur `/space/brazil`
3. Importer le fichier Excel
4. Cliquer sur **"SAVE"**
5. **Copier TOUS les logs** qui commencent par:
   - 💾 Space - Sauvegarde de...
   - 🔍 Space - Aperçu des données...
   - ❌ Entrées invalides... (si présent)
   - ❌ Erreur serveur... (si présent)

### Étape 2: Vérifier les Logs Backend

Dans le terminal du backend, chercher:
```
💾 POST /api/space/save - Site: BRA, Entrées: X
✅ Sauvegarde pour le site: Brazil (ID: 4)
🔍 Aperçu des données à sauvegarder: [...]
```

**Si vous voyez une erreur SQL**, copiez-la complètement.

### Étape 3: Vérifications Communes

#### A. Vérifier que les données sont importées

Dans la console frontend, après l'import:
```
📊 Données Space finales extraites: 17 lignes
```

Si vous voyez `0 lignes`, le problème est dans l'import.

#### B. Vérifier la structure des données

Dans la console frontend, après avoir cliqué sur SAVE:
```
🔍 Space - Aperçu des données à sauvegarder:
  { type: 'Cutting area', category: 'SPACE', year: 2025, month: 'MO 01', area: 416, rowOrder: 0 }
```

**Vérifier:**
- ✅ `type` n'est pas vide
- ✅ `category` n'est pas vide
- ✅ `year` est un nombre (2025, 2026, 2027)
- ✅ `month` n'est pas vide (MO 01, Q 01, etc.)
- ✅ `area` est un nombre
- ✅ `rowOrder` est un nombre

#### C. Vérifier que le backend est démarré

Le backend doit afficher:
```
Server running on port 3005
Connection has been established successfully.
```

## 🔧 Solutions Possibles

### Solution 1: Données Invalides

**Si vous voyez:** `❌ Entrées invalides détectées`

**Cause:** Certaines lignes n'ont pas toutes les données requises

**Solution:**
1. Vérifier que le fichier Excel a bien toutes les colonnes
2. Réimporter le fichier Excel
3. Vérifier les logs d'import

### Solution 2: Erreur SQL - Colonne Manquante

**Si vous voyez:** `Invalid column name 'category'` ou `Invalid column name 'rowOrder'`

**Cause:** Les colonnes n'ont pas été ajoutées à la table Spaces

**Solution:**
```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend
node migrate-space.js
```

### Solution 3: Erreur SQL - Type de Données

**Si vous voyez:** `Error converting data type` ou `Arithmetic overflow`

**Cause:** Les valeurs sont trop grandes ou du mauvais type

**Solution:** Vérifier que les valeurs `area` sont des nombres entiers

### Solution 4: Erreur d'Authentification

**Si vous voyez:** `401 Unauthorized` ou `403 Forbidden`

**Cause:** Token d'authentification manquant ou invalide

**Solution:**
1. Se déconnecter et se reconnecter
2. Vérifier que `getAuthHeaders()` retourne bien les headers

### Solution 5: Problème de CORS

**Si vous voyez:** `CORS error` ou `Access-Control-Allow-Origin`

**Cause:** Le backend n'accepte pas les requêtes du frontend

**Solution:** Vérifier la configuration CORS dans le backend

## 📋 Checklist de Vérification

- [ ] Le backend est démarré (`npm start`)
- [ ] Les migrations ont été exécutées (`node migrate-space.js`)
- [ ] Le fichier Excel a été importé avec succès
- [ ] Les données sont affichées dans le tableau
- [ ] La console frontend ne montre pas d'erreur d'import
- [ ] L'utilisateur est connecté
- [ ] Le site code est correct (BRA pour Brazil)

## 🆘 Si Rien ne Fonctionne

**Envoyez-moi:**

1. **Les logs de la console frontend** (tout ce qui est affiché après avoir cliqué sur SAVE)
2. **Les logs du terminal backend** (les 20 dernières lignes)
3. **Une capture d'écran** du tableau avant de cliquer sur SAVE

Avec ces informations, je pourrai identifier le problème exact.

## 🔍 Commandes de Diagnostic

### Vérifier la structure de la table Spaces

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Spaces'
ORDER BY ORDINAL_POSITION;
```

**Colonnes attendues:**
- id (int)
- siteId (int)
- type (nvarchar)
- category (nvarchar) ← **Doit exister**
- year (int)
- month (nvarchar)
- area (int)
- rowOrder (int) ← **Doit exister**
- createdAt (datetime)
- updatedAt (datetime)

### Vérifier les données existantes

```sql
SELECT TOP 5 * FROM Spaces WHERE siteId = 4 ORDER BY rowOrder;
```

Si cette requête retourne une erreur, c'est que la colonne `rowOrder` n'existe pas.

---

**Suivez ces étapes et envoyez-moi les logs pour que je puisse vous aider!**
