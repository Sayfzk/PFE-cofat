-- Script SQL pour ajouter les colonnes category et rowOrder à la table Spaces
-- À exécuter dans SQL Server Management Studio ou via sqlcmd

USE [capacity_study]; -- Remplacer par le nom de votre base de données
GO

-- Ajouter la colonne category si elle n'existe pas
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Spaces]') 
    AND name = 'category'
)
BEGIN
    ALTER TABLE [dbo].[Spaces]
    ADD [category] NVARCHAR(50) NULL;
    
    PRINT '✅ Colonne category ajoutée avec succès';
END
ELSE
BEGIN
    PRINT '⚠️ La colonne category existe déjà';
END
GO

-- Ajouter la colonne rowOrder si elle n'existe pas
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Spaces]') 
    AND name = 'rowOrder'
)
BEGIN
    ALTER TABLE [dbo].[Spaces]
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
    WHERE name = 'space_site_order_index' 
    AND object_id = OBJECT_ID(N'[dbo].[Spaces]')
)
BEGIN
    CREATE INDEX [space_site_order_index] 
    ON [dbo].[Spaces] ([siteId], [rowOrder]);
    
    PRINT '✅ Index space_site_order_index créé avec succès';
END
ELSE
BEGIN
    PRINT '⚠️ L''index space_site_order_index existe déjà';
END
GO

-- Mettre à jour les valeurs existantes à 0 si elles sont NULL
UPDATE [dbo].[Spaces]
SET [rowOrder] = 0
WHERE [rowOrder] IS NULL;

PRINT '✅ Migration Space terminée avec succès!';
GO
