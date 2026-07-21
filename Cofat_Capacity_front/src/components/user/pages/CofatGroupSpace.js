import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getAuthHeaders } from '../../../utils/apiUtils';
import ResponsiveTable12Col from './ResponsiveTable12Col';
import './style/CofatGroupSpace.css';

const CofatGroupSpace = () => {
  const t = (key, def) => def || key; // Force English
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
  const [aiPrediction, setAiPrediction] = useState(false); // État pour l'IA
  const loadConsolidatedData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 CofatGroup Space - Chargement données consolidées...');

      const response = await fetch(`${API_BASE_URL}/api/cofat-group/space`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        }
      });

      if (!response.ok) throw new Error(`Failed to load consolidated data: ${response.status}`);

      const result = await response.json();
      console.log('📊 CofatGroup Space - Données reçues:', result);

      if (result.success && result.data) {
        setData(result.data);
        console.log(`✅ CofatGroup Space - Données consolidées chargées`);
        setSnackbar({ open: true, message: 'Données consolidées chargées avec succès', severity: 'success' });
      } else {
        throw new Error(result.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('❌ CofatGroup Space - Erreur de chargement:', err);
      setSnackbar({ open: true, message: `Erreur: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    loadConsolidatedData();
  }, []);

  const prepareChartData = () => {
    if (!data || !data.totals) return null;

    const years = Array.isArray(data.years) ? data.years : [];
    const periods = data.periods || {};
    const isMultiYear = years.length > 1;

    const labels = years.length > 0 && periods && typeof periods === 'object'
      ? years.flatMap(year => {
        const yearPeriods = Array.isArray(periods[year]) ? periods[year] : [];
        return yearPeriods.map(p => (isMultiYear ? `${year} ${p}` : p));
      })
      : (Array.isArray(data.months) ? data.months : []);

    const convertToPercent = (values) => {
      if (!values) return [];
      return values.map(val => {
        if (typeof val !== 'number') return 0;
        if (val < 1 && val > 0) return Math.round(val * 100);
        return Math.round(val);
      });
    };

    const occupationValues = Array.isArray(data.totals.occupation) ? data.totals.occupation : [];
    const availableValues = Array.isArray(data.totals.availableSpace) ? data.totals.availableSpace : [];

    const occupationPct = convertToPercent(occupationValues);

    const normalizedOccupationPct = labels.map((_, idx) => {
      const v = typeof occupationPct[idx] === 'number' ? occupationPct[idx] : 0;
      return Math.max(0, v);
    });

    const maxOccupation = normalizedOccupationPct.reduce((acc, v) => (typeof v === 'number' ? Math.max(acc, v) : acc), 0);

    const normalizedAvailable = labels.map((_, idx) => {
      const v = typeof availableValues[idx] === 'number' ? availableValues[idx] : 0;
      return Math.round(v) || 0;
    });

    const combinedData = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Occupation (%)',
          data: normalizedOccupationPct,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.55)',
          borderWidth: 1,
          yAxisID: 'y',
          order: 3
        },
        {
          type: 'bar',
          label: 'Available space (m²)',
          data: normalizedAvailable,
          backgroundColor: 'rgba(255, 99, 132, 0.55)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
          order: 4
        }
      ]
    };

    // 🔮 LOGIQUE IA SPACE 🔮
    if (aiPrediction) {
      const n = labels.length;
      if (n > 2) {
        // Prédiction Occupation
        const indices = labels.map((_, i) => i);
        const calcLR = (yData) => {
          let sX = 0, sY = 0, sXY = 0, sXX = 0;
          for (let i = 0; i < n; i++) {
            sX += i; sY += yData[i]; sXY += i * yData[i]; sXX += i * i;
          }
          const slope = (n * sXY - sX * sY) / (n * sXX - sX * sX);
          const intercept = (sY - slope * sX) / n;
          return { slope, intercept };
        };

        const occLR = calcLR(normalizedOccupationPct);
        const spaceLR = calcLR(normalizedAvailable);

        const futureLabels = ['2029 Q1', '2029 Q2', '2029 Q3', '2029 Q4', '2030 Q1', '2030 Q2', '2030 Q3', '2030 Q4'];
        combinedData.labels = [...labels, ...futureLabels];

        const totalPoints = n + futureLabels.length;
        const occTrend = [], spaceTrend = [];
        for (let i = 0; i < totalPoints; i++) {
          occTrend.push(Math.max(0, Math.round(occLR.slope * i + occLR.intercept)));
          spaceTrend.push(Math.max(0, Math.round(spaceLR.slope * i + spaceLR.intercept)));
        }

        combinedData.datasets.push({
          type: 'line',
          label: 'IA: Tendance Occupation (%)',
          data: occTrend,
          borderColor: '#9333ea', // Purple AI
          borderDash: [8, 4],
          tension: 0.4,
          yAxisID: 'y',
          pointStyle: 'triangle',
          pointRadius: 6,
          pointBackgroundColor: '#9333ea',
          order: 1
        });

        combinedData.datasets.push({
          type: 'line',
          label: 'IA: Tendance Espace (m²)',
          data: spaceTrend,
          borderColor: '#f59e0b', // Amber AI
          borderDash: [8, 4],
          tension: 0.4,
          yAxisID: 'y1',
          pointStyle: 'circle',
          pointRadius: 6,
          pointBackgroundColor: '#f59e0b',
          order: 2
        });
      }
    }

    return { combinedData, maxOccupation };
  };

  const chartOptions = (maxOccupation = 100) => ({
    scales: {
      y: {
        min: 0,
        suggestedMax: Math.max(100, Math.ceil(maxOccupation / 10) * 10),
        title: {
          display: true,
          text: 'Occupation (%)'
        },
        ticks: {
          callback: function (value) {
            return value + '%';
          }
        }
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Available space (m²)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.yAxisID === 'y') return `${ctx.dataset.label}: ${ctx.raw}%`;
            return `${ctx.dataset.label}: ${Math.round(ctx.raw)} m²`;
          }
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    maintainAspectRatio: false,
    responsive: true
  });

  // Construire les lignes du tableau
  const buildTableRows = () => {
    if (!data || !data.totals) return [];

    const rows = [];

    // 1. Cutting Area (somme)
    if (data.cuttingArea) {
      rows.push({
        type: 'category',
        category: 'SPACE',
        label: 'Cutting Area',
        values: data.cuttingArea || [],
        showCategory: true,
        rowspan: 2
      });
    }

    // 2. Lead Prep (somme)
    if (data.leadPrep) {
      rows.push({
        type: 'category',
        label: 'Lead Prep',
        values: data.leadPrep || [],
        showCategory: false
      });
    }

    // 3. Assembly Projects - TOUS les projets de TOUS les sites
    if (data.assemblyProjects && Array.isArray(data.assemblyProjects) && data.assemblyProjects.length > 0) {
      data.assemblyProjects.forEach((project, index) => {
        const isFirstProject = index === 0;

        rows.push({
          type: 'project',
          category: 'Assembly',
          label: `${project.name} (${project.site})`,
          values: project.values || [],
          showCategory: isFirstProject,
          rowspan: isFirstProject ? data.assemblyProjects.length : 1
        });
      });
    }

    // 4. Section Totaux
    if (data.totals) {
      const totalRows = [
        {
          type: 'subtotal',
          category: 'SUMMARY',
          label: 'S-Total Assembly',
          values: data.totals.sTotalAssembly || [],
          showCategory: true,
          rowspan: 5
        },
        {
          type: 'total',
          label: 'TOTAL AREA Needed',
          values: data.totals.totalAreaNeeded || [],
          showCategory: false
        },
        {
          type: 'summary',
          label: 'Total Area',
          values: data.totals.totalArea || [],
          showCategory: false
        },
        {
          type: 'summary',
          label: 'Occupation',
          values: data.totals.occupation || [],
          showCategory: false
        },
        {
          type: 'summary',
          label: 'Available Space',
          values: data.totals.availableSpace || [],
          showCategory: false
        }
      ];

      rows.push(...totalRows);
    }

    return rows;
  };

  // --- Fonctions d'export ---

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
      XLSX.utils.book_append_sheet(wb, ws, "Space Consolidation");

      const fileName = `Space_Consolidation_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      doc.text('COFAT GROUP - Consolidation Espace', 14, 15);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 22);

      const tableHead = [[t('space', 'SPACE'), t('project', 'Projet'), ...data.months]];
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
            if (rowType === 'subtotal') data.cell.styles.fillColor = [255, 243, 224];
            if (rowType === 'summary') data.cell.styles.fillColor = [232, 245, 233];
          }
        }
      });

      const fileName = `Space_Consolidation_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setSnackbar({ open: true, message: 'Export PDF réussi', severity: 'success' });
    } catch (err) {
      console.error('Export PDF Error:', err);
      setSnackbar({ open: true, message: 'Erreur lors de l\'export PDF', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Header & AI Integration */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 2 }}>
            COFAT GROUP - <span style={{ color: '#2563eb' }}>SPACE CONSOLIDATION</span>
          </Typography>
          <Tooltip title="Ouvrir l'Assistant Stratégique IA">
            <IconButton
              sx={{
                bgcolor: '#eff6ff', color: '#2563eb',
                border: '1px solid #dbeafe',
                '&:hover': { bgcolor: '#dbeafe' },
                width: 45, height: 45
              }}
              onClick={() => {
                // Pour déclencher l'assistant dans Layout, on peut utiliser un événement custom 
                // ou s'appuyer sur le fait que l'assistant est déjà là en mode logo.
                // Ici on ajoute juste le logo décoratif/informatif comme demandé.
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
                        <span className="export-item-subtitle">Graphiques saturation</span>
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
          categoryLabel={t('space', 'SPACE')}
          projectLabel={t('project', 'Projet')}
        />
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune donnée disponible
          </Typography>
        </Paper>
      )}

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            height: '80vh'
          }
        }}
      >
        <DialogTitle>Analyse d'Occupation et Espace Disponible</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: 'flex', flexDirection: 'column' }}
        >
          {(() => {
            const chartData = prepareChartData();
            if (!chartData) {
              return (
                <Typography variant="body2" color="text.secondary">
                  Aucune donnée disponible pour l'analyse. Vérifie que l'API répond et que la consolidation est chargée.
                </Typography>
              );
            }

            return (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Occupation (%) / Available space (m²)
                </Typography>
                <Box sx={{ height: 'calc(80vh - 180px)', width: '100%' }}>
                  <Bar data={chartData.combinedData} options={chartOptions(chartData.maxOccupation)} />
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Button
            variant={aiPrediction ? "contained" : "outlined"}
            size="small"
            startIcon={<span>{aiPrediction ? '🔴' : '✨'}</span>}
            onClick={() => {
              setAiPrediction(!aiPrediction);
              setSnackbar({ open: true, message: aiPrediction ? 'IA Désactivée' : '🔮 Prédictions IA activées sur le graphique !', severity: 'info' });
            }}
            sx={{
              borderRadius: '20px', textTransform: 'none', fontWeight: 600,
              background: aiPrediction ? 'linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)' : 'transparent',
              color: aiPrediction ? 'white' : '#1e3a8a',
              border: aiPrediction ? 'none' : '1px solid #dbeafe'
            }}
          >
            {aiPrediction ? 'Masquer Prédiction IA' : '✨ Activer Prédiction IA'}
          </Button>
          <Button onClick={() => setAnalysisOpen(false)} sx={{ textTransform: 'none' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CofatGroupSpace;
