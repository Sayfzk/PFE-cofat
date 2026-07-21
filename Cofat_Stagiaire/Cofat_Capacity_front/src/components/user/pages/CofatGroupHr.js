// src/components/user/pages/CofatGroupHr.js
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getAuthHeaders } from '../../../utils/apiUtils';
import useTheme from '../../../hooks/useTheme';
import ResponsiveTable12Col from './ResponsiveTable12Col';
import './style/HrTable.css';
import './style/HrTable_dark.css';
import './style/CofatGroupSpace.css';

const CofatGroupHr = () => {
  const t = (key, def) => def || key; // Force English
  const { theme: appTheme } = useTheme();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:9001'
      : 'http://172.23.23.31:9001');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(false); // IA State

  const loadConsolidatedData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 CofatGroup HR - Chargement données consolidées...');

      const response = await fetch(`${API_BASE_URL}/api/cofat-group/hr`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        }
      });

      if (!response.ok) throw new Error(`Failed to load consolidated data: ${response.status}`);

      const result = await response.json();
      console.log('📊 CofatGroup HR - Données reçues:', result);

      if (result.success && result.data) {
        setData(result.data);
        console.log(`✅ CofatGroup HR - Données consolidées chargées`);
        setSnackbar({ open: true, message: 'Données HR consolidées chargées avec succès', severity: 'success' });
      } else {
        throw new Error(result.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('❌ CofatGroup HR - Erreur de chargement:', err);
      setSnackbar({ open: true, message: `Erreur: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    loadConsolidatedData();
  }, [loadConsolidatedData]);

  // Construire les lignes du tableau
  const buildTableRows = () => {
    if (!data || !data.categories || !data.totals) return [];

    const rows = [];

    // 1. Section Direct
    if (data.categories['Direct'] && data.categories['Direct'].length > 0) {
      data.categories['Direct'].forEach((row, index) => {
        rows.push({
          type: 'category',
          category: index === 0 ? 'Direct' : undefined,
          label: row.type,
          values: row.values || [],
          showCategory: index === 0,
          rowspan: index === 0 ? data.categories['Direct'].length : 1
        });
      });
    }

    // 1b. Ligne T-Direct (somme de toutes les lignes Direct)
    if (data.categories['Direct'] && data.categories['Direct'].length > 0) {
      rows.push({
        type: 'subtotal',
        category: 'T-Direct',
        label: 'T-Direct',
        values: data.totals.direct || [],
        showCategory: true,
        rowspan: 1
      });
    }

    // 2. Section Assembly Direct - Lister tous les projets séparément
    if (data.categories['Assembly Direct'] && data.categories['Assembly Direct'].length > 0) {
      data.categories['Assembly Direct'].forEach((row, index) => {
        rows.push({
          type: 'project',
          category: index === 0 ? 'Assembly Direct' : undefined,
          label: row.displayLabel || `${row.type} (${row.site})`, // Utiliser displayLabel avec le nom du site
          values: row.values || [],
          showCategory: index === 0,
          rowspan: index === 0 ? data.categories['Assembly Direct'].length : 1
        });
      });
    }

    // 3. Ligne S-Total Assembly
    rows.push({
      type: 'subtotal',
      category: 'S-Total Assembly',
      label: 'S-Total Assembly',
      values: data.totals.sTotalAssembly || [],
      showCategory: true,
      rowspan: 1
    });

    // 4. Section Indirect
    if (data.categories['Indirect'] && data.categories['Indirect'].length > 0) {
      data.categories['Indirect'].forEach((row, index) => {
        rows.push({
          type: 'category',
          category: index === 0 ? 'Indirect' : undefined,
          label: row.type,
          values: row.values || [],
          showCategory: index === 0,
          rowspan: index === 0 ? data.categories['Indirect'].length : 1
        });
      });

      // 5b. Ligne T-Indirect (somme de toutes les lignes Indirect)
      rows.push({
        type: 'subtotal',
        category: 'T-Indirect',
        label: 'T-Indirect',
        values: data.totals.indirect || [],
        showCategory: true,
        rowspan: 1
      });
    }

    // 6. Ligne S-Total (comme S-Total Assembly)
    rows.push({
      type: 'subtotal',
      category: 'S-Total',
      label: 'S-Total',
      values: data.totals.sTotal || [],
      showCategory: true,
      rowspan: 1
    });

    // 7. Ligne Total Plant (comme S-Total Assembly)
    rows.push({
      type: 'subtotal',
      category: 'Total Plant',
      label: 'Total Plant',
      values: data.totals.totalPlant || [],
      showCategory: true,
      rowspan: 1
    });

    return rows;
  };

  // --- Graphique : S-Total / T-Direct / Total Plant ---
  const buildChartData = () => {
    if (!data || !data.totals || !data.months) return null;
    const chartData = {
      labels: data.months,
      datasets: [
        {
          type: 'bar',
          label: 'S-Total',
          data: data.totals.sTotal || [],
          backgroundColor: 'rgba(25, 118, 210, 0.75)',
          borderColor: '#1565c0',
          borderWidth: 1,
          order: 2
        },
        {
          type: 'bar',
          label: 'T-Indirect',
          data: data.totals.indirect || [],
          backgroundColor: 'rgba(56, 142, 60, 0.75)',
          borderColor: '#1b5e20',
          borderWidth: 1,
          order: 3
        },
        {
          type: 'line',
          label: 'Total Plant',
          data: data.totals.totalPlant || [],
          borderColor: '#e91e63',
          backgroundColor: 'rgba(233, 30, 99, 0.12)',
          borderWidth: 3,
          pointBackgroundColor: '#e91e63',
          pointRadius: 5,
          tension: 0.3,
          fill: false,
          order: 1
        }
      ]
    };

    // 🔮 IA HR PREDICTION 🔮
    if (aiPrediction) {
      const n = data.months.length;
      if (n > 2) {
        const futureLabels = ['2029 Q1', '2029 Q2', '2029 Q3', '2030 Q1', '2030 Q2', '2030 Q3'];
        chartData.labels = [...data.months, ...futureLabels];
        const totalPoints = n + futureLabels.length;

        const predict = (yData) => {
          let sX = 0, sY = 0, sXY = 0, sXX = 0;
          for (let i = 0; i < n; i++) {
            const val = yData[i] || 0;
            sX += i; sY += val; sXY += i * val; sXX += i * i;
          }
          const slope = (n * sXY - sX * sY) / (n * sXX - sX * sX);
          const intercept = (sY - slope * sX) / n;
          const trend = [];
          for (let i = 0; i < totalPoints; i++) {
            trend.push(Math.max(0, Math.round(slope * i + intercept)));
          }
          return trend;
        };

        // 1. Prediction Total Plant
        if (data.totals.totalPlant) {
          chartData.datasets.push({
            type: 'line',
            label: 'IA: Tendance Total Plant',
            data: predict(data.totals.totalPlant),
            borderColor: '#e91e63',
            borderDash: [8, 4],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 6,
            pointStyle: 'triangle',
            order: 0
          });
        }

        // 2. Prediction S-Total
        if (data.totals.sTotal) {
          chartData.datasets.push({
            type: 'line',
            label: 'IA: Tendance S-Total',
            data: predict(data.totals.sTotal),
            borderColor: '#1565c0',
            borderDash: [8, 4],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 6,
            pointStyle: 'triangle',
            order: 0
          });
        }

        // 3. Prediction T-Indirect
        if (data.totals.indirect) {
          chartData.datasets.push({
            type: 'line',
            label: 'IA: Tendance T-Indirect',
            data: predict(data.totals.indirect),
            borderColor: '#1b5e20',
            borderDash: [8, 4],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 6,
            pointStyle: 'triangle',
            order: 0
          });
        }
      }
    }

    return chartData;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 20, font: { size: 13 } }
      },
      title: {
        display: true,
        text: 'Consolidation RH — S-Total | T-Indirect | Total Plant',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 16 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Math.round(ctx.parsed.y)} effectifs`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Effectifs', font: { size: 12 } },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  };


  const exportToExcel = () => {
    try {
      if (!data) return;

      const rows = buildTableRows();
      const exportData = [];

      // En-têtes secondaires (mois)
      const monthRow = ['', '', ...data.months];
      exportData.push(monthRow);

      rows.forEach(row => {
        if (!row.values) return;
        const rowData = [row.category || '', row.label || ''];
        row.values.forEach(val => {
          rowData.push(typeof val === 'number' ? Math.round(val) : val);
        });
        exportData.push(rowData);
      });

      const ws = XLSX.utils.aoa_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RH Consolidation");

      const fileName = `RH_Consolidation_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setSnackbar({ open: true, message: 'Export Excel réussi', severity: 'success' });
    } catch (err) {
      console.error('Export Excel Error:', err);
      setSnackbar({ open: true, message: 'Erreur lors de l\'export Excel', severity: 'error' });
    }
  };

  const exportToPDF = () => {
    try {
      if (!data) return;

      const doc = new jsPDF('l', 'mm', 'a4');
      const rows = buildTableRows();

      doc.setFontSize(16);
      doc.text('COFAT GROUP - Consolidation RH', 14, 15);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 22);

      const tableHead = [[t('hrModule', 'Module RH'), t('project', 'Projet'), ...data.months]];
      const tableBody = rows.map(row => [
        row.showCategory ? row.category : '',
        row.label,
        ...(row.values || []).map(v => typeof v === 'number' ? Math.round(v) : v)
      ]);

      doc.autoTable({
        startY: 30,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: [25, 118, 210], color: [255, 255, 255] },
        didParseCell: function (data) {
          // Styling for total/summary rows in PDF
          const rowIndex = data.row.index;
          const rowType = rows[rowIndex]?.type;
          if (rowType === 'total' || rowType === 'subtotal' || rowType === 'summary') {
            data.cell.styles.fontStyle = 'bold';
            if (rowType === 'total') data.cell.styles.fillColor = [255, 235, 238];
            if (rowType === 'subtotal') data.cell.styles.fillColor = [251, 233, 231]; // Tinte RH
          }
        }
      });

      const fileName = `RH_Consolidation_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setSnackbar({ open: true, message: 'Export PDF réussi', severity: 'success' });
    } catch (err) {
      console.error('Export PDF Error:', err);
      setSnackbar({ open: true, message: 'Erreur lors de l\'export PDF', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }} className="hr-table-container" data-theme={appTheme}>
      {/* Main Header & AI Integration */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 2 }}>
            COFAT GROUP - <span style={{ color: '#e91e63' }}>HR CONSOLIDATION</span>
          </Typography>
          <Tooltip title="Ouvrir l'Assistant Stratégique IA">
            <IconButton
              sx={{
                bgcolor: '#fff1f2', color: '#e91e63',
                border: '1px solid #ffe4e6',
                '&:hover': { bgcolor: '#ffe4e6' },
                width: 45, height: 45
              }}
            >
              <AutoAwesomeIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Paper elevation={0} sx={{ p: 0.5, bgcolor: '#f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 1 }}>

            {/* Export Dropdown Group */}
            <div className="export-actions-container" style={{ margin: 0 }}>
              <div className="export-dropdown-wrapper">
                <button
                  className="export-dropdown-button"
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsExportDropdownOpen(false), 200)}
                  disabled={loading || !data}
                  style={{ height: '36px', borderRadius: '10px' }}
                >
                  <span className="export-button-icon">📊</span>
                  <span className="export-button-text">Actions</span>
                  <ChevronDown size={16} className={`export-chevron ${isExportDropdownOpen ? 'open' : ''}`} />
                </button>

                {isExportDropdownOpen && (
                  <div className="export-dropdown-menu" style={{ top: 'calc(100% + 8px)' }}>
                    <button className="export-dropdown-item excel" onClick={() => exportToExcel()}>
                      <TableChartIcon className="export-item-icon" />
                      <div className="export-item-content">
                        <span className="export-item-title">Excel</span>
                        <span className="export-item-subtitle">Exporter le bilan</span>
                      </div>
                    </button>
                    <button className="export-dropdown-item pdf" onClick={() => exportToPDF()}>
                      <PictureAsPdfIcon className="export-item-icon" />
                      <div className="export-item-content">
                        <span className="export-item-title">PDF</span>
                        <span className="export-item-subtitle">Format PDF pro</span>
                      </div>
                    </button>
                    <button className="export-dropdown-item analyse" onClick={() => setAnalysisOpen(true)}>
                      <AnalyticsIcon className="export-item-icon" />
                      <div className="export-item-content">
                        <span className="export-item-title">Analyse</span>
                        <span className="export-item-subtitle">Graphiques effectifs</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
          </Paper>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : data ? (
        <ResponsiveTable12Col
          yearHeaders={
            data.years && data.periods
              ? data.years.map(year => ({
                year: year.toString(),
                colspan: data.periods[year] ? data.periods[year].length : 0
              }))
              : [{ year: '2026', colspan: 12 }]
          }
          monthHeaders={data.months || []}
          rows={buildTableRows()}
          categoryLabel={t('hrModule', 'Module RH')}
          projectLabel={t('project', 'Projet')}
        />
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune donnée disponible
          </Typography>
        </Paper>
      )}

      {/* Dialog Analyse — graphique S-Total / T-Direct / Total Plant */}
      <Dialog
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>Analyse Consolidation RH — S-Total | T-Direct | Total Plant</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column' }}>
          {buildChartData() ? (
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Box sx={{ height: 'calc(80vh - 180px)', width: '100%' }}>
                <Bar data={buildChartData()} options={chartOptions} />
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucune donnée disponible pour l'analyse.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Button
            variant={aiPrediction ? "contained" : "outlined"}
            size="small"
            startIcon={<span>{aiPrediction ? '🔴' : '✨'}</span>}
            onClick={() => {
              setAiPrediction(!aiPrediction);
              setSnackbar({ open: true, message: aiPrediction ? 'IA Désactivée' : '🔮 Prédictions IA activées sur le graphique !', severity: 'success' });
            }}
            sx={{
              borderRadius: '20px', textTransform: 'none', fontWeight: 600,
              background: aiPrediction ? 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)' : 'transparent',
              color: aiPrediction ? 'white' : '#FF9800',
              border: aiPrediction ? 'none' : '1px solid #ffe0b2'
            }}
          >
            {aiPrediction ? 'Masquer Prédiction IA' : '✨ Activer Prédiction IA'}
          </Button>
          <Button onClick={() => setAnalysisOpen(false)} sx={{ textTransform: 'none' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CofatGroupHr;
