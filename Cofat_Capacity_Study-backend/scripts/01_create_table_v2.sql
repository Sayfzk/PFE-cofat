-- =====================================================================
-- SCRIPT SQL - CREATION DE LA NOUVELLE TABLE StandardInvestments_V2
-- Standard Equipment - Version 15 (FinalStadardEquipment update v2)
-- Auteur : Système d'import automatisé
-- Date   : 2026-04-07
--
-- STRATÉGIE :
--  - La table existante [StandardInvestments] reste INTACTE (rollback possible)
--  - La nouvelle table [StandardInvestments_V2] contient les nouvelles données
--  - Un champ [version] + [source_file] permet de tracer la provenance
--  - Un champ [operation_prefix] (INT) est calculé à l'import pour accélérer les filtres
-- =====================================================================

-- -------------------------------------------------------
-- 1. CRÉATION DE LA TABLE V2
-- -------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'StandardInvestments_V2'
)
BEGIN
    CREATE TABLE [dbo].[StandardInvestments_V2] (
        -- Clé primaire auto-incrémentée
        [id]                    INT             IDENTITY(1,1) PRIMARY KEY,

        -- Champ clé de filtrage (ex: 1.1, 2.3, 3.12)
        -- Peut être dupliqué (variantes d'un même équipement)
        [code_eq]               NVARCHAR(100)   NULL,

        -- Préfixe numérique calculé (1, 2, 3, 4, 5, 6) pour filtrage rapide
        [operation_prefix]      TINYINT         NULL,

        -- Opération / Description de l'opération
        [operation]             NVARCHAR(MAX)   NULL,

        -- Equipement de référence
        [equipment_reference]   NVARCHAR(MAX)   NULL,

        -- Fournisseur / Technologie de référence
        [supplier_technology]   NVARCHAR(MAX)   NULL,

        -- Type d'équipement (C, S, ...)
        [equipment_type]        NVARCHAR(50)    NULL,

        -- Méthode de calcul du besoin en équipement (Quantité)
        [calculation_method]    NVARCHAR(MAX)   NULL,

        -- Capacité par jour (texte car peut contenir unité + note)
        [daily_capacity]        NVARCHAR(500)   NULL,

        -- Unité de capacité (colonne "null" dans l'Excel = unité)
        [capacity_unit]         NVARCHAR(100)   NULL,

        -- Durée de vie équipement
        [lifetime]              NVARCHAR(200)   NULL,

        -- Coûts estimatifs (stockés en NVARCHAR pour préserver le format source)
        [cost_euro]             NVARCHAR(200)   NULL,
        [cost_mexican_peso]     NVARCHAR(200)   NULL,
        [cost_brazil_real]      NVARCHAR(200)   NULL,

        -- Dimensions du poste de travail
        [workstation_dimensions] NVARCHAR(300)  NULL,

        -- Références documentaires
        [reference_cdc]         NVARCHAR(200)   NULL,
        [reference_pr]          NVARCHAR(200)   NULL,

        -- Quantité (par défaut 1)
        [QTY]                   INT             NOT NULL DEFAULT 1,

        -- Champ d'ordre original dans le fichier Excel
        [row_index]             INT             NULL,

        -- Traçabilité / Versioning
        [version]               NVARCHAR(20)    NOT NULL DEFAULT 'v15',
        [source_file]           NVARCHAR(500)   NULL,
        [import_date]           DATETIME        NOT NULL DEFAULT GETDATE(),
        [is_active]             BIT             NOT NULL DEFAULT 1,

        -- Timestamps
        [createdAt]             DATETIME        NOT NULL DEFAULT GETDATE(),
        [updatedAt]             DATETIME        NOT NULL DEFAULT GETDATE()
    );

    PRINT '✅ Table [StandardInvestments_V2] créée avec succès.';
END
ELSE
BEGIN
    PRINT '⚠️ Table [StandardInvestments_V2] existe déjà. Aucune modification.';
END
GO

-- -------------------------------------------------------
-- 2. INDEX POUR OPTIMISER LES FILTRES PAR OPÉRATION
-- -------------------------------------------------------

-- Index sur code_eq (très fréquemment filtré, LIKE '1.%')
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_V2_code_eq' AND object_id = OBJECT_ID('StandardInvestments_V2'))
    CREATE INDEX [IDX_V2_code_eq] ON [dbo].[StandardInvestments_V2] ([code_eq] ASC);
GO

-- Index sur operation_prefix (filtrage rapide par opération entière)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_V2_operation_prefix' AND object_id = OBJECT_ID('StandardInvestments_V2'))
    CREATE INDEX [IDX_V2_operation_prefix] ON [dbo].[StandardInvestments_V2] ([operation_prefix] ASC);
GO

-- Index composite pour les recherches combinées
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_V2_prefix_code' AND object_id = OBJECT_ID('StandardInvestments_V2'))
    CREATE INDEX [IDX_V2_prefix_code] ON [dbo].[StandardInvestments_V2] ([operation_prefix] ASC, [code_eq] ASC);
GO

-- Index sur is_active (pour filtrer facilement les lignes actives)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_V2_is_active' AND object_id = OBJECT_ID('StandardInvestments_V2'))
    CREATE INDEX [IDX_V2_is_active] ON [dbo].[StandardInvestments_V2] ([is_active] ASC);
GO

PRINT '✅ Index créés avec succès.';
GO

-- -------------------------------------------------------
-- 3. VUE DE SWITCH (ROLLBACK FACILE)
-- Permet de pointer vers V1 ou V2 en changeant juste la vue
-- -------------------------------------------------------
IF OBJECT_ID('dbo.StandardInvestments_Active', 'V') IS NOT NULL
    DROP VIEW dbo.StandardInvestments_Active;
GO

CREATE VIEW [dbo].[StandardInvestments_Active] AS
-- ⚠️ Pour rollback, remplacer "StandardInvestments_V2" par "StandardInvestments"
SELECT
    id,
    code_eq,
    operation_prefix,
    operation,
    equipment_reference,
    supplier_technology,
    equipment_type,
    calculation_method,
    daily_capacity,
    NULL AS capacity_unit,
    lifetime,
    cost_euro,
    cost_mexican_peso,
    cost_brazil_real,
    workstation_dimensions,
    reference_cdc,
    reference_pr,
    QTY,
    row_index,
    'v15'           AS version,
    is_active,
    createdAt,
    updatedAt
FROM [dbo].[StandardInvestments_V2]
WHERE is_active = 1;
GO

PRINT '✅ Vue [StandardInvestments_Active] créée (pointe sur V2).';
GO
