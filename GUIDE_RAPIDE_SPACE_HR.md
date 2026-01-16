# 🚀 Guide Rapide - Modules HR et Space Dynamiques

## ✅ Ce qui est prêt

- ✅ **Module HR**: Complet et fonctionnel
- ✅ **Module Space**: Complet et fonctionnel

Les deux modules fonctionnent maintenant de manière **identique** avec une structure dynamique.

## 📋 Installation (À faire une seule fois)

### Étape 1: Migrations

```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend

# Migration HR
node add-rowOrder-simple.js

# Migration Space
node add-rowOrder-space-simple.js
```

### Étape 2: Redémarrer le Backend

```bash
# Arrêter le serveur (Ctrl+C)
# Puis le redémarrer
node server.js
```

## 🎯 Utilisation

### Module HR

1. **Aller sur** `/hr/cofatec` ou `/hr/brazil`
2. **Cliquer** sur "Import Excel"
3. **Sélectionner** votre fichier Excel HR
4. **Vérifier** que la structure s'affiche correctement
5. **Cliquer** sur "SAVE"
6. **Cliquer** sur "REFRESH" ou recharger (F5)
7. ✅ **L'ordre est préservé!**

### Module Space

1. **Aller sur** `/space/cofatec` ou `/space/brazil`
2. **Cliquer** sur "Import Excel"
3. **Sélectionner** votre fichier Excel Space
4. **Vérifier** que la structure s'affiche correctement
5. **Cliquer** sur "SAVE"
6. **Cliquer** sur "REFRESH" ou recharger (F5)
7. ✅ **L'ordre est préservé!**

## 📊 Format des Fichiers Excel

### Structure Requise

```
Ligne 1 (ou X): [Catégorie] | [Label] | 2025 | 2025 | ... | 2026 | ... | 2027 | ...
Ligne 2 (ou X+1): [vide] | [vide] | MO 01 | MO 02 | ... | Q 01 | ... | Q 01 | ...
Ligne 3+: Direct | Cutting area | 4 | 14 | ... | 50 | ... | 60 | ...
```

### Points Importants

- ✅ Les années **2025, 2026, 2027** doivent être dans une ligne
- ✅ La ligne suivante doit contenir les périodes (MO 01-12, Q 01-04)
- ✅ Les données commencent à partir de la colonne C
- ✅ Les deux premières colonnes sont pour la catégorie et le label

## 🎨 Avantages

### 1. Flexibilité Totale
- Chaque site peut avoir sa propre structure
- Pas de limitation sur le nombre de lignes
- Pas de noms codés en dur

### 2. Ordre Préservé
- L'ordre du fichier Excel est toujours respecté
- Même après sauvegarde et rechargement
- Chaque ligne a un numéro d'ordre unique

### 3. Diagnostic Facile
- Logs détaillés dans la console (F12)
- Messages d'erreur explicites
- Affichage des données extraites

## 🔍 Diagnostic

### Ouvrir la Console du Navigateur

1. Appuyer sur **F12**
2. Aller dans l'onglet **Console**
3. Importer un fichier Excel
4. Voir les logs:

```
💾 Excel HR data loaded - Total rows: 25
📊 Non-empty rows: 18
📅 Year header row found at index: 2
📆 Period header row found at index: 3
✅ Ligne extraite: [Direct] Cutting area - 12 valeurs non-zéro
📊 Données HR finales extraites: 13 lignes
```

## ⚠️ Problèmes Courants

### "Le fichier Excel est vide"

**Causes possibles:**
- Le fichier a des lignes vides au début
- Les années ne sont pas dans le bon format
- Les données ne commencent pas à la colonne C

**Solution:**
1. Ouvrir la console (F12)
2. Voir les logs pour identifier le problème
3. Vérifier que les années 2025, 2026, 2027 sont présentes

### "Invalid column name 'rowOrder'"

**Cause:** La migration n'a pas été exécutée

**Solution:**
```bash
cd d:\NVCapacity\Cofat_Capacity_Study-backend
node add-rowOrder-simple.js  # Pour HR
node add-rowOrder-space-simple.js  # Pour Space
# Redémarrer le backend
```

### Les lignes ne sont pas dans le bon ordre

**Cause:** Données sauvegardées avant la migration

**Solution:**
1. Réimporter le fichier Excel
2. Cliquer sur "SAVE"
3. L'ordre sera maintenant préservé

## 📝 Exemples de Structures

### HR Cofatec
```
Direct
  - Cutting area
  - Lead prep area
  - International E44
Assembly Direct
  - VW Tayron
  - Scania
Indirect
  - Production
  - Quality
```

### HR Brasil (peut être différent)
```
Direct
  - Cutting area
  - Lead prep area
  - Warehouse
Assembly Direct
  - DAF
  - Components
Indirect
  - Production
  - Quality
  - Maintenance
```

### Space Cofatec
```
SPACE
  - Cutting area
  - Lead prep
Assembly
  - SCANIA
  - CLAAS
  - VW
S-Total Assembly
SUMMARY
  - TOTAL AREA
  - Occupation
  - Available Area
```

### Space Brasil (peut être différent)
```
SPACE
  - Cutting area
  - Lead prep
  - Warehouse
Assembly
  - DAF
  - Scania
  - Components
S-Total Assembly
SUMMARY
  - TOTAL AREA
  - Occupation
  - Available Area
```

## ✅ Checklist de Vérification

- [ ] Migrations exécutées (HR et Space)
- [ ] Backend redémarré
- [ ] Module HR testé avec import Excel
- [ ] Module HR: Ordre préservé après rechargement
- [ ] Module Space testé avec import Excel
- [ ] Module Space: Ordre préservé après rechargement
- [ ] Pas d'erreurs dans la console
- [ ] Structures différentes pour chaque site

## 🎉 Résultat

Après avoir suivi ce guide:

- ✅ **HR et Space** fonctionnent avec des structures dynamiques
- ✅ **Chaque site** peut avoir sa propre structure
- ✅ **L'ordre** est toujours préservé
- ✅ **Pas de code à modifier** pour ajouter un site

---

**Besoin d'aide?**
- Consulter `SPACE_IMPLEMENTATION_COMPLETE.md` pour plus de détails
- Consulter `INSTALLATION_HR_ROWORDER.md` pour le dépannage
- Vérifier les logs de la console (F12)
