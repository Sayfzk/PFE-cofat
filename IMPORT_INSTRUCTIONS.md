# 📤 Instructions d'Import des Données Excel

## 🎯 Objectif
Importer les données du fichier **BdgetHR.xlsx** dans le module Non Industrial Budget.

---

## 📋 Étapes à Suivre

### 1. **Fermer le Fichier Excel**
⚠️ **IMPORTANT** : Fermez complètement le fichier Excel avant l'import !
```
D:\OneDrive - Cofat\Documents\BdgetHR.xlsx
```

### 2. **Ouvrir le Terminal Backend**
```bash
cd d:/NVCapacity/Cofat_Capacity_Study-backend
```

### 3. **Exécuter le Script d'Import**
```bash
node import-excel-budget.js
```

### 4. **Vérifier les Résultats**
Le script affichera :
- ✅ Nombre de lignes importées avec succès
- ❌ Nombre de lignes échouées (s'il y en a)
- 📊 Statistiques par département

---

## 📊 Format Excel Attendu

Votre fichier Excel doit avoir des **feuilles nommées par département** :

### Noms de Feuilles Acceptés
- `IT` ou `it`
- `HR` ou `hr`
- `QUALITY` ou `Quality` ou `quality`
- `BUILDING` ou `Building` ou `building`
- `LOGISTICS` ou `Logistics` ou `logistics`
- `MAINTENANCE` ou `Maintenance` ou `maintenance`
- `PRODUCTION` ou `Production` ou `production`

### Colonnes Attendues (dans chaque feuille)
| Colonne Excel | Alternatives | Requis |
|---------------|--------------|--------|
| **Equipment** | equipment, EQUIPMENT | ✅ Oui |
| **Qty** | qty, QTY, Quantity | ✅ Oui |
| **devis** | Devis, Currency, currency | ✅ Oui |
| **Unit Price** | unitPrice, Unit_Price | ✅ Oui |
| **Area** | area, AREA | ❌ Non |

---

## 🔍 Exemple de Données

**Feuille : IT**
```
| Area     | Equipment              | Qty | devis | Unit Price |
|----------|------------------------|-----|-------|------------|
| Software | Microsoft Office       | 10  | USD   | 299.99     |
| Hardware | Dell Laptop            | 5   | USD   | 1200.00    |
```

**Feuille : HR**
```
| Area        | Equipment           | Qty | devis | Unit Price |
|-------------|---------------------|-----|-------|------------|
| Recruitment | Job Board License   | 1   | USD   | 5000.00    |
| Training    | Online Course       | 20  | EUR   | 150.00     |
```

---

## ✅ Après l'Import

### 1. **Démarrer le Backend** (si pas déjà démarré)
```bash
npm start
```

### 2. **Démarrer le Frontend**
```bash
cd d:/NVCapacity/Cofat_Capacity_front
npm start
```

### 3. **Accéder au Module**
1. Ouvrir le navigateur : `http://localhost:4000`
2. Se connecter
3. Cliquer sur **"Non Industrial Budget"** (💰) dans la sidebar
4. Sélectionner un département (IT, HR, etc.)
5. **Le tableau s'affichera avec toutes les données importées !**

---

## 🎨 Ce Que Vous Verrez

### Onglets des Départements
```
[💻 IT] [👥 HR] [✓ QUALITY] [🏢 BUILDING] [📦 LOGISTICS] [🔧 MAINTENANCE] [⚙️ PRODUCTION]
```

### Tableau de Données
```
┌────┬────────────┬──────────┬─────────────────────┬─────┬──────────┬────────────┬─────────────┐
│ ☑  │ N°         │ Dept     │ Area                │ Qty │ Currency │ Unit Price │ Total Price │
├────┼────────────┼──────────┼─────────────────────┼─────┼──────────┼────────────┼─────────────┤
│ ☐  │ 1          │ IT       │ Software            │ 10  │ USD      │ 299.99     │ 2999.90     │
│ ☐  │ 2          │ IT       │ Hardware            │ 5   │ USD      │ 1200.00    │ 6000.00     │
└────┴────────────┴──────────┴─────────────────────┴─────┴──────────┴────────────┴─────────────┘
                                                                        Total: $8999.90
```

---

## 🐛 Dépannage

### Problème : "Cannot find module 'xlsx'"
**Solution :**
```bash
npm install xlsx
```

### Problème : "File not found"
**Solution :**
- Vérifier que le chemin est correct
- Vérifier que le fichier existe
- Mettre à jour `FILE_PATH` dans `import-excel-budget.js` si nécessaire

### Problème : "File is locked"
**Solution :**
- Fermer complètement Excel
- Vérifier qu'aucun autre programme n'utilise le fichier
- Redémarrer l'ordinateur si nécessaire

### Problème : "No data imported"
**Solution :**
- Vérifier les noms des feuilles Excel
- Vérifier les noms des colonnes
- Vérifier que les données ne sont pas vides
- Consulter les erreurs affichées par le script

### Problème : "Tableau vide après import"
**Solution :**
1. Vérifier que l'import a réussi (voir console du script)
2. Rafraîchir la page du navigateur (F5)
3. Vérifier la console du navigateur (F12) pour les erreurs
4. Vérifier que le backend est démarré
5. Tester l'API directement :
   ```bash
   curl http://localhost:3005/api/non-industrial-budget/department/IT
   ```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifier les logs** du script d'import
2. **Vérifier la console** du navigateur (F12)
3. **Vérifier les logs** du backend
4. **Tester l'API** avec curl ou Postman

---

## 🎉 Succès !

Une fois l'import terminé avec succès, vous pourrez :

- ✅ Voir toutes les données par département
- ✅ Modifier les données directement dans le tableau
- ✅ Ajouter de nouvelles lignes
- ✅ Supprimer des lignes
- ✅ Sauvegarder les modifications
- ✅ Voir les totaux calculés automatiquement

**Bon import ! 🚀**
