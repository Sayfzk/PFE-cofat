# 🌐 GUIDE - Correction du Sélecteur de Langue

## 🔍 **Problème Identifié**
Le sélecteur de langue ne fonctionne pas car les composants affichent les textes **en dur** au lieu d'utiliser la fonction de traduction `t()`.

## ✅ **Solution**

### **1. Dans SpaceTable.js**
```javascript
// ❌ AVANT (texte en dur)
<TableCell>{row.label}</TableCell>
<Button>SAVE</Button>
<Button>RECHARGER</Button>

// ✅ APRÈS (avec traductions)
<TableCell>{t(row.label)}</TableCell>
<Button>{t('SAVE')}</Button>
<Button>{t('RECHARGER')}</Button>
```

### **2. Dans CofatGroupSpace.js**
```javascript
// ❌ AVANT (texte en dur)
<Typography>🧮 CofatGroup - Consolidation Space</Typography>
<Button>Actualiser</Button>

// ✅ APRÈS (avec traductions)
<Typography>🧮 {t('CofatGroup')} - {t('Consolidation Space')}</Typography>
<Button>{t('Actualiser')}</Button>
```

### **3. Dans CofatGroupHr.js**
```javascript
// ❌ AVANT (texte en dur)
<Typography>👥 CofatGroup - Consolidation HR</Typography>

// ✅ APRÈS (avec traductions)
<Typography>👥 {t('CofatGroup')} - {t('Consolidation HR')}</Typography>
```

## 🎯 **Traductions Disponibles dans i18n.js**

### **Français (fr)**
```javascript
'SAVE': 'ENREGISTRER',
'RECHARGER': 'RECHARGER',
'SUPPRIMER': 'SUPPRIMER',
'Cutting area': 'Zone de Découpe',
'Lead prep': 'Préparation Fils',
'PROJECT 4': 'PROJET 4',
'S-Total Assembly': 'S-Total Assemblage',
'TOTAL AREA': 'SURFACE TOTALE',
'Available Area': 'Surface Disponible'
```

### **Anglais (en)**
```javascript
'SAVE': 'SAVE',
'RECHARGER': 'RELOAD',
'SUPPRIMER': 'DELETE',
'Cutting area': 'Cutting Area',
'Lead prep': 'Lead Prep',
'PROJECT 4': 'PROJECT 4',
'S-Total Assembly': 'S-Total Assembly',
'TOTAL AREA': 'TOTAL AREA',
'Available Area': 'Available Area'
```

## 🔧 **Corrections Nécessaires**

### **Étape 1 : SpaceTable.js**
Remplacer tous les textes en dur par `t('clé')` :
- Boutons : `SAVE`, `RECHARGER`, `SUPPRIMER`
- Labels du tableau : `row.label` → `t(row.label)`
- Titres et messages

### **Étape 2 : CofatGroupSpace.js et CofatGroupHr.js**
Remplacer les titres et boutons par des traductions.

### **Étape 3 : Ajouter les traductions manquantes**
Ajouter dans i18n.js :
```javascript
// Français
'CofatGroup': 'CofatGroup',
'Consolidation Space': 'Consolidation Espace',
'Consolidation HR': 'Consolidation RH',
'Actualiser': 'Actualiser',

// Anglais
'CofatGroup': 'CofatGroup',
'Consolidation Space': 'Space Consolidation',
'Consolidation HR': 'HR Consolidation',
'Actualiser': 'Refresh',
```

## 🧪 **Test**
1. Appliquer les corrections
2. Redémarrer le frontend
3. Cliquer sur le sélecteur de langue 🌐
4. Changer FR → EN → FR
5. Vérifier que TOUS les textes changent

## 🎯 **Résultat Attendu**
- **Français** : ENREGISTRER, RECHARGER, Zone de Découpe, PROJET 4
- **Anglais** : SAVE, RELOAD, Cutting Area, PROJECT 4

**Une fois ces corrections appliquées, le sélecteur de langue fonctionnera parfaitement ! 🌐**
