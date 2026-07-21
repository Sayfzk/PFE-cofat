-- Script SQL pour ajouter la colonne rowOrder à la table HR
-- À exécuter dans SQL Server Management Studio ou via sqlcmd

USE [capacity_study]; -- Remplacer par le nom de votre base de données
GO

-- Vérifier si la colonne existe déjà
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[HR]') 
    AND name = 'rowOrder'
)
BEGIN
    -- Ajouter la colonne rowOrder
    ALTER TABLE [dbo].[HR]
    ADD [rowOrder] INT NULL DEFAULT 0;
    
    PRINT '✅ Colonne rowOrder ajoutée avec succès';
END
ELSE
BEGIN
    PRINT '⚠️ La colonne rowOrder existe déjà';
END
GO

-- Créer l'index si il n'existe pas
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'hr_site_order_index' 
    AND object_id = OBJECT_ID(N'[dbo].[HR]')
)
BEGIN
    CREATE INDEX [hr_site_order_index] 
    ON [dbo].[HR] ([siteId], [rowOrder]);
    
    PRINT '✅ Index hr_site_order_index créé avec succès';
END
ELSE
BEGIN
    PRINT '⚠️ L''index hr_site_order_index existe déjà';
END
GO

-- Mettre à jour les valeurs existantes à 0 si elles sont NULL
UPDATE [dbo].[HR]
SET [rowOrder] = 0
WHERE [rowOrder] IS NULL;

PRINT '✅ Migration terminée avec succès!';
GO
