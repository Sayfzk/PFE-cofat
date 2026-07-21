const express = require('express');
const router  = express.Router();
const { DataTypes, Op, Sequelize } = require('sequelize');
const sequelize = require('../db');

// -------------------------------------------------------
// MODÈLE StandardInvestments_V2
// -------------------------------------------------------
const StandardInvestmentV2 = sequelize.define('StandardInvestmentV2', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code_eq:                { type: DataTypes.STRING(100),  allowNull: true },
  operation_prefix:       { type: DataTypes.TINYINT,      allowNull: true },
  operation:              { type: DataTypes.TEXT,          allowNull: true },
  equipment_reference:    { type: DataTypes.TEXT,          allowNull: true },
  supplier_technology:    { type: DataTypes.TEXT,          allowNull: true },
  equipment_type:         { type: DataTypes.STRING(50),    allowNull: true },
  calculation_method:     { type: DataTypes.TEXT,          allowNull: true },
  daily_capacity:         { type: DataTypes.STRING(500),   allowNull: true },
  capacity_unit:          { type: DataTypes.STRING(100),   allowNull: true },
  lifetime:               { type: DataTypes.STRING(200),   allowNull: true },
  cost_euro:              { type: DataTypes.STRING(200),   allowNull: true },
  cost_mexican_peso:      { type: DataTypes.STRING(200),   allowNull: true },
  cost_brazil_real:       { type: DataTypes.STRING(200),   allowNull: true },
  workstation_dimensions: { type: DataTypes.STRING(300),   allowNull: true },
  reference_cdc:          { type: DataTypes.STRING(200),   allowNull: true },
  reference_pr:           { type: DataTypes.STRING(200),   allowNull: true },
  QTY:                    { type: DataTypes.INTEGER,        allowNull: false, defaultValue: 1 },
  row_index:              { type: DataTypes.INTEGER,        allowNull: true },
  version:                { type: DataTypes.STRING(20),     allowNull: false, defaultValue: 'v15' },
  source_file:            { type: DataTypes.STRING(500),    allowNull: true },
  is_active:              { type: DataTypes.BOOLEAN,        allowNull: false, defaultValue: true },
}, {
  tableName: 'StandardInvestments_V2',
  timestamps: true,
});

// -------------------------------------------------------
// MAPPING OPÉRATION → PLAGE DE CODE_EQ
// Source : logique métier officielle
// -------------------------------------------------------
const OPERATION_RANGES = {
  1: { name: 'COUPE',                             min: 1.1,  max: 1.20 },
  2: { name: 'PREPARATION',                        min: 2.1,  max: 2.58 },
  3: { name: 'ASSEMBLAGE',                         min: 3.1,  max: 3.56 },
  4: { name: 'CONTRÔLE ÉLECTRIQUE+CONDITIONNEMENT', min: 4.1,  max: 4.43 },
  5: { name: 'EQUIPMENT DE TEST',                  min: 5.1,  max: 5.11 },
  6: { name: 'EQUIPMENT DIVERS',                   min: 6.1,  max: 6.3  },
};

/**
 * Construit la clause WHERE pour un ensemble d'opérations sélectionnées.
 * Utilise l'index operation_prefix pour un filtrage ultra-rapide.
 * Fallback sur LIKE pour les enregistrements sans préfixe calculé.
 *
 * @param {number[]} prefixes - ex: [1, 3, 5]
 * @returns {object} clause Sequelize WHERE
 */
function buildOperationFilter(prefixes) {
  if (!prefixes || prefixes.length === 0) return {};

  // Filtre principal via operation_prefix (index SQL)
  const byPrefix = {
    operation_prefix: { [Op.in]: prefixes }
  };

  // Filtre de secours via LIKE sur code_eq (pour les enregistrements sans préfixe)
  const likeConditions = prefixes.map(p => ({
    code_eq: { [Op.like]: `${p}.%` }
  }));

  return {
    [Op.or]: [
      byPrefix,
      ...likeConditions
    ]
  };
}

// -------------------------------------------------------
// GET /api/standard-investments-v2
// Paramètres query :
//   ?operationCodes=1,3,5   → sélection multiple par préfixe
//   ?search=Komax           → recherche texte
//   ?page=1&limit=100       → pagination (optionnel)
// -------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { operationCodes, search, page, limit } = req.query;

    let whereClause = { is_active: true };

    // --- Filtre par opération ---
    if (operationCodes && operationCodes.trim()) {
      const prefixes = operationCodes
        .split(',')
        .map(c => parseInt(c.trim(), 10))
        .filter(n => !isNaN(n) && n >= 1 && n <= 6);

      if (prefixes.length > 0) {
        const opFilter = buildOperationFilter(prefixes);
        whereClause = { ...whereClause, ...opFilter };
      }
    }

    // --- Filtre texte multi-champs ---
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      const searchConditions = {
        [Op.or]: [
          { code_eq:              { [Op.like]: term } },
          { operation:            { [Op.like]: term } },
          { equipment_reference:  { [Op.like]: term } },
          { supplier_technology:  { [Op.like]: term } },
          { equipment_type:       { [Op.like]: term } },
          { calculation_method:   { [Op.like]: term } },
          { reference_cdc:        { [Op.like]: term } },
          { reference_pr:         { [Op.like]: term } },
        ]
      };

      whereClause = {
        [Op.and]: [whereClause, searchConditions]
      };
    }

    // --- Pagination ---
    const pageNum  = parseInt(page,  10) || 1;
    const pageSize = parseInt(limit, 10) || 500;
    const offset   = (pageNum - 1) * pageSize;

    const { count, rows } = await StandardInvestmentV2.findAndCountAll({
      where: whereClause,
      order: [['operation_prefix', 'ASC'], ['code_eq', 'ASC'], ['id', 'ASC']],
      limit:  pageSize,
      offset: offset,
    });

    res.json({
      success: true,
      total:       count,
      page:        pageNum,
      pageSize:    pageSize,
      totalPages:  Math.ceil(count / pageSize),
      data:        rows,
    });

  } catch (error) {
    console.error('Error fetching standard investments V2:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch standard investments',
      details: error.message
    });
  }
});

// -------------------------------------------------------
// GET /api/standard-investments-v2/operations
// Retourne les statistiques par opération
// -------------------------------------------------------
router.get('/operations', async (req, res) => {
  try {
    const stats = await sequelize.query(`
      SELECT
        operation_prefix        AS prefix,
        COUNT(*)                AS total,
        COUNT(DISTINCT code_eq) AS unique_codes,
        COUNT(CASE WHEN cost_euro IS NOT NULL THEN 1 END) AS with_cost
      FROM StandardInvestments_V2
      WHERE is_active = 1
      GROUP BY operation_prefix
      ORDER BY operation_prefix
    `, { type: Sequelize.QueryTypes.SELECT });

    const enriched = stats.map(s => ({
      ...s,
      name: OPERATION_RANGES[s.prefix]?.name || 'Inconnu',
      range: OPERATION_RANGES[s.prefix]
        ? `${OPERATION_RANGES[s.prefix].min} → ${OPERATION_RANGES[s.prefix].max}`
        : null,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------
// POST /api/standard-investments-v2
// Créer un nouvel équipement
// -------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const required = ['code_eq', 'operation', 'equipment_reference', 'supplier_technology', 'equipment_type', 'calculation_method'];
    const missing = required.filter(f => !data[f] || String(data[f]).trim() === '');

    if (missing.length > 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields', missingFields: missing });
    }

    // Calcule le préfixe automatiquement si absent
    if (!data.operation_prefix && data.code_eq) {
      const match = String(data.code_eq).match(/^(\d+)/);
      if (match) data.operation_prefix = parseInt(match[1], 10);
    }

    const created = await StandardInvestmentV2.create({ ...data, version: 'v15', is_active: true });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------
// POST /api/standard-investments-v2/save (batch update)
// -------------------------------------------------------
router.post('/save', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Body must be an array' });
    }

    const results = [];
    for (const item of items) {
      if (item.id) {
        await StandardInvestmentV2.update(item, { where: { id: item.id } });
        results.push({ id: item.id, action: 'updated' });
      } else {
        const created = await StandardInvestmentV2.create(item);
        results.push({ id: created.id, action: 'created' });
      }
    }

    res.json({ success: true, message: `Processed ${results.length} items`, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------
// DELETE /api/standard-investments-v2
// (soft delete : is_active = false)
// -------------------------------------------------------
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required' });
    }

    // Soft delete
    const [updated] = await StandardInvestmentV2.update(
      { is_active: false },
      { where: { id: { [Op.in]: ids } } }
    );

    res.json({ success: true, message: `${updated} items deactivated`, deactivatedCount: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
