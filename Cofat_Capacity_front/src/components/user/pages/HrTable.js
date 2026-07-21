// src/components/user/pages/HRTable.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Compatible avec React 19
import './style/HrTable.css';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Snackbar,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useAuth } from '../../../Context/AuthContext';
import MuiAlert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import ExcelImporterHR from './ExcelImporterHR';
import { getAuthHeaders } from '../../../utils/apiUtils';
import notificationService from '../../../services/NotificationService';
import useTheme from '../../../hooks/useTheme';
import LanguageIcon from '@mui/icons-material/Language';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import useNotifications from '../../../hooks/useNotifications';
import './style/HrTable.css';
import './style/HrTable_dark.css';

const API_BASE_URL = 'http://172.23.23.31:9001';

// Créer un composant Alert avec forwardRef pour React 19
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const HRTable = () => {
  const { site } = useParams();
  const { t, i18n } = useTranslation();
  const { theme: appTheme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();
  const { notifySaveSuccess, notifyDeleteSuccess, notifyError } = useNotifications('HR');

  console.log(`👥 HRTable - Site actuel: ${site}`);
  // State pour les sites disponibles
  const [availableSites, setAvailableSites] = useState([]);
  const [siteCode, setSiteCode] = useState(null);

  // Structure dynamique du tableau HR - sera définie par le fichier Excel importé
  // Chaque site peut avoir sa propre structure
  const getEmptyTableStructure = () => [];

  const initialTableStructure = getEmptyTableStructure();

  console.log('📊 Structure HR initiale vide - sera remplie par l\'import Excel ou la base de données');

  const [data, setData] = useState({
    tableData: [...initialTableStructure],
    years: [],
    periods: {},
    yearColSpans: {}
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(false); // IA State

  console.log('⚙️ Module HR - Structure DYNAMIQUE: chaque site peut avoir sa propre structure de tableau définie par le fichier Excel importé');

  // Aliases pour les sites (URL -> Nom en base)
  const siteAliases = {
    'cofatec': 'Mexique',
    'mateur': 'Mateur',
    'tunis': 'Tunis',
    'brazil': 'Brazil',
    'egypt': 'Egypt',
    'kairouan': 'Kairouan',
    'maroc': 'Maroc',
    'nogales': 'Nogales'
  };

  // Charger les sites disponibles depuis l'API
  const loadAvailableSites = async () => {
    try {
      console.log('🌍 HR - Chargement des sites disponibles...');
      const res = await fetch(`${API_BASE_URL}/api/sites`);
      if (!res.ok) throw new Error('Failed to load sites');
      const result = await res.json();

      if (result.success && result.data) {
        setAvailableSites(result.data);
        console.log('✅ Sites chargés pour HR:', result.data.map(s => `${s.nom} (${s.code})`));

        // Trouver le siteCode pour le site actuel
        const siteParam = site.toLowerCase();
        const targetSiteName = siteAliases[siteParam] || site; // Utiliser alias ou nom direct

        console.log(`🔍 HR - Recherche du site: URL="${site}" -> Cible="${targetSiteName}"`);

        const currentSite = result.data.find(s =>
          s.nom.toLowerCase() === targetSiteName.toLowerCase() ||
          s.code.toLowerCase() === siteParam ||
          s.nom.toLowerCase() === siteParam
        );

        if (currentSite) {
          setSiteCode(currentSite.code);
          console.log(`✅ HR - Site trouvé: ${currentSite.nom} (${currentSite.code})`);
        } else {
          console.error(`❌ HR - Site "${site}" non trouvé dans:`, result.data.map(s => s.nom));
          setSiteCode(null);
        }
      }
    } catch (err) {
      console.error('Erreur chargement sites HR:', err);
      setSnackbar({ open: true, message: 'Erreur de chargement des sites HR', severity: 'error' });
    }
  };

  const loadData = async () => {
    console.log(`📊 HR LoadData appelé pour le site: ${siteCode}`);
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/hr/site/${siteCode}`;
      console.log(`🌐 HR Appel API: ${url}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load HR data: ${res.status} ${res.statusText}`);
      const result = await res.json();
      console.log(`📊 Résultat API HR pour ${siteCode}:`, result);

      if (result.success && result.data.length > 0) {
        console.log(`✅ Données HR trouvées pour ${siteCode}: ${result.data.length} entrées`);

        // Extraire la structure unique depuis la base de données en préservant l'ordre
        const uniqueRows = new Map();
        const yearsSet = new Set();
        const periodsMap = {};

        result.data.forEach(item => {
          // Collecter les lignes uniques avec leur catégorie et ordre
          const key = item.type;
          if (!uniqueRows.has(key)) {
            uniqueRows.set(key, {
              label: item.type,
              category: item.category || item.type,
              values: [],
              rowOrder: item.rowOrder || 0
            });
          }

          // Collecter les années et périodes
          yearsSet.add(item.year);
          if (!periodsMap[item.year]) {
            periodsMap[item.year] = new Set();
          }
          periodsMap[item.year].add(item.month);
        });

        // Construire la structure des périodes
        const years = Array.from(yearsSet).sort();
        const periods = {};
        const yearColSpans = {};

        years.forEach(year => {
          const yearPeriods = Array.from(periodsMap[year]).sort();
          periods[String(year)] = yearPeriods;
          yearColSpans[String(year)] = yearPeriods.length;
        });

        const allPeriods = Object.values(periods).flat();
        const totalColumns = allPeriods.length;

        console.log('📊 Structure extraite de la base:', {
          lignes: uniqueRows.size,
          années: years,
          périodes: periods,
          totalColonnes: totalColumns
        });

        // Initialiser les valeurs à zéro et trier par rowOrder
        const loadedData = Array.from(uniqueRows.values())
          .sort((a, b) => a.rowOrder - b.rowOrder)
          .map(row => ({
            label: row.label,
            category: row.category,
            values: new Array(totalColumns).fill(0)
          }));

        // Remplir les valeurs depuis la base
        result.data.forEach(item => {
          const rowIndex = loadedData.findIndex(row => row.label === item.type);
          if (rowIndex !== -1) {
            // Calculer l'index de colonne
            let columnIndex = 0;
            for (const year of years) {
              if (item.year === year) {
                const yearPeriods = periods[String(year)];
                const periodIndex = yearPeriods.indexOf(item.month);
                if (periodIndex !== -1) {
                  loadedData[rowIndex].values[columnIndex + periodIndex] = item.count;
                }
                break;
              }
              columnIndex += periods[String(year)].length;
            }
          }
        });

        console.log('✅ Structure HR complète chargée depuis la base:', loadedData.length, 'lignes');
        setData({ tableData: loadedData, years: years.map(String), periods, yearColSpans });
      } else {
        console.log(`🏴 Aucune donnée HR trouvée pour ${siteCode}, structure vide`);
        setData({ tableData: [], years: [], periods: {}, yearColSpans: {} });
      }
    } catch (err) {
      console.error('HR Load error:', err);
      setSnackbar({ open: true, message: t('errorLoadingData', 'Erreur lors du chargement: ') + err.message, severity: 'error' });

      // Utiliser une structure vide en cas d'erreur
      console.log(`❌ Erreur de chargement HR pour ${siteCode}, structure vide`);
      setData({ tableData: [], years: [], periods: {}, yearColSpans: {} });
    } finally {
      setLoading(false);
    }
  };

  const handleDataImported = (importedData) => {
    console.log('📊 Données HR importées par ExcelImporterHR:', importedData);

    try {
      const { tableData: importedTableData, years, periods, yearColSpans } = importedData;

      if (!importedTableData || importedTableData.length === 0) {
        console.error('❌ Aucune donnée importée');
        setSnackbar({ open: true, message: t('errorInvalidData', 'Aucune donnée trouvée dans le fichier Excel'), severity: 'error' });
        return;
      }

      // Utiliser directement la structure dynamique extraite du fichier Excel
      console.log(`📊 HR - Structure dynamique importée:`);
      console.log(`  - ${importedTableData.length} lignes`);
      console.log(`  - Années: ${years.join(', ')}`);
      console.log(`  - Périodes:`, periods);

      importedTableData.forEach(row => {
        const nonZeroValues = row.values.filter(v => v !== 0).length;
        console.log(`  [${row.category}] ${row.label}: ${nonZeroValues} valeurs non-zéro`);
      });

      // Mettre à jour l'état avec la structure complète importée
      setData({
        tableData: importedTableData,
        years: years,
        periods: periods,
        yearColSpans: yearColSpans
      });

      setSnackbar({
        open: true,
        message: t('successDataImported', `Structure HR importée avec succès (${importedTableData.length} lignes). Cliquez sur Save pour sauvegarder.`),
        severity: 'success'
      });

    } catch (error) {
      console.error('Erreur lors de l\'importation HR:', error);
      setSnackbar({ open: true, message: t('errorImportingData', 'Erreur lors de l\'importation HR: ') + error.message, severity: 'error' });
    }
  };

  const saveData = async (tableDataToSave = data.tableData) => {
    setLoading(true);
    try {
      const hrData = [];

      // Calculer les index de colonnes dynamiquement
      let columnOffset = 0;
      const yearColumnOffsets = {};
      data.years.forEach(year => {
        yearColumnOffsets[year] = columnOffset;
        columnOffset += data.periods[year].length;
      });

      tableDataToSave.forEach((row, rowIndex) => {
        // Sauvegarder TOUTES les lignes avec leur ordre
        data.years.forEach((year) => {
          data.periods[year].forEach((period, periodIndex) => {
            const globalIndex = yearColumnOffsets[year] + periodIndex;

            hrData.push({
              type: row.label,
              category: row.category,
              year: parseInt(year),
              month: period,
              count: parseInt(row.values[globalIndex]) || 0,
              rowOrder: rowIndex // Préserver l'ordre des lignes
            });
          });
        });
      });

      console.log(`💾 HR - Sauvegarde de ${hrData.length} entrées pour le site ${siteCode} (toutes les lignes incluses)`);
      console.log(`🔍 HR - Aperçu des données à sauvegarder:`, hrData.slice(0, 5).map(item => ({ type: item.type, category: item.category, year: item.year, month: item.month, count: item.count })));

      const res = await fetch(`${API_BASE_URL}/api/hr/save`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: JSON.stringify({ siteCode, hrData }),
      });

      if (!res.ok) throw new Error('HR Save failed');
      setSnackbar({ open: true, message: t('successDataSaved', 'Données HR sauvegardées avec succès'), severity: 'success' });

      // Recharger les notifications globales avec un petit délai
      setTimeout(() => {
        notificationService.loadNotificationsFromAPI();
      }, 500);

      // Recharger les données depuis la base après la sauvegarde
      console.log(`🔄 HR - Rechargement des données après sauvegarde pour le site: ${siteCode}...`);

      // Forcer un rechargement complet avec un délai pour s'assurer que la base de données est mise à jour
      setTimeout(async () => {
        await loadData();
        console.log('✅ HR - Rechargement terminé');
      }, 500);
    } catch (err) {
      console.error('HR Save error:', err);
      setSnackbar({ open: true, message: t('errorSavingData', 'Erreur de sauvegarde HR: ') + err.message, severity: 'error' });
      notifyError(err, 'Sauvegarde HR');
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    const result = await Swal.fire({
      title: t('delete', 'Supprimer les données'),
      text: t('confirmDeleteAll', `Êtes-vous sûr de vouloir supprimer toutes les données HR pour le site ${site} ?`),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('yes', 'Oui, supprimer !'),
      cancelButtonText: t('cancel', 'Annuler'),
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      console.log(`🗑️ HR - Suppression des données pour le site: ${siteCode}`);

      const res = await fetch(`${API_BASE_URL}/api/hr/delete/${siteCode}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });

      if (!res.ok) throw new Error('HR Delete failed');

      const apiResult = await res.json();

      // Notification de succès avec SweetAlert
      Swal.fire({
        title: '✅ Supprimé !',
        text: 'Toutes les données HR ont été supprimées avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Recharger les notifications globales avec un délai
      setTimeout(() => {
        notificationService.loadNotificationsFromAPI();
      }, 500);

      // Recharger pour afficher un tableau vide
      setTimeout(async () => {
        await loadData();
        console.log('✅ HR - Rechargement après suppression terminé');
      }, 500);

    } catch (err) {
      console.error('HR Delete error:', err);
      setSnackbar({ open: true, message: 'Erreur de suppression HR: ' + err.message, severity: 'error' });
      notifyError(err, 'Suppression HR');
    } finally {
      setLoading(false);
    }
  };

  // UseEffect pour charger les sites au démarrage et lors du changement de site
  useEffect(() => {
    console.log(`🔄 HR - Changement de site détecté: ${site}`);
    // Reset immédiat du tableau
    setData({ tableData: [], years: [], periods: {}, yearColSpans: {} });

    // Charger les sites disponibles
    loadAvailableSites();
  }, [site]);

  // UseEffect pour charger les données quand le siteCode est déterminé
  useEffect(() => {
    if (siteCode) {
      console.log(`📊 HR - Chargement des données pour: ${site} (${siteCode})`);
      loadData();
    }
  }, [siteCode]);

  // Préparer les données du graphique
  const sTotalRow = data.tableData.find(row => row.label === 'S-Total');
  const totalPlantRow = data.tableData.find(row => row.label === 'Total Plant');

  const chartData = {
    labels: Object.values(data.periods).flat(),
    datasets: [
      {
        label: 'S-Total',
        data: sTotalRow ? sTotalRow.values : [],
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Total Plant',
        data: totalPlantRow ? totalPlantRow.values : [],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
    ],
  };

  // 🔮 IA LOGIC FOR SITE HR 🔮
  if (aiPrediction && data.tableData.length > 0) {
    const labels = Object.values(data.periods).flat();
    const n = labels.length;
    
    if (n > 2) {
      const futureLabels = ['2029 Q1', '2029 Q2', '2030 Q1', '2030 Q2'];
      chartData.labels = [...labels, ...futureLabels];
      const totalPoints = n + futureLabels.length;

      const predictData = (yData) => {
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
      if (totalPlantRow) {
        chartData.datasets.push({
          label: 'IA: Tendance Total Plant',
          data: predictData(totalPlantRow.values),
          borderColor: 'rgba(255, 99, 132, 1)',
          borderDash: [5, 5],
          type: 'line',
          pointStyle: 'triangle',
          borderWidth: 2,
          pointRadius: 6
        });
      }

      // 2. Prediction S-Total
      if (sTotalRow) {
        chartData.datasets.push({
          label: 'IA: Tendance S-Total',
          data: predictData(sTotalRow.values),
          borderColor: 'rgba(54, 162, 235, 1)',
          borderDash: [5, 5],
          type: 'line',
          pointStyle: 'triangle',
          borderWidth: 2,
          pointRadius: 6
        });
      }
    }
  }

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value;
          }
        }
      }
    },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}`
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true
  };

  // Organiser les colonnes par année dynamiquement
  const yearColumns = data.years.map(year => ({
    year: year,
    periods: data.periods[year] || [],
    colspan: data.yearColSpans[year] || (data.periods[year] || []).length
  }));

  const allPeriods = Object.values(data.periods).flat();

  // Vérifier que le site est valide
  if (!siteCode && availableSites.length > 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error">Site HR non reconnu: {site}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Sites disponibles: {availableSites.map(s => `${s.nom} (${s.code})`).join(', ')}
        </Typography>
      </Box>
    );
  }

  // Affichage de chargement si les sites ne sont pas encore chargés
  if (availableSites.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('infoLoading', 'Chargement...')}</Typography>
      </Box>
    );
  }

  // Si aucune donnée n'est chargée, afficher un message
  const hasData = data.tableData.length > 0 && data.years.length > 0;

  return (
    <Box sx={{ p: 3 }} className="hr-table-container" data-theme={appTheme}>
      {/* Header avec boutons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', letterSpacing: '-0.02em' }}>
          {t('hrPage', 'Gestion des Ressources Humaines')} - <span style={{ color: '#10b981' }}>{site}</span>
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {/* Action Group */}
          <Paper elevation={0} sx={{ p: 0.5, bgcolor: '#f1f5f9', borderRadius: '12px', display: 'flex', gap: 1 }}>
            {user?.role === 'admin' && (
              <ExcelImporterHR onDataImported={handleDataImported} />
            )}
            
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={() => saveData()}
              disabled={loading || !hasData}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: '#1976d2' }}
            >
              Enregistrer
            </Button>

            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={deleteData}
              disabled={loading || !hasData}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Supprimer
            </Button>
            
            <Box sx={{ width: '1px', bgcolor: 'divider', mx: 0.5 }} />

            <Button
              variant={aiPrediction ? "contained" : "outlined"}
              size="small"
              startIcon={<span>✨</span>}
              onClick={() => {
                setAiPrediction(!aiPrediction);
                setSnackbar({ open: true, message: aiPrediction ? 'IA Désactivée' : '🔮 Intelligence Artificielle activée !', severity: 'success' });
              }}
              sx={{ 
                borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                background: aiPrediction ? 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)' : 'transparent',
                color: aiPrediction ? 'white' : 'primary.main'
              }}
            >
              {aiPrediction ? "Masquer IA" : "Prédiction IA"}
            </Button>

            <IconButton onClick={toggleTheme} color="primary" sx={{ bgcolor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Paper>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tableau HR avec structure dynamique */}
      {!hasData && (
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center', border: '1px dashed #ccc', bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
            Aucune donnée HR disponible pour ce site.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Importez un fichier Excel pour définir la structure du tableau.
          </Typography>
        </Paper>
      )}

      {hasData && (
        <Paper sx={{ mb: 4, overflow: 'auto' }}>
          <Table size="small" sx={{ minWidth: 1400 }}>
            <TableHead>
              {/* Première ligne d'en-tête avec les années */}
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: 'bold',
                    verticalAlign: 'middle',
                    minWidth: 120,
                    backgroundColor: '#c8e6c9',
                    border: '1px solid #000'
                  }}
                >
                  {t('hrModule', 'Ressources Humaines')}
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: 'bold',
                    verticalAlign: 'middle',
                    minWidth: 120,
                    backgroundColor: '#c8e6c9',
                    border: '1px solid #000'
                  }}
                >
                  {t('project', 'Projet')}
                </TableCell>
                {yearColumns.map(({ year, colspan }) => (
                  <TableCell
                    key={year}
                    colSpan={colspan}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: year === '2026' ? '#1976d2' : year === '2027' ? '#7b1fa2' : '#512da8',
                      color: 'white',
                      border: '1px solid #000',
                      fontSize: '1rem'
                    }}
                  >
                    {year}
                  </TableCell>
                ))}
              </TableRow>

              {/* Deuxième ligne d'en-tête avec les périodes */}
              <TableRow>
                {allPeriods.map((period) => (
                  <TableCell
                    key={period}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#f5f5f5',
                      minWidth: 65,
                      fontSize: '0.8rem',
                      border: '1px solid #000',
                      padding: '4px 8px'
                    }}
                  >
                    {period}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.tableData.map((row, index) => {
                const prevCategory = index > 0 ? data.tableData[index - 1].category : null;
                const showCategory = row.category !== prevCategory;
                const isSpecialRow = ['S-Total Assembly', 'S-Total production', 'S-Total', 'Total Plant'].includes(row.category);

                let rowSpan = 1;
                if (showCategory && !isSpecialRow) {
                  rowSpan = data.tableData.filter(r => r.category === row.category).length;
                }

                // Afficher la cellule de catégorie pour les vraies catégories (pas les lignes spéciales)
                const displayCategoryCell = showCategory && !isSpecialRow;

                return (
                  <TableRow key={index}>
                    {displayCategoryCell && (
                      <TableCell
                        rowSpan={rowSpan}
                        sx={{
                          fontWeight: 'bold',
                          verticalAlign: 'middle',
                          backgroundColor: row.category === 'Direct' ? '#c8e6c9' :
                            row.category === 'Assembly Direct' ? '#bbdefb' :
                              '#fff3e0', // Indirect
                          border: '1px solid #000',
                          fontSize: '0.9rem'
                        }}
                      >
                        {row.category}
                      </TableCell>
                    )}

                    {/* The Project/Label cell */}
                    <TableCell
                      colSpan={isSpecialRow && prevCategory !== row.category ? 2 : 1}
                      sx={{
                        fontWeight: isSpecialRow ? 'bold' : 'normal',
                        backgroundColor: isSpecialRow ? '#f3e5f5' : 'white',
                        border: '1px solid #000',
                        fontSize: '0.85rem'
                      }}
                    >
                      {row.label}
                    </TableCell>

                    {row.values.map((value, i) => (
                      <TableCell
                        key={i}
                        align="center"
                        sx={{
                          border: '1px solid #000',
                          fontSize: '0.8rem',
                          backgroundColor: isSpecialRow ? '#f3e5f5' : 'white',
                          fontWeight: isSpecialRow ? 'bold' : 'normal'
                        }}
                      >
                        {value || 0}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Graphique HR */}
      {hasData && (
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Graphique HR - {site}
          </Typography>
          <Box sx={{ height: 320 }}>
            <Bar data={chartData} options={chartOptions} />
          </Box>
        </Paper>
      )}

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HRTable;