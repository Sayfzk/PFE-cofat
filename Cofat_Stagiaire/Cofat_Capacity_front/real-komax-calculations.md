# CALCULS MATHÉMATIQUES DÉTAILLÉS - KOMAX ALPHA 300
## Basé sur les données réelles de votre image

---

## 📊 DONNÉES RÉELLES PAR SITE (d'après votre image)

### **SITE 1 : TUNIS**

#### **2025 (12 mois complets) :**
| Mois | Machine Need | Available | To Order | Calcul |
|------|-------------|-----------|----------|---------|
| MO01 (Jan) | 18 | 18 | 0 | Need=18, Avail=18, Order=0 |
| MO02 (Fév) | 20 | 18 | 2 | Need=20, Avail=18, Order=2 |
| MO03 (Mar) | 17 | 18 | 5 | Need=17, Avail=18, Order=5 |
| MO04 (Avr) | 17 | 18 | 0 | Need=17, Avail=18, Order=0 |
| MO05 (Mai) | 20 | 20 | 0 | Need=20, Avail=20, Order=0 |
| MO06 (Jui) | 20 | 20 | 0 | Need=20, Avail=20, Order=0 |
| MO07 (Jul) | 20 | 20 | 0 | Need=20, Avail=20, Order=0 |
| MO08 (Aoû) | 20 | 20 | 0 | Need=20, Avail=20, Order=0 |
| MO09 (Sep) | 20 | 20 | 0 | Need=20, Avail=20, Order=0 |
| MO10 (Oct) | 20 | 20 | 0 | Need=20, Avail=20, Order=0 |
| MO11 (Nov) | 22 | 22 | 0 | Need=22, Avail=22, Order=0 |
| MO12 (Déc) | 22 | 22 | 0 | Need=22, Avail=22, Order=0 |

#### **CALCUL TOTAL TUNIS 2025 :**
```
Total_Need_Tunis_2025 = 18 + 20 + 17 + 17 + 20 + 20 + 20 + 20 + 20 + 20 + 22 + 22
Total_Need_Tunis_2025 = 236 machines

Total_Available_Tunis_2025 = 18 + 18 + 18 + 18 + 20 + 20 + 20 + 20 + 20 + 20 + 22 + 22
Total_Available_Tunis_2025 = 236 machines

Total_ToOrder_Tunis_2025 = 0 + 2 + 5 + 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0
Total_ToOrder_Tunis_2025 = 7 machines
```

#### **2026 (4 trimestres) :**
| Trimestre | Machine Need | Available | To Order | Calcul |
|-----------|-------------|-----------|----------|---------|
| Q1 2026 | 22 | 22 | 0 | Need=22, Avail=22, Order=0 |
| Q2 2026 | 22 | 22 | 0 | Need=22, Avail=22, Order=0 |
| Q3 2026 | 22 | 22 | 0 | Need=22, Avail=22, Order=0 |
| Q4 2026 | 22 | 22 | 0 | Need=22, Avail=22, Order=0 |

#### **CALCUL TOTAL TUNIS 2026 :**
```
Total_Need_Tunis_2026 = 22 + 22 + 22 + 22 = 88 machines
Total_Available_Tunis_2026 = 22 + 22 + 22 + 22 = 88 machines  
Total_ToOrder_Tunis_2026 = 0 + 0 + 0 + 0 = 0 machines
```

#### **2027 (4 trimestres) :**
```
Total_Need_Tunis_2027 = 22 + 22 + 22 + 22 = 88 machines
Total_Available_Tunis_2027 = 22 + 22 + 22 + 22 = 88 machines
Total_ToOrder_Tunis_2027 = 0 + 0 + 0 + 0 = 0 machines
```

#### **TOTAL GÉNÉRAL TUNIS (2025+2026+2027) :**
```
Total_Need_Tunis = 236 + 88 + 88 = 412 machines
Total_Available_Tunis = 236 + 88 + 88 = 412 machines
Total_ToOrder_Tunis = 7 + 0 + 0 = 7 machines
```

---

### **SITE 2 : MATEUR** (mêmes données que Tunis)
```
Total_Need_Mateur = 412 machines
Total_Available_Mateur = 412 machines  
Total_ToOrder_Mateur = 7 machines
```

### **SITE 3 : KAIROUAN** (mêmes données que Tunis)
```
Total_Need_Kairouan = 412 machines
Total_Available_Kairouan = 412 machines
Total_ToOrder_Kairouan = 7 machines
```

---

## 🎯 CALCULS FINAUX POUR KOMAX ALPHA 300

### **1. TOTAUX GÉNÉRAUX :**
```
Total_Need_Equipment = Total_Need_Tunis + Total_Need_Mateur + Total_Need_Kairouan
Total_Need_Equipment = 412 + 412 + 412 = 1,236 machines

Total_Available_Equipment = Total_Available_Tunis + Total_Available_Mateur + Total_Available_Kairouan  
Total_Available_Equipment = 412 + 412 + 412 = 1,236 machines

Total_ToOrder_Equipment = Total_ToOrder_Tunis + Total_ToOrder_Mateur + Total_ToOrder_Kairouan
Total_ToOrder_Equipment = 7 + 7 + 7 = 21 machines
```

### **2. TAUX D'UTILISATION :**
```
Taux_Utilisation = (Total_Available_Equipment / Total_Need_Equipment) × 100
Taux_Utilisation = (1,236 / 1,236) × 100 = 100%
```

### **3. CONTRIBUTION AU DASHBOARD GLOBAL :**

Si le dashboard montre **2,200 machines** au total, alors Komax Alpha 300 représente :
```
Pourcentage_Komax = (1,236 / 2,200) × 100 = 56.18%
```

---

## 📈 DONNÉES POUR LES GRAPHIQUES DU DASHBOARD

### **Distribution des équipements (Graphique en barres) :**
```
Komax Alpha 300: {
  label: "Komax alpha 300",
  value: 1,236,        // Besoin total
  available: 1,236,    // Disponible  
  to_order: 21,        // À commander
  sites: 3             // Nombre de sites
}
```

### **Répartition par sites (Graphique circulaire) :**
```
Tunis: {
  label: "Tunis",
  need: 412,
  available: 412, 
  to_order: 7,
  equipment_types: 1
}

Mateur: {
  label: "Mateur", 
  need: 412,
  available: 412,
  to_order: 7, 
  equipment_types: 1
}

Kairouan: {
  label: "Kairouan",
  need: 412,
  available: 412,
  to_order: 7,
  equipment_types: 1
}
```

### **Évolution temporelle (Graphique linéaire) :**

**Exemple pour les 3 premiers mois de 2025 :**
```
2025-01: {
  period: "2025-01",
  total_need: 18 × 3 = 54,      // 3 sites × 18 machines
  total_available: 18 × 3 = 54,  // 3 sites × 18 machines  
  total_to_order: 0 × 3 = 0      // 3 sites × 0 machines
}

2025-02: {
  period: "2025-02", 
  total_need: 20 × 3 = 60,       // 3 sites × 20 machines
  total_available: 18 × 3 = 54,   // 3 sites × 18 machines
  total_to_order: 2 × 3 = 6       // 3 sites × 2 machines  
}

2025-03: {
  period: "2025-03",
  total_need: 17 × 3 = 51,       // 3 sites × 17 machines
  total_available: 18 × 3 = 54,   // 3 sites × 18 machines
  total_to_order: 5 × 3 = 15      // 3 sites × 5 machines
}
```

---

## 🔍 VÉRIFICATION DES CALCULS

### **Méthode de vérification :**
1. **Somme mensuelle** : Addition de tous les mois pour chaque métrique
2. **Somme par site** : Multiplication par le nombre de sites (3)  
3. **Validation** : Vérification que Available + ToOrder ≥ Need

### **Exemple de vérification pour février 2025 :**
```
Machine_Need = 20 (par site) × 3 sites = 60 total
Available_Machine = 18 (par site) × 3 sites = 54 total  
To_Order = 2 (par site) × 3 sites = 6 total

Vérification: Available + ToOrder = 54 + 6 = 60 ≥ Need (60) ✅
```

---

## 📊 RÉSUMÉ DES ÉQUATIONS UTILISÉES

1. **Somme par période** : `Σ(valeur_site_i)` pour i = 1 à nombre_de_sites
2. **Somme par site** : `Σ(valeur_période_j)` pour j = 1 à nombre_de_périodes  
3. **Taux d'utilisation** : `(Available / Need) × 100`
4. **Pourcentage de contribution** : `(Valeur_équipement / Total_global) × 100`

Ces calculs sont exactement ceux utilisés dans le code backend du dashboard pour générer tous les graphiques et métriques.