import React, { useRef, useState } from 'react';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

const ExcelImporter = ({ onDataImported }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log('Excel data loaded:', jsonData);

        if (jsonData.length < 2) {
          throw new Error(t('errorInvalidData', 'Le fichier Excel est vide ou ne contient pas de données.'));
        }

        // Définir les périodes selon votre structure existante
        const months2025 = Array.from({ length: 12 }, (_, i) => `MO ${String(i + 1).padStart(2, '0')}`);
        const quarters2026 = ['Q 01', 'Q 02', 'Q 03', 'Q 04'];
        const quarters2027 = ['Q 01', 'Q 02', 'Q 03', 'Q 04'];
        const allPeriods = [...months2025, ...quarters2026, ...quarters2027];

        // Rechercher la ligne contenant les années (2025, 2026, 2027)
        let yearHeaderRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.some(cell => 
            cell && ['2025', '2026', '2027'].includes(String(cell).toString().trim())
          )) {
            yearHeaderRowIndex = i;
            break;
          }
        }

        console.log('Year header row found at index:', yearHeaderRowIndex);

        if (yearHeaderRowIndex === -1) {
          throw new Error('Impossible de trouver les en-têtes d\'années (2025, 2026, 2027) dans le fichier Excel.');
        }

        // Rechercher la ligne des périodes (MO 01, MO 02, Q 01, etc.)
        const periodHeaderRowIndex = yearHeaderRowIndex + 1;
        
        if (periodHeaderRowIndex >= jsonData.length) {
          throw new Error('Ligne des périodes non trouvée après les années.');
        }

        console.log('Period header row found at index:', periodHeaderRowIndex);
        console.log('Period header row data:', jsonData[periodHeaderRowIndex]);

        // Définir les lignes de données attendues pour Space
        const expectedRows = [
          'Cutting area',
          'Lead prep',
          'SCANIA',
          'CLAAS',
          'VW',
          'TOTAL AREA',
          'Occupation',
          'Available Area'
        ];

        // Rechercher les données pour chaque ligne attendue
        const tableData = [];
        const dataStartRow = periodHeaderRowIndex + 1;
        const usedRowIndexes = new Set(); // Pour éviter de réutiliser les mêmes lignes

        console.log('Looking for data starting from row:', dataStartRow);
        console.log('Expected row order:', expectedRows);

        expectedRows.forEach((expectedLabel, rowIndex) => {
          console.log(`\n=== Looking for row ${rowIndex + 1}: "${expectedLabel}" ===`);
          
          // Rechercher la ligne correspondante dans les données
          let foundRow = null;
          let foundRowIndex = -1;
          
          for (let i = dataStartRow; i < jsonData.length; i++) {
            if (usedRowIndexes.has(i)) {
              continue; // Ignorer les lignes déjà utilisées
            }
            const row = jsonData[i];
            if (row) {
              // Chercher dans la colonne A (index 0) ET dans la colonne B (index 1) 
              const cellValueA = row[0] ? String(row[0]).trim().toLowerCase() : '';
              const cellValueB = row[1] ? String(row[1]).trim().toLowerCase() : '';
              const expectedValue = expectedLabel.toLowerCase();
              
              // Recherche exacte ou partielle dans les deux colonnes
              const foundInA = cellValueA === expectedValue || 
                              cellValueA.includes(expectedValue) || 
                              expectedValue.includes(cellValueA);
              const foundInB = cellValueB === expectedValue || 
                              cellValueB.includes(expectedValue) || 
                              expectedValue.includes(cellValueB);
              
              if (foundInA || foundInB) {
                foundRow = row;
                foundRowIndex = i;
                const foundColumn = foundInA ? 'A' : 'B';
                console.log(`Found "${expectedLabel}" in column ${foundColumn} at row ${i}:`, row);
                usedRowIndexes.add(i); // Marquer cette ligne comme utilisée
                break;
              }
            }
          }

          // Extraire les valeurs pour cette ligne
          const values = [];
          
          if (foundRow) {
            console.log(`Processing row for ${expectedLabel}:`, foundRow);
            
            // Trouver le début des données - chercher la première cellule vide après les labels
            let dataStartCol = 1;
            
            // Pour les lignes SPACE (Cutting area, Lead prep) qui s'étendent sur 2 colonnes
            if (expectedLabel === 'Cutting area' || expectedLabel === 'Lead prep') {
              dataStartCol = 2; // Ignorer SPACE et Project
            }
            // Pour les lignes Assembly (SCANIA, CLAAS, VW) qui ont une catégorie
            else if (expectedLabel === 'SCANIA' || expectedLabel === 'CLAAS' || expectedLabel === 'VW') {
              dataStartCol = 2; // Ignorer Assembly et nom du projet
            }
            // Pour les lignes SUMMARY (TOTAL AREA, Occupation, Available Area)
            else if (expectedLabel === 'TOTAL AREA' || expectedLabel === 'Occupation' || expectedLabel === 'Available Area') {
              dataStartCol = 2; // Ignorer les 2 premières colonnes vides
            }
            
            console.log(`Data starts at column ${dataStartCol} for ${expectedLabel}`);
            
            // Commencer à partir de la colonne calculée
            for (let colIndex = dataStartCol; colIndex < foundRow.length && values.length < allPeriods.length; colIndex++) {
              const cellValue = foundRow[colIndex];
              
              // Traitement spécial des valeurs
              let processedValue = '';
              if (cellValue !== undefined && cellValue !== null) {
                if (typeof cellValue === 'number') {
                  // Si c'est un nombre
                  if (expectedLabel === 'Occupation' || expectedLabel === 'Available Area') {
                    // Pour les lignes de pourcentage, multiplier par 100 si c'est un décimal < 1
                    if (cellValue <= 1 && cellValue > 0) {
                      processedValue = Math.round(cellValue * 100);
                    } else {
                      processedValue = Math.round(cellValue);
                    }
                  } else {
                    // Pour les autres lignes, garder la valeur numérique
                    processedValue = Math.round(cellValue);
                  }
                } else {
                  // Si c'est une chaîne de caractères
                  const strValue = String(cellValue).trim();
                  if (strValue.includes('%')) {
                    // Si ça contient %, enlever le % et convertir en nombre
                    const numValue = parseFloat(strValue.replace('%', ''));
                    processedValue = isNaN(numValue) ? 0 : Math.round(numValue);
                  } else {
                    // Essayer de convertir en nombre
                    const numValue = parseFloat(strValue);
                    if (!isNaN(numValue)) {
                      processedValue = Math.round(numValue);
                    } else {
                      processedValue = strValue || 0;
                    }
                  }
                }
              } else {
                processedValue = 0;
              }
              
              values.push(processedValue);
              
              // Log détaillé pour les premières colonnes
              if (colIndex <= dataStartCol + 2) {
                console.log(`  Col ${colIndex}: ${cellValue} -> ${processedValue}`);
              }
            }
            
            // Compléter avec des valeurs zéro si nécessaire
            while (values.length < allPeriods.length) {
              values.push(0);
            }
          } else {
            // Si la ligne n'est pas trouvée, créer une ligne avec des zéros
            console.warn(`❌ Row "${expectedLabel}" not found in Excel data!`);
            console.log('Available rows in Excel:');
            for (let i = dataStartRow; i < Math.min(dataStartRow + 10, jsonData.length); i++) {
              const row = jsonData[i];
              if (row) {
                console.log(`  Row ${i}: A="${row[0] || ''}" B="${row[1] || ''}"`);
              }
            }
            console.log(`Creating empty row with zeros for "${expectedLabel}"`);
            for (let i = 0; i < allPeriods.length; i++) {
              values.push(0);
            }
          }

          tableData.push({
            label: expectedLabel,
            values: values.slice(0, allPeriods.length) // S'assurer qu'on n'a pas trop de valeurs
          });
          
          console.log(`Row "${expectedLabel}" processed:`, values);
        });

        console.log('Final table data:', tableData);

        // Créer les informations sur les années et périodes
        const years = ['2025', '2026', '2027'];
        const periods = {
          '2025': months2025,
          '2026': quarters2026,
          '2027': quarters2027
        };

        // Appeler la fonction de callback avec les données
        onDataImported({ tableData, years, periods });
        
        setIsLoading(false);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setError(error.message || 'Échec de l\'analyse du fichier Excel');
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError(t('errorFileFormat', 'Erreur de lecture du fichier'));
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          onClick={() => fileInputRef.current.click()}
          disabled={isLoading}
          sx={{ borderRadius: '8px', textTransform: 'none', padding: '8px 16px' }}
        >
          {isLoading ? t('infoImporting', 'Importation...') : t('Import Excel', 'Import Excel')}
        </Button>
        <Typography variant="caption" color="text.secondary">
          {t('dragDropFile', 'Télécharger le fichier Excel de planification d\'espace')}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ExcelImporter;