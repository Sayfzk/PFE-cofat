# 🧪 Test du Module HR - Checklist

## ✅ **Modifications Apportées**

### **1. Frontend HR**
- ✅ Nouveau `ExcelImporterHR.js` spécialisé pour les lignes HR
- ✅ `HrTable.js` modifié pour utiliser ExcelImporterHR  
- ✅ Logique d'import simplifiée et adaptée à HR
- ✅ Logique de reconstruction améliorée avec debug

### **2. Backend HR**
- ✅ `hrRoutes.js` simplifié pour traiter toutes les lignes uniformément
- ✅ Gestion des catégories par défaut

### **3. Structure du Tableau**
- ✅ 11 lignes HR selon votre image :
  - Direct: Cutting area, Lead prep area
  - Assembly Direct: project1, project2  
  - S-Total production (ligne spéciale)
  - Indirect: Production, Eng, Quality, Maintenance
  - S-Total (ligne spéciale)
  - Total Plant (ligne spéciale)

## 🚀 **Instructions de Test**

### **1. Démarrer les Serveurs**
```bash
# Terminal 1 - Backend
cd D:\NVCapacity\Cofat_Capacity_Study-backend
npm start

# Terminal 2 - Frontend  
cd D:\NVCapacity\Cofat_Capacity_front
npm start
```

### **2. Tester le Module HR**
1. **Accéder au module** : `http://localhost:4000/hr/mateur`
2. **Vérifier l'affichage** : Le tableau doit apparaître avec 11 lignes et structure selon votre image
3. **Import Excel** :
   - Cliquer sur "Import Excel"
   - Sélectionner un fichier Excel HR avec les lignes appropriées
   - ✅ **EXPECTED** : Message de succès + données visibles dans le tableau
4. **Save** :
   - Cliquer sur "Save" 
   - ✅ **EXPECTED** : Message de succès de sauvegarde
5. **Rechargement** :
   - Cliquer sur "Recharger"
   - ✅ **EXPECTED** : Données rechargées depuis la base et visibles

### **3. Debug Console**
Ouvrir la console développeur (F12) pour voir les logs détaillés :
- 📊 Logs d'import ExcelImporterHR
- 🔄 Logs de reconstruction des données  
- ✅ Messages de succès de mapping

### **4. Vérifier les Autres Modules**
- **Space** : `http://localhost:4000/space/mateur`
- **Equipment** : `http://localhost:4000/equipment/mateur` 
- **Standard Equipment** : `http://localhost:4000/standard-equipment`

## 🔧 **Format Excel Attendu**

Le fichier Excel HR doit avoir cette structure :

| manufacturing range plant | Project | 2025 (MO 01-12) | 2026 (Q 01-04) | 2027 (Q 01-04) |
|---------------------------|---------|------------------|------------------|------------------|
| Direct | Cutting area | données... | données... | données... |
| | Lead prep area | données... | données... | données... |
| Assembly Direct | project1 | données... | données... | données... |
| | project2 | données... | données... | données... |
| | S-Total production | données... | données... | données... |
| Indirect | Production | données... | données... | données... |
| | Eng | données... | données... | données... |
| | Quality | données... | données... | données... |
| | Maintenance | données... | données... | données... |
| | S-Total | données... | données... | données... |
| | Total Plant | données... | données... | données... |

## 🐛 **Troubleshooting**

### **Si l'import ne fonctionne pas** :
1. Vérifier la console pour les logs ExcelImporterHR
2. S'assurer que les noms de lignes dans Excel correspondent exactement
3. Vérifier que les années 2025, 2026, 2027 sont présentes dans l'Excel

### **Si les données ne s'affichent pas** :
1. Vérifier les logs de handleDataImported dans la console
2. Vérifier que mappedCount > 0
3. Vérifier que setData est bien appelé

### **Si le rechargement ne fonctionne pas** :
1. Vérifier les logs de loadData dans la console
2. Vérifier que l'API /api/hr/site/{siteCode} retourne bien des données
3. Vérifier les logs de reconstruction

## ✅ **Résultat Attendu**

Le module HR doit maintenant fonctionner **exactement comme Space** :
- ✅ **Import Excel** → Données visibles immédiatement
- ✅ **Save** → Sauvegarde en base + rechargement auto
- ✅ **Recharger** → Reconstruction depuis base
- ✅ **Structure** → 11 lignes selon votre image
- ✅ **Logique** → Toutes les lignes uploadables, pas de calculs automatiques