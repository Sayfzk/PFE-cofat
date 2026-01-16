# 🚨 CORRECTION RAPIDE - Erreur HR rowOrder

## ❌ Erreur Actuelle

```
Invalid column name 'rowOrder'
```

## ✅ Solution en 3 Étapes

### Étape 1: Arrêter le Backend
Dans le terminal du backend, appuyer sur **Ctrl+C**

### Étape 2: Exécuter la Migration

**Option A - Terminal PowerShell/CMD:**
```cmd
cd d:\NVCapacity\Cofat_Capacity_Study-backend
node add-rowOrder-simple.js
```

**Option B - SQL Server Management Studio:**
1. Ouvrir le fichier: `add-rowOrder-column.sql`
2. Modifier la ligne 4 avec votre nom de base de données
3. Exécuter (F5)

### Étape 3: Redémarrer le Backend
```cmd
node server.js
```

## 🎉 C'est Tout!

Maintenant vous pouvez:
1. Aller sur `/hr/cofatec`
2. Importer votre fichier Excel
3. Cliquer sur Save
4. Recharger la page
5. ✅ L'ordre des lignes sera préservé!

---

## 📝 Détails Techniques

La colonne `rowOrder` permet de sauvegarder la position de chaque ligne dans le tableau, garantissant que l'ordre du fichier Excel est toujours respecté après rechargement.

**Structure ajoutée:**
- Colonne: `rowOrder` (INT, NULL, DEFAULT 0)
- Index: `hr_site_order_index` sur (siteId, rowOrder)

---

## ⚠️ Important

- Cette migration doit être faite **une seule fois**
- Le backend **doit être redémarré** après la migration
- Si vous voyez "Column already exists", c'est normal - passez à l'étape suivante

---

## 🆘 Besoin d'Aide?

Consultez le fichier `INSTALLATION_HR_ROWORDER.md` pour plus de détails et solutions aux problèmes courants.
