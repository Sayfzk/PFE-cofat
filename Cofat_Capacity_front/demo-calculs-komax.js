// ===================================================================
// DÉMONSTRATION DES CALCULS MATHÉMATIQUES - KOMAX ALPHA 300
// Calculs étape par étape avec les vraies données de votre image
// ===================================================================

console.log('🧮 DÉMONSTRATION DES CALCULS MATHÉMATIQUES');
console.log('==========================================');
console.log('Machine: Komax Alpha 300');
console.log('Sites: Tunis, Mateur, Kairouan (3 sites)');
console.log('Période: 2025 (12 mois) + 2026 (4 trimestres) + 2027 (4 trimestres)');
console.log('\n');

// ===================================================================
// DONNÉES RÉELLES EXTRAITES DE VOTRE IMAGE
// ===================================================================

// Données pour 2025 (12 mois complets) - même pour tous les sites
const data2025 = [
  { mois: 'MO01', machineNeed: 18, available: 18, toOrder: 0 },
  { mois: 'MO02', machineNeed: 20, available: 18, toOrder: 2 },
  { mois: 'MO03', machineNeed: 17, available: 18, toOrder: 5 },
  { mois: 'MO04', machineNeed: 17, available: 18, toOrder: 0 },
  { mois: 'MO05', machineNeed: 20, available: 20, toOrder: 0 },
  { mois: 'MO06', machineNeed: 20, available: 20, toOrder: 0 },
  { mois: 'MO07', machineNeed: 20, available: 20, toOrder: 0 },
  { mois: 'MO08', machineNeed: 20, available: 20, toOrder: 0 },
  { mois: 'MO09', machineNeed: 20, available: 20, toOrder: 0 },
  { mois: 'MO10', machineNeed: 20, available: 20, toOrder: 0 },
  { mois: 'MO11', machineNeed: 22, available: 22, toOrder: 0 },
  { mois: 'MO12', machineNeed: 22, available: 22, toOrder: 0 }
];

// Données pour 2026 et 2027 (4 trimestres chacune)
const data2026 = [
  { periode: 'Q1', machineNeed: 22, available: 22, toOrder: 0 },
  { periode: 'Q2', machineNeed: 22, available: 22, toOrder: 0 },
  { periode: 'Q3', machineNeed: 22, available: 22, toOrder: 0 },
  { periode: 'Q4', machineNeed: 22, available: 22, toOrder: 0 }
];

const data2027 = [
  { periode: 'Q1', machineNeed: 22, available: 22, toOrder: 0 },
  { periode: 'Q2', machineNeed: 22, available: 22, toOrder: 0 },
  { periode: 'Q3', machineNeed: 22, available: 22, toOrder: 0 },
  { periode: 'Q4', machineNeed: 22, available: 22, toOrder: 0 }
];

const sites = ['Tunis', 'Mateur', 'Kairouan'];

// ===================================================================
// ÉTAPE 1: CALCULS POUR UN SITE (TUNIS)
// ===================================================================

console.log('📊 ÉTAPE 1: CALCULS POUR LE SITE TUNIS');
console.log('=====================================');

// Calculs pour 2025 (12 mois)
console.log('\n🗓️  ANNÉE 2025 (12 mois):');
console.log('┌─────┬──────────────┬───────────┬──────────┬─────────┐');
console.log('│ Mois│ Machine Need │ Available │ To Order │ Équation│');
console.log('├─────┼──────────────┼───────────┼──────────┼─────────┤');

let total2025Need = 0;
let total2025Available = 0;
let total2025Order = 0;

data2025.forEach((entry, index) => {
  total2025Need += entry.machineNeed;
  total2025Available += entry.available;
  total2025Order += entry.toOrder;
  
  const equation = `${entry.machineNeed}+${entry.available}+${entry.toOrder}`;
  console.log(`│ ${entry.mois}│      ${entry.machineNeed.toString().padStart(2, ' ')}      │     ${entry.available.toString().padStart(2, ' ')}    │    ${entry.toOrder.toString().padStart(2, ' ')}    │ ${equation.padEnd(7, ' ')}│`);
});

console.log('└─────┴──────────────┴───────────┴──────────┴─────────┘');
console.log(`\n🧮 TOTAL 2025 (Tunis):`);
console.log(`   Machine Need = ${data2025.map(d => d.machineNeed).join(' + ')} = ${total2025Need}`);
console.log(`   Available    = ${data2025.map(d => d.available).join(' + ')} = ${total2025Available}`);
console.log(`   To Order     = ${data2025.map(d => d.toOrder).join(' + ')} = ${total2025Order}`);

// Calculs pour 2026 (4 trimestres)
console.log('\n🗓️  ANNÉE 2026 (4 trimestres):');
let total2026Need = 0;
let total2026Available = 0;
let total2026Order = 0;

data2026.forEach(entry => {
  total2026Need += entry.machineNeed;
  total2026Available += entry.available;
  total2026Order += entry.toOrder;
});

console.log(`   Machine Need = ${data2026.map(d => d.machineNeed).join(' + ')} = ${total2026Need}`);
console.log(`   Available    = ${data2026.map(d => d.available).join(' + ')} = ${total2026Available}`);
console.log(`   To Order     = ${data2026.map(d => d.toOrder).join(' + ')} = ${total2026Order}`);

// Calculs pour 2027 (4 trimestres)
console.log('\n🗓️  ANNÉE 2027 (4 trimestres):');
let total2027Need = 0;
let total2027Available = 0;
let total2027Order = 0;

data2027.forEach(entry => {
  total2027Need += entry.machineNeed;
  total2027Available += entry.available;
  total2027Order += entry.toOrder;
});

console.log(`   Machine Need = ${data2027.map(d => d.machineNeed).join(' + ')} = ${total2027Need}`);
console.log(`   Available    = ${data2027.map(d => d.available).join(' + ')} = ${total2027Available}`);
console.log(`   To Order     = ${data2027.map(d => d.toOrder).join(' + ')} = ${total2027Order}`);

// TOTAL GÉNÉRAL POUR TUNIS
const totalTunisNeed = total2025Need + total2026Need + total2027Need;
const totalTunisAvailable = total2025Available + total2026Available + total2027Available;
const totalTunisOrder = total2025Order + total2026Order + total2027Order;

console.log('\n🎯 TOTAL GÉNÉRAL TUNIS (2025+2026+2027):');
console.log(`   Machine Need = ${total2025Need} + ${total2026Need} + ${total2027Need} = ${totalTunisNeed} machines`);
console.log(`   Available    = ${total2025Available} + ${total2026Available} + ${total2027Available} = ${totalTunisAvailable} machines`);
console.log(`   To Order     = ${total2025Order} + ${total2026Order} + ${total2027Order} = ${totalTunisOrder} machines`);

// ===================================================================
// ÉTAPE 2: CALCULS POUR LES 3 SITES
// ===================================================================

console.log('\n\n📊 ÉTAPE 2: CALCULS POUR LES 3 SITES');
console.log('===================================');

console.log('\n🏭 Comme les données sont identiques pour chaque site:');
console.log(`   Tunis    : Need=${totalTunisNeed}, Available=${totalTunisAvailable}, Order=${totalTunisOrder}`);
console.log(`   Mateur   : Need=${totalTunisNeed}, Available=${totalTunisAvailable}, Order=${totalTunisOrder}`);
console.log(`   Kairouan : Need=${totalTunisNeed}, Available=${totalTunisAvailable}, Order=${totalTunisOrder}`);

// TOTAL POUR L'ÉQUIPEMENT KOMAX ALPHA 300
const equipmentTotalNeed = totalTunisNeed * 3;
const equipmentTotalAvailable = totalTunisAvailable * 3;
const equipmentTotalOrder = totalTunisOrder * 3;

console.log('\n🎯 TOTAL POUR KOMAX ALPHA 300 (3 sites):');
console.log(`   Machine Need = ${totalTunisNeed} × 3 = ${equipmentTotalNeed} machines`);
console.log(`   Available    = ${totalTunisAvailable} × 3 = ${equipmentTotalAvailable} machines`);
console.log(`   To Order     = ${totalTunisOrder} × 3 = ${equipmentTotalOrder} machines`);

// ===================================================================
// ÉTAPE 3: CALCUL DU TAUX D'UTILISATION
// ===================================================================

console.log('\n\n📊 ÉTAPE 3: TAUX D\'UTILISATION');
console.log('==============================');

const tauxUtilisation = (equipmentTotalAvailable / equipmentTotalNeed * 100).toFixed(2);

console.log('\n🧮 FORMULE:');
console.log('   Taux d\'utilisation = (Total Available / Total Need) × 100');
console.log(`   Taux d\'utilisation = (${equipmentTotalAvailable} / ${equipmentTotalNeed}) × 100`);
console.log(`   Taux d\'utilisation = ${tauxUtilisation}%`);

// ===================================================================
// ÉTAPE 4: DONNÉES MENSUELLES POUR GRAPHIQUE TEMPOREL
// ===================================================================

console.log('\n\n📊 ÉTAPE 4: DONNÉES MENSUELLES POUR GRAPHIQUES');
console.log('==============================================');

console.log('\n📈 Évolution mensuelle 2025 (pour les 3 sites):');
console.log('┌──────────┬────────────┬─────────────┬─────────────┐');
console.log('│ Période  │ Total Need │ Total Avail │ Total Order │');
console.log('├──────────┼────────────┼─────────────┼─────────────┤');

data2025.forEach(entry => {
  const monthlyNeed = entry.machineNeed * 3;
  const monthlyAvailable = entry.available * 3;
  const monthlyOrder = entry.toOrder * 3;
  
  console.log(`│ 2025-${entry.mois}│     ${monthlyNeed.toString().padStart(3, ' ')}    │      ${monthlyAvailable.toString().padStart(3, ' ')}     │      ${monthlyOrder.toString().padStart(3, ' ')}     │`);
});

console.log('└──────────┴────────────┴─────────────┴─────────────┘');

console.log('\n📈 Calcul exemple pour février 2025:');
console.log(`   Machine Need = 20 (par site) × 3 sites = ${20 * 3} total`);
console.log(`   Available    = 18 (par site) × 3 sites = ${18 * 3} total`);
console.log(`   To Order     = 2 (par site) × 3 sites = ${2 * 3} total`);

// ===================================================================
// ÉTAPE 5: CONTRIBUTION AU DASHBOARD GLOBAL
// ===================================================================

console.log('\n\n📊 ÉTAPE 5: CONTRIBUTION AU DASHBOARD GLOBAL');
console.log('============================================');

const dashboardTotal = 2200; // D'après votre image du dashboard
const contribution = (equipmentTotalNeed / dashboardTotal * 100).toFixed(2);

console.log('\n🧮 CALCUL DE LA CONTRIBUTION:');
console.log(`   Si le dashboard global montre ${dashboardTotal} machines au total,`);
console.log(`   alors Komax Alpha 300 représente:`);
console.log(`   Contribution = (${equipmentTotalNeed} / ${dashboardTotal}) × 100 = ${contribution}%`);

// ===================================================================
// RÉSUMÉ FINAL
// ===================================================================

console.log('\n\n✅ RÉSUMÉ FINAL');
console.log('==============');
console.log(`🏭 Équipement: Komax Alpha 300`);
console.log(`📍 Sites: ${sites.length} sites (${sites.join(', ')})`);
console.log(`📅 Période: 2025 (12 mois) + 2026 (4 trimestres) + 2027 (4 trimestres)`);
console.log(`📊 Total par site: ${totalTunisNeed} machines sur 3 ans`);
console.log(`📊 Total équipement: ${equipmentTotalNeed} machines`);
console.log(`📊 Taux d'utilisation: ${tauxUtilisation}%`);
console.log(`📊 Contribution au dashboard: ${contribution}% du total global`);

console.log('\n🔢 ÉQUATIONS PRINCIPALES UTILISÉES:');
console.log('1. Total par site = Σ(valeurs mensuelles) + Σ(valeurs trimestrielles)');
console.log('2. Total équipement = Total par site × Nombre de sites');
console.log('3. Taux utilisation = (Available / Need) × 100');
console.log('4. Données temporelles = Valeur mensuelle × Nombre de sites');

console.log('\n🎯 Ces calculs sont exactement ceux utilisés dans votre dashboard COFAT!');