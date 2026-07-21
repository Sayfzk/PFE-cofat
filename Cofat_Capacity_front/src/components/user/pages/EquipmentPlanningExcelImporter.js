import React, { useRef, useState } from 'react';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

/*
  EquipmentPlanningExcelImporter
  - Parse a simplified Excel layout specific to Equipment Planning.
  - Expected logical rows (labels can appear in col A or B):
      - "Machine need"
      - "Available machine"
      - "To order"
      - "Load (Occupation)" (also accepts "Load" or "Occupation")
  - Values are read as 20 periods (12 months of 2025 + 4 quarters of 2026 + 4 quarters of 2027).
  - Missing values are left as empty string "" to keep UI inputs empty.
  - This component does not affect the existing Space module importer.
*/

const EquipmentPlanningExcelImporter = ({ onDataImported }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Periods used by Equipment Planning UI
  const months2026 = Array.from({ length: 12 }, (_, i) => `MO ${String(i + 1).padStart(2, '0')}`);
  const quarters2027 = ['Q 01', 'Q 02', 'Q 03', 'Q 04'];
  // Use distinct labels for 2028 to align with SiteTable's allPeriods indexing
  const quarters2028 = ['Q 05', 'Q 06', 'Q 07', 'Q 08'];
  const allPeriodsLength = months2026.length + quarters2027.length + quarters2028.length; // 20

  const normalize = (v) => (v === undefined || v === null) ? '' : String(v).trim();
  const toLower = (v) => normalize(v).toLowerCase();

  const matchesLabel = (cell, targets) => {
    const val = toLower(cell);
    return targets.some(t => val === t || val.includes(t));
  };

  // Update parseRowValues to accept a shouldRoundToInteger flag
  const parseRowValues = (row, labelColIndex, shouldRoundToInteger = false) => {
    // Start reading from the next column after the label cell.
    // Find first numeric value as a robust start point.
    let startCol = labelColIndex + 1;

    for (let c = labelColIndex + 1; c < row.length; c++) {
      const raw = row[c];
      if (raw === undefined || raw === null) continue;
      const str = normalize(raw);
      const isNum = typeof raw === 'number' || (!isNaN(parseFloat(str)) && isFinite(str));
      if (isNum) {
        startCol = c;
        break;
      }
    }

    const values = [];
    for (let c = startCol; c < row.length && values.length < allPeriodsLength; c++) {
      const cell = row[c];
      if (cell === undefined || cell === null || normalize(cell) === '') {
        values.push('');
      } else if (typeof cell === 'number') {
        // Apply rounding if requested
        if (shouldRoundToInteger) {
          // Round to nearest integer (1.26 -> 1, 0.58 -> 1)
          // Even if it is already an integer (1), Math.round(1) = 1, so it is safe.
          values.push(String(Math.round(cell)));
        } else {
          values.push(String(cell));
        }
      } else {
        const str = normalize(cell);
        const num = parseFloat(str.replace('%', '').replace(',', '.'));
        if (!isNaN(num)) {
          if (shouldRoundToInteger) {
            // Round parsed number to integer
            values.push(String(Math.round(num)));
          } else {
            values.push(String(num));
          }
        } else {
          // Non numeric content: treat as empty to not pollute inputs
          values.push('');
        }
      }
    }

    // Pad to expected length with empty strings
    while (values.length < allPeriodsLength) values.push('');

    return values.slice(0, allPeriodsLength);
  };

  const extractLabeledRow = (jsonData, labelTargets, shouldRoundToInteger = false) => {
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row) continue;

      // Check first 3 columns for label presence to be tolerant
      for (let col = 0; col < Math.min(3, row.length); col++) {
        if (matchesLabel(row[col], labelTargets)) {
          return { index: i, values: parseRowValues(row, col, shouldRoundToInteger) };
        }
      }
    }
    return null;
  };

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

        if (!jsonData || jsonData.length === 0) {
          throw new Error("Le fichier Excel est vide ou illisible.");
        }

        // Extract the four expected rows
        // Apply rounding ONLY to Machine need as requested (1.26 -> 1)
        const machineNeed = extractLabeledRow(jsonData, ['machine need'], true);
        const availableMachine = extractLabeledRow(jsonData, ['available machine', 'available machines'], false);
        const toOrder = extractLabeledRow(jsonData, ['to order', 'order to', 'machines to order'], false);
        const loadOcc = extractLabeledRow(jsonData, ['load (occupation)', 'load', 'occupation'], false);

        if (!machineNeed || !availableMachine || !toOrder || !loadOcc) {
          const missing = [
            !machineNeed && 'Machine need',
            !availableMachine && 'Available machine',
            !toOrder && 'To order',
            !loadOcc && 'Load (Occupation)'
          ].filter(Boolean).join(', ');
          throw new Error(`Lignes manquantes ou non reconnues dans le fichier Excel: ${missing}`);
        }

        // Special handling: some files may have a single value for "To order".
        // If only the first cell has a value and others are empty, keep it as-is (UI will show it only for the first period).
        // Ensure all arrays are exactly 20 values long.
        const tableData = [
          { label: 'Machine need', values: machineNeed.values },
          { label: 'Available machine', values: availableMachine.values },
          { label: 'To order', values: toOrder.values },
          { label: 'Load (Occupation)', values: loadOcc.values.map(v => v === '' ? '' : String(parseFloat(v))) },
        ];

        const years = ['2026', '2027', '2028'];
        const periods = { '2026': months2026, '2027': quarters2027, '2028': quarters2028 };

        onDataImported({ tableData, years, periods });

        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error('EquipmentPlanningExcelImporter - error:', err);
        setError(err.message || t('errorFileFormat', 'Échec de l\'analyse du fichier Excel'));
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
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          sx={{ borderRadius: '8px', textTransform: 'none', padding: '8px 16px' }}
        >
          {isLoading ? t('infoImporting', 'Importation...') : t('importExcelEquipment', 'Import Excel (Equipment Planning)')}
        </Button>
        <Typography variant="caption" color="text.secondary">
          {t('importEquipmentFile', 'Importer un fichier Excel pour le module Equipment Planning')}
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

export default EquipmentPlanningExcelImporter;
