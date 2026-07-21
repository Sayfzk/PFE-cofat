import React, { useRef, useState } from 'react';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as XLSX from 'xlsx';

const ExcelImporterHR = ({ onDataImported }) => {
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        console.log('💾 Excel HR data loaded - Total rows:', jsonData.length);
        console.log('📊 First 10 rows:', jsonData.slice(0, 10));

        // Filtrer les lignes complètement vides
        const nonEmptyRows = jsonData.filter(row =>
          row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
        );

        console.log('📊 Non-empty rows:', nonEmptyRows.length);
        console.log('📊 First 5 non-empty rows:', nonEmptyRows.slice(0, 5));

        if (nonEmptyRows.length < 2) {
          console.error('❌ Fichier vide - Rows totales:', jsonData.length, 'Rows non-vides:', nonEmptyRows.length);
          throw new Error('Le fichier Excel est vide ou ne contient pas de données.');
        }

        // Utiliser les lignes non-vides pour la suite
        const cleanedData = nonEmptyRows;

        // Extraire dynamiquement les périodes depuis le fichier Excel

        // Rechercher la ligne contenant les années (2025, 2026, 2027)
        let yearHeaderRowIndex = -1;
        for (let i = 0; i < cleanedData.length; i++) {
          const row = cleanedData[i];
          if (row && row.some(cell =>
            cell && ['2026', '2027', '2028'].includes(String(cell).toString().trim())
          )) {
            yearHeaderRowIndex = i;
            console.log('📅 Year header row found at index:', i, '- Content:', row);
            break;
          }
        }

        if (yearHeaderRowIndex === -1) {
          console.error('❌ Années non trouvées. Voici toutes les lignes:');
          cleanedData.forEach((row, idx) => {
            console.log(`  Row ${idx}:`, row.slice(0, 10));
          });
          throw new Error('Impossible de trouver les en-têtes d\'années (2026, 2027, 2028) dans le fichier Excel. Vérifiez que le fichier contient bien ces années dans une ligne.');
        }

        // Rechercher la ligne des périodes (MO 01, MO 02, Q 01, etc.)
        const periodHeaderRowIndex = yearHeaderRowIndex + 1;

        if (periodHeaderRowIndex >= cleanedData.length) {
          console.error('❌ Pas assez de lignes après les années');
          throw new Error('Ligne des périodes non trouvée après les années.');
        }

        console.log('📆 Period header row found at index:', periodHeaderRowIndex);
        console.log('📆 Period header row data:', cleanedData[periodHeaderRowIndex]);

        // Extraire dynamiquement les années et leurs colonnes
        const yearRow = cleanedData[yearHeaderRowIndex];
        const periodRow = cleanedData[periodHeaderRowIndex];

        const years = [];
        const periods = {};
        const yearColSpans = {};

        let currentYear = null;
        let yearStartCol = -1;

        // Parcourir les colonnes pour identifier les années et leurs périodes
        for (let col = 2; col < yearRow.length; col++) {
          const yearCell = yearRow[col];
          const yearValue = yearCell ? String(yearCell).trim() : '';

          if (['2026', '2027', '2028'].includes(yearValue)) {
            // Sauvegarder l'année précédente si elle existe
            if (currentYear && yearStartCol !== -1) {
              const yearPeriods = [];
              for (let i = yearStartCol; i < col; i++) {
                const period = periodRow[i] ? String(periodRow[i]).trim() : '';
                if (period) {
                  yearPeriods.push(period);
                }
              }
              periods[currentYear] = yearPeriods;
              yearColSpans[currentYear] = yearPeriods.length;
            }

            // Nouvelle année
            currentYear = yearValue;
            yearStartCol = col;
            if (!years.includes(yearValue)) {
              years.push(yearValue);
            }
          }
        }

        // Traiter la dernière année
        if (currentYear && yearStartCol !== -1) {
          const yearPeriods = [];
          for (let i = yearStartCol; i < periodRow.length; i++) {
            const period = periodRow[i] ? String(periodRow[i]).trim() : '';
            if (period) {
              yearPeriods.push(period);
            }
          }
          periods[currentYear] = yearPeriods;
          yearColSpans[currentYear] = yearPeriods.length;
        }

        const allPeriods = Object.values(periods).flat();

        console.log('📅 Années extraites:', years);
        console.log('📆 Périodes extraites:', periods);
        console.log('📊 Total périodes:', allPeriods.length);

        // Extraire dynamiquement toutes les lignes de données depuis le fichier Excel
        const tableData = [];
        const dataStartRow = periodHeaderRowIndex + 1;

        console.log('🔍 Extraction dynamique des lignes HR à partir de la ligne:', dataStartRow);
        console.log('🔍 Total lignes à traiter:', cleanedData.length - dataStartRow);

        let currentCategory = null;

        for (let rowIndex = dataStartRow; rowIndex < cleanedData.length; rowIndex++) {
          const row = cleanedData[rowIndex];
          if (!row || row.length < 3) continue; // Ignorer les lignes vides ou trop courtes

          const colA = row[0] ? String(row[0]).trim() : '';
          const colB = row[1] ? String(row[1]).trim() : '';

          // Ignorer les lignes complètement vides
          if (!colA && !colB) continue;

          // Déterminer la catégorie et le label
          let category = '';
          let label = '';

          // Si colA est remplie et colB aussi, colA est la catégorie
          if (colA && colB) {
            category = colA;
            label = colB;
            currentCategory = category;
          }
          // Si seulement colB est remplie, utiliser la catégorie précédente
          else if (!colA && colB) {
            category = currentCategory || '';
            label = colB;
          }
          // Si seulement colA est remplie, c'est une ligne spéciale (S-Total, Total Plant, etc.)
          else if (colA && !colB) {
            category = colA;
            label = colA;
            currentCategory = null; // Reset pour les lignes spéciales
          }

          // Extraire les valeurs numériques
          const values = [];
          const dataStartCol = 2; // Les données commencent à la colonne C (index 2)

          for (let colIndex = dataStartCol; colIndex < row.length && values.length < allPeriods.length; colIndex++) {
            const cellValue = row[colIndex];

            let processedValue = 0;
            if (cellValue !== undefined && cellValue !== null) {
              if (typeof cellValue === 'number') {
                processedValue = Math.round(cellValue);
              } else {
                const strValue = String(cellValue).trim();
                const numValue = parseFloat(strValue);
                if (!isNaN(numValue)) {
                  processedValue = Math.round(numValue);
                }
              }
            }

            values.push(processedValue);
          }

          // Compléter avec des zéros si nécessaire
          while (values.length < allPeriods.length) {
            values.push(0);
          }

          // Ajouter la ligne au tableau
          if (label) {
            tableData.push({
              category: category,
              label: label,
              values: values.slice(0, allPeriods.length)
            });

            console.log(`✅ Ligne extraite: [${category}] ${label} - ${values.filter(v => v !== 0).length} valeurs non-zéro`);
          }
        }

        console.log('📊 Données HR finales extraites:', tableData.length, 'lignes');
        console.log('📊 Structure:', tableData.map(r => `[${r.category}] ${r.label}`));

        // Appeler la fonction de callback avec les données HR dynamiques
        onDataImported({ tableData, years, periods, yearColSpans });

        setIsLoading(false);

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

      } catch (error) {
        console.error('❌ Error parsing HR Excel file:', error);
        setError(error.message || 'Échec de l\'analyse du fichier Excel HR');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Erreur de lecture du fichier');
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
          {isLoading ? 'Importation HR...' : 'Import Excel'}
        </Button>
        <Typography variant="caption" color="text.secondary">
          Télécharger le fichier Excel de planification HR
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

export default ExcelImporterHR;