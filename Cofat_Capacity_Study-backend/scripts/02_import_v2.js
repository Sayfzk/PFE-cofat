/**
 * =====================================================================
 * SCRIPT D'IMPORT - Standard Equipment V15
 * Fichier source : "FinalStadardEquipment update (2).xls"
 * Table cible    : StandardInvestments_V2 (SQL Server via Sequelize)
 *
 * LOGIQUE MÉTIER :
 *   COUPE                              → code_eq préfixe 1 (1.1 → 1.20)
 *   PREPARATION                        → code_eq préfixe 2 (2.1 → 2.58)
 *   ASSEMBLAGE                         → code_eq préfixe 3 (3.1 → 3.56)
 *   CONTRÔLE ÉLECTRIQUE + COND.        → code_eq préfixe 4 (4.1 → 4.43)
 *   EQUIPMENT DE TEST                  → code_eq préfixe 5 (5.1 → 5.11)
 *   EQUIPMENT DIVERS                   → code_eq préfixe 6 (6.1 → 6.3)
 *
 * DOUBLONS sur code_eq :
 *   Autorisés intentionnellement (variantes d'un même équipement).
 *   Chaque ligne est importée comme une entrée distincte.
 * =====================================================================
 */

'use strict';

const XLSX  = require('xlsx');
const path  = require('path');
const { Sequelize, DataTypes, Op } = require('sequelize');

// -------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------
const EXCEL_PATH = "D:\\OneDrive - Cofat\\Documents\\FinalStadardEquipment update (2).xls";
const SHEET_NAME = 'liste-investissement-v15';
const SOURCE_FILE = 'FinalStadardEquipment update (2).xls';
const VERSION    = 'v15';
const BATCH_SIZE = 50; // Nombre de lignes insérées par batch

// -------------------------------------------------------
// CONNEXION BASE DE DONNÉES - Utilise db.js existant
// (SQL Server sur 172.20.53.10, base GALIA_V1)
// -------------------------------------------------------
const sequelize = require('../db');

// -------------------------------------------------------
// MODÈLE Sequelize pour StandardInvestments_V2
// -------------------------------------------------------
const StandardInvestmentV2 = sequelize.define('StandardInvestmentV2', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code_eq:                { type: DataTypes.STRING(100),    allowNull: true },
  operation_prefix:       { type: DataTypes.TINYINT,        allowNull: true },
  operation:              { type: DataTypes.TEXT,            allowNull: true },
  equipment_reference:    { type: DataTypes.TEXT,            allowNull: true },
  supplier_technology:    { type: DataTypes.TEXT,            allowNull: true },
  equipment_type:         { type: DataTypes.STRING(50),      allowNull: true },
  calculation_method:     { type: DataTypes.TEXT,            allowNull: true },
  daily_capacity:         { type: DataTypes.STRING(500),     allowNull: true },
  capacity_unit:          { type: DataTypes.STRING(100),     allowNull: true },
  lifetime:               { type: DataTypes.STRING(200),     allowNull: true },
  cost_euro:              { type: DataTypes.STRING(200),     allowNull: true },
  cost_mexican_peso:      { type: DataTypes.STRING(200),     allowNull: true },
  cost_brazil_real:       { type: DataTypes.STRING(200),     allowNull: true },
  workstation_dimensions: { type: DataTypes.STRING(300),     allowNull: true },
  reference_cdc:          { type: DataTypes.STRING(200),     allowNull: true },
  reference_pr:           { type: DataTypes.STRING(200),     allowNull: true },
  QTY:                    { type: DataTypes.INTEGER,         allowNull: false, defaultValue: 1 },
  row_index:              { type: DataTypes.INTEGER,         allowNull: true },
  version:                { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'v15' },
  source_file:            { type: DataTypes.STRING(500),     allowNull: true },
  import_date:            { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW },
  is_active:              { type: DataTypes.BOOLEAN,         allowNull: false, defaultValue: true },
}, {
  tableName: 'StandardInvestments_V2',
  timestamps: true,
});

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------

/**
 * Extrait le préfixe numérique (entier) d'un code_eq
 * Exemples: "1.3" → 1 | "3.12" → 3 | "COUPE" → null
 */
function extractPrefix(codeEq) {
  if (!codeEq) return null;
  const str = String(codeEq).trim();
  const match = str.match(/^(\d+)/);
  if (!match) return null;
  const prefix = parseInt(match[1], 10);
  return (prefix >= 1 && prefix <= 6) ? prefix : null;
}

/**
 * Nettoie une valeur (string ou number) en chaîne propre.
 * Retourne null si vide.
 */
function clean(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

/**
 * Nettoie une valeur numérique (coût) → string propre
 * Gère les formats: 110000, "110 000", "110,000"
 */
function cleanCost(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'null') return null;
  return s;
}

/**
 * Détermine si une ligne est une ligne d'en-tête de section
 * (ex: "1", "COUPE", "2", "PREPARATION", etc.)
 */
function isSectionHeader(row, headers) {
  const codeEqIdx = headers.findIndex(h => h === 'Code Eq.');
  const codeVal = clean(row[codeEqIdx]);
  if (!codeVal) return false;
  // C'est une ligne de section si le code_eq est juste un entier (1, 2, 3, 4, 5, 6)
  return /^\d$/.test(codeVal);
}

// -------------------------------------------------------
// LECTURE EXCEL
// -------------------------------------------------------
function readExcel() {
  console.log(`\n📂 Lecture du fichier Excel : ${EXCEL_PATH}`);

  let workbook;
  try {
    workbook = XLSX.readFile(EXCEL_PATH, { cellText: true, cellDates: true });
  } catch (err) {
    throw new Error(`❌ Impossible de lire le fichier Excel : ${err.message}`);
  }

  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    throw new Error(`❌ Feuille "${SHEET_NAME}" non trouvée. Disponibles : ${workbook.SheetNames.join(', ')}`);
  }

  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false });

  if (rawData.length < 2) {
    throw new Error('❌ Le fichier Excel ne contient pas assez de données.');
  }

  const headers = rawData[0];
  const dataRows = rawData.slice(1);

  console.log(`✅ ${dataRows.length} lignes lues, ${headers.length} colonnes`);
  console.log(`   Colonnes : ${headers.map((h, i) => `[${i}]${h}`).join(' | ')}`);

  return { headers, dataRows };
}

// -------------------------------------------------------
// TRANSFORMATION EXCEL → OBJET BASE DE DONNÉES
// -------------------------------------------------------
function transformRow(rawRow, headers, rowIndex) {
  // Mapping des colonnes Excel → champs DB
  // [0]  Code Eq.
  // [1]  Opérations
  // [2]  Equipement de référence préconisé
  // [3]  Fournisseur/ Technologie de référence
  // [4]  Type
  // [5]  Méthode de calcul du besoin en équipement (Quantité)
  // [6]  Capacité par jour (j)
  // [7]  null (= unité de capacité)
  // [8]  Durée de vie équipement
  // [9]  Coût estimatif avec frais approche (Euro)
  // [10] Dimensions poste de travail
  // [11] Référence CDC
  // [12] Référence PR
  // [13] Coût estimatif avec frais approche (Mexique)
  // [14] Coût estimatif avec frais approche (Brésil)

  const get = (idx) => rawRow[idx] !== undefined ? rawRow[idx] : null;

  const codeEq = clean(get(0));
  const prefix = extractPrefix(codeEq);

  return {
    code_eq:                codeEq,
    operation_prefix:       prefix,
    operation:              clean(get(1)),
    equipment_reference:    clean(get(2)),
    supplier_technology:    clean(get(3)),
    equipment_type:         clean(get(4)),
    calculation_method:     clean(get(5)),
    daily_capacity:         clean(get(6)),
    capacity_unit:          clean(get(7)),
    lifetime:               clean(get(8)),
    cost_euro:              cleanCost(get(9)),
    workstation_dimensions: clean(get(10)),
    reference_cdc:          clean(get(11)),
    reference_pr:           clean(get(12)),
    cost_mexican_peso:      cleanCost(get(13)),
    cost_brazil_real:       cleanCost(get(14)),
    QTY:                    1,
    row_index:              rowIndex,
    version:                VERSION,
    source_file:            SOURCE_FILE,
    is_active:              true,
  };
}

// -------------------------------------------------------
// IMPORT PRINCIPAL
// -------------------------------------------------------
async function runImport() {
  console.log('\n🚀 ===== IMPORT STANDARD EQUIPMENT V2 =====\n');

  // 1. Lire l'Excel
  const { headers, dataRows } = readExcel();

  // 2. Préparer les enregistrements
  const records = [];
  let skippedHeaders = 0;
  let skippedEmpty = 0;

  dataRows.forEach((row, idx) => {
    // Ignorer les lignes complètement vides
    const hasData = row.some(cell => cell !== null && String(cell).trim() !== '');
    if (!hasData) { skippedEmpty++; return; }

    // Ignorer les lignes d'en-tête de section (code_eq = "1", "2", etc. sans autres données)
    const codeVal = clean(row[0]);
    const operationVal = clean(row[1]);

    if (codeVal && /^\d$/.test(codeVal) && !row[2] && !row[3]) {
      skippedHeaders++;
      return;
    }

    const record = transformRow(row, headers, idx + 2); // +2 car ligne 1 = headers
    records.push(record);
  });

  console.log(`\n📊 Résumé de la préparation :`);
  console.log(`   ✅ Lignes à importer : ${records.length}`);
  console.log(`   ⏭️  Lignes d'en-tête ignorées : ${skippedHeaders}`);
  console.log(`   ⏭️  Lignes vides ignorées : ${skippedEmpty}`);

  // Statistiques par opération
  const stats = {};
  records.forEach(r => {
    const key = r.operation_prefix ? `Op.${r.operation_prefix}` : 'Sans préfixe';
    stats[key] = (stats[key] || 0) + 1;
  });
  console.log(`\n📈 Distribution par opération :`);
  Object.entries(stats).sort().forEach(([k, v]) => console.log(`   ${k} : ${v} lignes`));

  // 3. Connexion DB
  console.log('\n🔗 Connexion à la base de données...');
  await sequelize.authenticate();
  console.log('✅ Connexion établie.');

  // 4. Vérifier que la table V2 existe
  const tableExists = await sequelize.query(
    `SELECT 1 FROM sys.tables WHERE name = 'StandardInvestments_V2'`,
    { type: Sequelize.QueryTypes.SELECT }
  );

  if (tableExists.length === 0) {
    throw new Error('❌ La table [StandardInvestments_V2] n\'existe pas. Exécutez d\'abord le script SQL 01_create_table_v2.sql');
  }

  // 5. Vérifier si des données existent déjà (éviter les doublons d'import)
  const existingCount = await StandardInvestmentV2.count({
    where: { version: VERSION, source_file: SOURCE_FILE }
  });

  if (existingCount > 0) {
    console.log(`\n⚠️  ATTENTION : ${existingCount} lignes de cette version (${VERSION}) existent déjà.`);
    if (process.argv.includes('--force')) {
      console.log('   --force détecté : suppression des données existantes de cette version...');
      await StandardInvestmentV2.destroy({
        where: { version: VERSION, source_file: SOURCE_FILE }
      });
      console.log('   ✅ Données précédentes supprimées.');
    } else {
      console.log('   ⛔ Import annulé. Utilisez --force pour écraser.\n');
      process.exit(1);
    }
  }

  // 6. Insertion par batches
  console.log(`\n📥 Insertion de ${records.length} enregistrements par batches de ${BATCH_SIZE}...`);

  let inserted = 0;
  let errors   = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    try {
      await StandardInvestmentV2.bulkCreate(batch, { validate: false });
      inserted += batch.length;
      const pct = Math.round((inserted / records.length) * 100);
      process.stdout.write(`\r   Progression : ${inserted}/${records.length} (${pct}%)`);
    } catch (err) {
      errors += batch.length;
      console.error(`\n   ❌ Erreur batch ${i / BATCH_SIZE + 1}:`, err.message);
    }
  }

  console.log(`\n\n✅ ===== IMPORT TERMINÉ =====`);
  console.log(`   Insérés avec succès : ${inserted}`);
  if (errors > 0) console.log(`   Erreurs             : ${errors}`);

  // 7. Vérification finale
  const finalCount = await StandardInvestmentV2.count({ where: { version: VERSION } });
  console.log(`   Total en DB (v15)   : ${finalCount}`);
  console.log(`\n🏁 Import terminé.\n`);

  await sequelize.close();
  process.exit(0);
}

// -------------------------------------------------------
// LANCEMENT
// -------------------------------------------------------
runImport().catch(err => {
  console.error('\n❌ ERREUR FATALE :', err.message);
  process.exit(1);
});
