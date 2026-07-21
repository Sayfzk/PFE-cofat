-- =====================================================================
-- REQUÊTES SQL DE FILTRAGE - Standard Equipment V2
-- =====================================================================

-- -------------------------------------------------------
-- A. FILTRAGE PAR OPÉRATION UNIQUE (par plage de code_eq)
-- -------------------------------------------------------

-- COUPE (1.1 → 1.20)
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE code_eq LIKE '1.%'
  AND is_active = 1
ORDER BY code_eq, id;

-- PREPARATION (2.1 → 2.58)
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE code_eq LIKE '2.%'
  AND is_active = 1
ORDER BY code_eq, id;

-- ASSEMBLAGE (3.1 → 3.56)
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE code_eq LIKE '3.%'
  AND is_active = 1
ORDER BY code_eq, id;

-- CONTRÔLE ÉLECTRIQUE ET CONDITIONNEMENT (4.1 → 4.43)
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE code_eq LIKE '4.%'
  AND is_active = 1
ORDER BY code_eq, id;

-- EQUIPMENT DE TEST (5.1 → 5.11)
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE code_eq LIKE '5.%'
  AND is_active = 1
ORDER BY code_eq, id;

-- EQUIPMENT DIVERS (6.1 → 6.3)
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE code_eq LIKE '6.%'
  AND is_active = 1
ORDER BY code_eq, id;

-- -------------------------------------------------------
-- B. SÉLECTION MULTIPLE D'OPÉRATIONS (via operation_prefix)
-- -------------------------------------------------------

-- Exemple : COUPE + ASSEMBLAGE (opérations 1 et 3)
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE operation_prefix IN (1, 3)
  AND is_active = 1
ORDER BY operation_prefix, code_eq, id;

-- Exemple : toutes les opérations sauf DIVERS
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE operation_prefix IN (1, 2, 3, 4, 5)
  AND is_active = 1
ORDER BY operation_prefix, code_eq, id;

-- Exemple : toutes les opérations
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE is_active = 1
ORDER BY operation_prefix, code_eq, id;

-- -------------------------------------------------------
-- C. FILTRAGE DYNAMIQUE COMBINÉ (opérations + recherche texte)
-- Simule le comportement du backend Node.js
-- -------------------------------------------------------

-- Sélectionner opérations 1 et 2 avec recherche sur "Komax"
SELECT * FROM [dbo].[StandardInvestments_V2]
WHERE operation_prefix IN (1, 2)
  AND is_active = 1
  AND (
    code_eq             LIKE '%Komax%'
    OR operation         LIKE '%Komax%'
    OR equipment_reference LIKE '%Komax%'
    OR supplier_technology LIKE '%Komax%'
    OR equipment_type    LIKE '%Komax%'
  )
ORDER BY code_eq, id;

-- -------------------------------------------------------
-- D. GESTION DES DOUBLONS SUR code_eq
-- -------------------------------------------------------

-- Voir tous les doublons
SELECT
    code_eq,
    COUNT(*) AS nb_variantes,
    STRING_AGG(id, ', ') AS ids
FROM [dbo].[StandardInvestments_V2]
WHERE is_active = 1
GROUP BY code_eq
HAVING COUNT(*) > 1
ORDER BY nb_variantes DESC;

-- Voir le détail d'un code_eq dupliqué (ex: 1.1)
SELECT
    id,
    code_eq,
    operation,
    daily_capacity,
    cost_euro,
    QTY,
    row_index
FROM [dbo].[StandardInvestments_V2]
WHERE code_eq = '1.1'
  AND is_active = 1
ORDER BY id;

-- -------------------------------------------------------
-- E. STATISTIQUES PAR OPÉRATION
-- -------------------------------------------------------
SELECT
    operation_prefix            AS [Opération],
    COUNT(*)                    AS [Nb Lignes],
    COUNT(DISTINCT code_eq)     AS [Codes Uniques],
    COUNT(CASE WHEN cost_euro IS NOT NULL THEN 1 END) AS [Avec Coût EUR],
    SUM(QTY)                    AS [Quantité Totale]
FROM [dbo].[StandardInvestments_V2]
WHERE is_active = 1
GROUP BY operation_prefix
ORDER BY operation_prefix;

-- -------------------------------------------------------
-- F. ROLLBACK - SWITCH ENTRE VERSIONS
-- -------------------------------------------------------

-- Pointer la vue vers l'ancienne table (rollback)
/*
ALTER VIEW [dbo].[StandardInvestments_Active] AS
SELECT
    id, code_eq,
    CAST(LEFT(code_eq, 1) AS TINYINT) AS operation_prefix,
    operation, equipment_reference, supplier_technology,
    equipment_type, calculation_method, daily_capacity,
    NULL AS capacity_unit, lifetime,
    cost_euro, cost_mexican_peso, cost_brazil_real,
    workstation_dimensions, reference_cdc, reference_pr,
    QTY, row_index,
    'v14' AS version, 1 AS is_active,
    createdAt, updatedAt
FROM [dbo].[StandardInvestments]  -- ← ancienne table V1
*/

-- Pointer la vue vers la nouvelle table (V2)
/*
ALTER VIEW [dbo].[StandardInvestments_Active] AS
SELECT *, 'v15' AS version FROM [dbo].[StandardInvestments_V2]
WHERE is_active = 1
*/

-- -------------------------------------------------------
-- G. COMPARAISON ANCIENNE vs NOUVELLE VERSION
-- -------------------------------------------------------

-- Codes présents dans V2 mais absents de V1
SELECT DISTINCT V2.code_eq
FROM [dbo].[StandardInvestments_V2] V2
WHERE V2.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM [dbo].[StandardInvestments] V1
    WHERE V1.code_eq LIKE V2.code_eq + '%'
       OR V1.code_eq = V2.code_eq
  );

-- Codes présents dans V1 mais absents de V2
SELECT DISTINCT V1.code_eq
FROM [dbo].[StandardInvestments] V1
WHERE NOT EXISTS (
    SELECT 1 FROM [dbo].[StandardInvestments_V2] V2
    WHERE V2.is_active = 1
      AND (V2.code_eq LIKE V1.code_eq + '%' OR V2.code_eq = V1.code_eq)
  );
