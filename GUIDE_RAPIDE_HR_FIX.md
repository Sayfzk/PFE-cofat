# Guide Rapide - Correction de l'Ordre des Lignes HR

## 🎯 Problème Résolu

Avant, après avoir importé un fichier Excel et sauvegardé, le rechargement affichait les lignes dans un ordre différent.

**Maintenant**: L'ordre des lignes est **toujours préservé** ! ✅

## 📋 Installation (À faire une seule fois)

### Étape 1: Exécuter la migration de la base de données

Ouvrir un terminal dans le dossier backend:

```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend
node run-hr-migration.js
```

Vous devriez voir:
```
🔄 Démarrage de la migration HR rowOrder...
✅ Migration: Champ rowOrder ajouté à la table HR
✅ Migration HR rowOrder terminée avec succès!
```

### Étape 2: Redémarrer le serveur backend

```bash
# Arrêter le serveur (Ctrl+C)
# Puis le redémarrer
node server.js
```

## ✅ Test de Vérification

### 1. Aller sur le module HR
```
http://localhost:3000/hr/cofatec
```

### 2. Importer un fichier Excel
- Cliquer sur "Import Excel"
- Sélectionner votre fichier Excel
- Vérifier que les lignes s'affichent dans le bon ordre

### 3. Sauvegarder
- Cliquer sur "SAVE"
- Attendre la confirmation

### 4. Recharger
- Cliquer sur "REFRESH" ou recharger la page (F5)
- ✅ **Vérifier que l'ordre est identique à l'import**

## 🔄 Pour les Données Existantes

Si vous avez déjà des données HR sauvegardées avant cette correction:

1. Aller sur le site concerné
2. Réimporter le fichier Excel
3. Cliquer sur "SAVE"
4. L'ordre sera maintenant préservé

## 📊 Exemple Visuel

### Fichier Excel:
```
1. Cutting area
2. Lead prep area
3. International E44
4. VW Tayron
5. Production
6. Quality
```

### Après Import et Rechargement:
```
✅ 1. Cutting area
✅ 2. Lead prep area
✅ 3. International E44
✅ 4. VW Tayron
✅ 5. Production
✅ 6. Quality
```

**L'ordre est identique !** 🎉

## ⚠️ Important

- La migration doit être exécutée **une seule fois**
- Si vous voyez une erreur "Column 'rowOrder' already exists", c'est normal - la migration a déjà été faite
- Après la migration, redémarrer le backend est **obligatoire**

## 🆘 En cas de problème

### Erreur "rowOrder is not defined"
→ La migration n'a pas été exécutée. Retourner à l'Étape 1.

### Les lignes sont toujours dans le mauvais ordre
→ Réimporter le fichier Excel et sauvegarder à nouveau.

### Le backend ne démarre pas
→ Vérifier les logs du backend pour voir l'erreur exacte.

## 📝 Résumé

1. ✅ Exécuter la migration: `node run-hr-migration.js`
2. ✅ Redémarrer le backend
3. ✅ Réimporter les fichiers Excel existants
4. ✅ Profiter de l'ordre préservé !

---

**C'est tout !** L'ordre des lignes sera maintenant toujours identique au fichier Excel importé. 🎯
