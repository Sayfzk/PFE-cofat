// src/components/user/pages/SpaceTable.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Compatible avec React 19
import './style/SpaceTable.css';
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
import ExcelImporterSpace from './ExcelImporterSpace';
import { getAuthHeaders } from '../../../utils/apiUtils';
import notificationService from '../../../services/NotificationService';
import useTheme from '../../../hooks/useTheme';
import LanguageIcon from '@mui/icons-material/Language';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import useNotifications from '../../../hooks/useNotifications';
import './style/SpaceTable.css';
import './style/SpaceTable_dark.css';

const API_BASE_URL = 'http://172.23.23.31:9001';

// Créer un composant Alert avec forwardRef pour React 19
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const SpaceTable = () => {
  const { site } = useParams();
  const { t, i18n } = useTranslation();
  const { theme: appTheme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();
  const { notifySaveSuccess, notifyDeleteSuccess, notifyError } = useNotifications('Space');
  const [availableSites, setAvailableSites] = useState([]);
  const [siteCode, setSiteCode] = useState(null);

  // Structure dynamique - vide par défaut, remplie par l'import Excel
  const getEmptyTableStructure = () => [];

  const [data, setData] = useState({
    tableData: [],
    years: [],
    periods: {},
    yearColSpans: {}
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(false); // IA Prediction State

  console.log('⚙️ Module Space simplifié - Pas de calculs automatiques, toutes les données viennent d\'Excel');

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
      console.log('🌍 Chargement des sites disponibles...');
      const res = await fetch(`${API_BASE_URL}/api/sites`);
      if (!res.ok) throw new Error('Failed to load sites');
      const result = await res.json();

      if (result.success && result.data) {
        setAvailableSites(result.data);
        console.log('✅ Sites chargés:', result.data.map(s => `${s.nom} (${s.code})`));

        // Trouver le siteCode pour le site actuel
        const siteParam = site.toLowerCase();
        const targetSiteName = siteAliases[siteParam] || site; // Utiliser alias ou nom direct

        console.log(`🔍 Recherche du site: URL="${site}" -> Cible="${targetSiteName}"`);

        const currentSite = result.data.find(s =>
          s.nom.toLowerCase() === targetSiteName.toLowerCase() ||
          s.code.toLowerCase() === siteParam ||
          s.nom.toLowerCase() === siteParam
        );

        if (currentSite) {
          setSiteCode(currentSite.code);
          console.log(`✅ Site trouvé: ${currentSite.nom} (${currentSite.code})`);
        } else {
          console.error(`❌ Site "${site}" non trouvé dans:`, result.data.map(s => s.nom));
          setSiteCode(null);
        }
      }
    } catch (err) {
      console.error('Erreur chargement sites:', err);
      setSnackbar({ open: true, message: 'Erreur de chargement des sites', severity: 'error' });
    }
  };

  const loadData = async () => {
    console.log(`📊 Space LoadData appelé pour le site: ${siteCode}`);
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/space/site/${siteCode}`;
      console.log(`🌐 Space Appel API: ${url}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load Space data: ${res.status} ${res.statusText}`);
      const result = await res.json();
      console.log(`📊 Résultat API Space pour ${siteCode}:`, result);

      if (result.success && result.data.length > 0) {
        console.log(`✅ Données Space trouvées pour ${siteCode}: ${result.data.length} entrées`);

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
              category: item.category || 'SPACE',
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

        console.log('📊 Structure Space extraite de la base:', {
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
                  // Reconvertir les pourcentages entiers en décimales pour l'affichage
                  let displayValue = item.area;
                  const rowLabel = loadedData[rowIndex].label;

                  // Si c'est une ligne de pourcentage et que la valeur est > 1, diviser par 100
                  // MODIFICATION: Available space n'est PAS un pourcentage
                  if (rowLabel === 'Occupation' && displayValue > 1) {
                    displayValue = displayValue / 100;
                  }

                  loadedData[rowIndex].values[columnIndex + periodIndex] = displayValue;
                }
                break;
              }
              columnIndex += periods[String(year)].length;
            }
          }
        });

        console.log('✅ Space - Données chargées:', loadedData.length, 'lignes');
        setData({ tableData: loadedData, years: years.map(String), periods, yearColSpans });
      } else {
        console.log(`🏴 Aucune donnée Space trouvée pour ${siteCode}`);
        setData({ tableData: [], years: [], periods: {}, yearColSpans: {} });
      }
    } catch (err) {
      console.error('Space Load error:', err);
      setSnackbar({ open: true, message: t('errorLoadingData', 'Erreur lors du chargement Space: ') + err.message, severity: 'error' });
      setData({ tableData: [], years: [], periods: {}, yearColSpans: {} });
    } finally {
      setLoading(false);
    }
  };

  const handleDataImported = (importedData) => {
    console.log('📊 Données Space importées:', importedData);

    try {
      const { tableData: importedTableData, years, periods, yearColSpans } = importedData;

      if (!importedTableData || importedTableData.length === 0) {
        console.error('❌ Aucune donnée Space importée');
        setSnackbar({ open: true, message: t('noDataFound', 'Aucune donnée trouvée dans le fichier Excel'), severity: 'error' });
        return;
      }

      // Utiliser directement la structure dynamique importée
      console.log(`📊 Space - Structure dynamique importée:`);
      console.log(`  - ${importedTableData.length} lignes`);
      console.log(`  - Années: ${years.join(', ')}`);
      console.log(`  - Périodes:`, periods);

      // Mettre à jour l'état avec la structure complète importée
      setData({
        tableData: importedTableData,
        years: years,
        periods: periods,
        yearColSpans: yearColSpans
      });

      setSnackbar({
        open: true,
        message: t('successDataImported', `Structure Space importée avec succès (${importedTableData.length} lignes). Cliquez sur Save pour sauvegarder.`),
        severity: 'success'
      });

      // Plus de sauvegarde automatique - l'utilisateur doit cliquer Save manuellement

    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      setSnackbar({ open: true, message: t('errorImportingData', 'Erreur lors de l\'importation: ') + error.message, severity: 'error' });
    }
  };

  const saveData = async (tableDataToSave = data.tableData) => {
    setLoading(true);
    try {
      const spaceData = [];

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
            const rawValue = row.values[globalIndex];

            // Convertir la valeur en nombre approprié
            let areaValue = 0;
            if (rawValue !== undefined && rawValue !== null) {
              let numValue = 0;

              // Si c'est déjà un nombre, l'utiliser
              if (typeof rawValue === 'number') {
                numValue = rawValue;
              } else {
                // Sinon, parser
                numValue = parseFloat(rawValue) || 0;
              }

              // Pour les pourcentages (valeurs < 1), convertir en entier (0.08 -> 8)
              if (numValue < 1 && numValue > 0) {
                areaValue = Math.round(numValue * 100);
              } else {
                areaValue = Math.round(numValue);
              }
            }

            spaceData.push({
              type: row.label,
              category: row.category,
              year: parseInt(year),
              month: period,
              area: areaValue,
              rowOrder: rowIndex // Préserver l'ordre des lignes
            });
          });
        });
      });

      console.log(`💾 Space - Sauvegarde de ${spaceData.length} entrées pour le site ${siteCode} (toutes les lignes incluses)`);
      console.log(`🔍 Space - Aperçu des données à sauvegarder:`, spaceData.slice(0, 5).map(item => ({ type: item.type, category: item.category, year: item.year, month: item.month, area: item.area, rowOrder: item.rowOrder })));

      // Vérifier que toutes les données sont valides
      const invalidEntries = spaceData.filter(item => !item.type || !item.category || !item.year || !item.month);
      if (invalidEntries.length > 0) {
        console.error('❌ Entrées invalides détectées:', invalidEntries.slice(0, 3));
        throw new Error(`${invalidEntries.length} entrées invalides détectées`);
      }

      const res = await fetch(`${API_BASE_URL}/api/space/save`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ siteCode, spaceData }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error(`Space Save failed: ${res.status} - ${errorText}`);
      }
      setSnackbar({ open: true, message: t('successDataSaved', 'Données Space sauvegardées avec succès'), severity: 'success' });

      // Recharger les notifications globales avec un petit délai pour éviter les problèmes de synchronisation
      setTimeout(() => {
        notificationService.loadNotificationsFromAPI();
      }, 500);

      // Recharger les données depuis la base après la sauvegarde
      console.log(`🔄 Space - Rechargement des données après sauvegarde pour le site: ${siteCode}...`);

      // Forcer un rechargement complet avec un délai pour s'assurer que la base de données est mise à jour
      setTimeout(async () => {
        await loadData();
        console.log('✅ Space - Rechargement terminé');
      }, 500);
    } catch (err) {
      console.error('Space Save error:', err);
      setSnackbar({ open: true, message: t('errorSavingData', 'Erreur de sauvegarde Space: ') + err.message, severity: 'error' });
      notifyError(err, 'Sauvegarde Space');
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    const result = await Swal.fire({
      title: t('delete', 'Supprimer les données'),
      text: t('confirmDeleteAll', `Êtes-vous sûr de vouloir supprimer toutes les données Space pour le site ${site} ?`),
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
      console.log(`🗑️ [SPACE] deleteData appelé pour siteCode: "${siteCode}"`);
      console.log(`🔑 [SPACE] Auth Headers:`, JSON.stringify(getAuthHeaders()));

      const res = await fetch(`${API_BASE_URL}/api/space/delete/${siteCode}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });

      console.log(`📥 [SPACE] Réponse serveur status: ${res.status}`);
      if (!res.ok) {
        const errText = await res.text();
        console.error(`❌ [SPACE] Erreur serveur:`, errText);
        throw new Error(`Space Delete failed: ${res.status} ${errText}`);
      }

      const apiResult = await res.json();

      // Notification de succès avec SweetAlert
      Swal.fire({
        title: '✅ Supprimé !',
        text: 'Tout a été supprimé avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Recharger les notifications globales
      setTimeout(() => {
        notificationService.loadNotificationsFromAPI();
      }, 500);

      // Recharger pour afficher un tableau vide
      setTimeout(async () => {
        await loadData();
        console.log('✅ Space - Rechargement après suppression terminé');
      }, 500);

    } catch (err) {
      console.error('Space Delete error:', err);
      setSnackbar({ open: true, message: 'Erreur de suppression: ' + err.message, severity: 'error' });
      notifyError(err, 'Suppression Space');
    } finally {
      setLoading(false);
    }
  };

  // UseEffect pour charger les sites au démarrage et lors du changement de site
  useEffect(() => {
    console.log(`🔄 Space - Changement de site détecté: ${site}`);
    // Reset immédiat du tableau avec structure vide
    setData({ tableData: [], years: [], periods: {}, yearColSpans: {} });

    // Charger les sites disponibles
    loadAvailableSites();
  }, [site]);

  // UseEffect pour charger les données quand le siteCode est déterminé
  useEffect(() => {
    if (siteCode) {
      console.log(`📊 Chargement des données pour: ${site} (${siteCode})`);
      loadData();
    }
  }, [siteCode]);

  // Préparer les données du graphique
  const occupationRow = data.tableData.find(row => row.label === 'Occupation');
  const availableRow = data.tableData.find(row => row.label === 'Available space' || row.label === 'Available Area');

  // Convertir les valeurs en pourcentages si nécessaire (si < 1, multiplier par 100)
  const convertToPercent = (values) => {
    if (!values) return [];
    return values.map(val => {
      if (val < 1 && val > 0) {
        return Math.round(val * 100);
      }
      return Math.round(val);
    });
  };

  const occupationValues = occupationRow ? convertToPercent(occupationRow.values) : [];
  const maxOccupation = occupationValues.length > 0 ? Math.max(...occupationValues) : 100;

  const chartData = {
    labels: Object.values(data.periods).flat(),
    datasets: [
      {
        type: 'bar',
        label: 'Occupation (%)',
        data: occupationValues,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.55)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        type: 'bar',
        label: 'Available space (m²)',
        data: availableRow ? availableRow.values.map(v => Math.round(v) || 0) : [],
        backgroundColor: 'rgba(255, 99, 132, 0.55)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      },
    ],
  };

  // 🔮 IA LOGIC FOR SITE SPACE 🔮
  if (aiPrediction && occupationValues.length > 2) {
    const labels = Object.values(data.periods).flat();
    const n = labels.length;
    
    const calcTrend = (yData) => {
      let sX = 0, sY = 0, sXY = 0, sXX = 0;
      for (let i = 0; i < n; i++) {
        sX += i; sY += yData[i]; sXY += i * yData[i]; sXX += i * i;
      }
      const slope = (n * sXY - sX * sY) / (n * sXX - sX * sX);
      const intercept = (sY - slope * sX) / n;
      return { slope, intercept };
    };

    const occLR = calcTrend(occupationValues);
    const availLR = calcTrend(availableRow ? availableRow.values : new Array(n).fill(0));

    const futureLabels = ['2029 Q1', '2029 Q2', '2029 Q3', '2029 Q4', '2030 Q1', '2030 Q2'];
    chartData.labels = [...labels, ...futureLabels];

    const totalPoints = n + futureLabels.length;
    const occTrend = [], availTrend = [];
    for (let i = 0; i < totalPoints; i++) {
      occTrend.push(Math.max(0, Math.round(occLR.slope * i + occLR.intercept)));
      availTrend.push(Math.max(0, Math.round(availLR.slope * i + availLR.intercept)));
    }

    chartData.datasets.push({
      type: 'line',
      label: 'IA: Tendance Occ (%)',
      data: occTrend,
      borderColor: 'rgba(153, 102, 255, 1)',
      borderDash: [5, 5],
      pointStyle: 'star',
      yAxisID: 'y'
    });

    chartData.datasets.push({
      type: 'line',
      label: 'IA: Tendance Espace (m²)',
      data: availTrend,
      borderColor: 'rgba(255, 159, 64, 1)',
      borderDash: [5, 5],
      pointStyle: 'rectRot',
      yAxisID: 'y1'
    });
  }

  const chartOptions = {
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
            return `${ctx.dataset.label}: ${ctx.raw} m²`;
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
        <Typography variant="h4" color="error">Site non reconnu: {site}</Typography>
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

  return (
    <Box sx={{ p: 3 }} className="space-table-container" data-theme={appTheme}>
      {/* Header avec boutons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e', letterSpacing: '-0.02em' }}>
          {t('spacePage', 'Gestion des Espaces')} - <span style={{ color: '#10b981' }}>{site}</span>
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {/* Action Group */}
          <Paper elevation={0} sx={{ p: 0.5, bgcolor: '#f1f5f9', borderRadius: '12px', display: 'flex', gap: 1 }}>
            {user?.role === 'admin' && (
              <ExcelImporterSpace onDataImported={handleDataImported} />
            )}
            
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={() => saveData()}
              disabled={loading || data.tableData.length === 0}
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
              disabled={loading || data.tableData.length === 0}
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
                setSnackbar({ open: true, message: aiPrediction ? 'IA Désactivée' : '🔮 Intelligence Artificielle activée !', severity: 'info' });
              }}
              sx={{ 
                borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                background: aiPrediction ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' : 'transparent',
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

      {/* Message si pas de données */}
      {!loading && data.tableData.length === 0 && (
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center', border: '1px dashed #ccc', bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
            Aucune donnée Space disponible pour ce site.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Importez un fichier Excel pour définir la structure du tableau.
          </Typography>
        </Paper>
      )}

      {/* Tableau avec la structure dynamique */}
      {data.tableData.length > 0 && (
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
                    minWidth: 80,
                    backgroundColor: '#c8e6c9',
                    border: '1px solid #000'
                  }}
                >
                  SPACE
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
                  Project
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
                {yearColumns.map(({ year, periods }) =>
                  periods.map((period, idx) => (
                    <TableCell
                      key={`${year}-${period}-${idx}`}
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
                  ))
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.tableData.map((row, index) => {
                // Calculer dynamiquement si on doit afficher la catégorie et le rowSpan
                let showCategory = false;
                let rowSpan = 1;

                // Vérifier si c'est la première ligne de cette catégorie
                const isFirstOfCategory = index === 0 || data.tableData[index - 1]?.category !== row.category;

                if (isFirstOfCategory) {
                  // Compter combien de lignes ont la même catégorie
                  rowSpan = data.tableData.filter((r, i) => i >= index && r.category === row.category).length;
                  showCategory = true;
                }

                // Déterminer le style en fonction de la catégorie
                const getCategoryColor = (category) => {
                  if (category === 'SPACE') return '#c8e6c9';
                  if (category === 'Assembly') return '#bbdefb';
                  if (category?.includes('OTHERS')) return '#fff9c4';
                  if (category?.includes('S-Total') || category?.includes('Total')) return '#fff3e0';
                  if (category === 'SUMMARY') return '#f5f5f5';
                  return '#e0e0e0';
                };

                const isSummaryRow = row.category === 'SUMMARY';
                const isSpecialRow = row.category?.includes('S-Total') || row.category?.includes('OTHERS');

                // Déterminer si cette ligne doit fusionner les colonnes (pas de sous-projets)
                // Seule la catégorie "Assembly" a des sous-projets
                const shouldMergeColumns = row.category !== 'Assembly';

                let rowClass = '';
                if (isSummaryRow) rowClass = 'space-total-row category-summary';
                else if (isSpecialRow) rowClass = 'space-total-row category-total';
                else if (row.isSectorTotal) rowClass = 'space-total-row category-sector';

                return (
                  <TableRow
                    key={index}
                    className={rowClass}
                  >
                    {/* Pour les lignes sans sous-projets, fusionner SPACE + Project */}
                    {shouldMergeColumns ? (
                      <TableCell
                        colSpan={2}
                        sx={{
                          fontWeight: isSummaryRow || isSpecialRow ? 'bold' : 'normal',
                          backgroundColor: getCategoryColor(row.category),
                          border: '1px solid #000',
                          fontSize: '0.9rem',
                          minWidth: 200
                        }}
                      >
                        {row.label}
                      </TableCell>
                    ) : (
                      <>
                        {/* Pour Assembly: afficher la catégorie si c'est la première ligne */}
                        {showCategory && (
                          <TableCell
                            rowSpan={rowSpan}
                            sx={{
                              fontWeight: 'bold',
                              verticalAlign: 'middle',
                              backgroundColor: getCategoryColor(row.category),
                              border: '1px solid #000',
                              fontSize: '0.9rem',
                              minWidth: 100,
                              textAlign: 'center'
                            }}
                          >
                            {row.category}
                          </TableCell>
                        )}

                        {/* Colonne Project pour Assembly */}
                        <TableCell
                          sx={{
                            backgroundColor: 'white',
                            border: '1px solid #000',
                            fontSize: '0.9rem',
                            minWidth: 150
                          }}
                        >
                          {row.label}
                        </TableCell>
                      </>
                    )}

                    {row.values.map((val, i) => {
                      // Formater les valeurs selon le type de ligne
                      let displayValue = val || 0;

                      if (row.label === 'Occupation') {
                        // Pour les pourcentages: si la valeur est < 1, la multiplier par 100
                        // Sinon, l'utiliser telle quelle
                        const percentValue = val < 1 && val > 0 ? Math.round(val * 100) : Math.round(val);
                        displayValue = `${percentValue}%`;
                      } else {
                        // Pour les autres valeurs, arrondir
                        displayValue = Math.round(val) || 0;
                      }

                      return (
                        <TableCell
                          key={i}
                          align="center"
                          sx={{
                            backgroundColor: row.label === 'Occupation' ? '#e8f5e8' :
                              row.label === 'Available space' || row.label === 'Available Area' ? '#ffebee' : 'white',
                            border: '1px solid #000',
                            fontSize: '0.85rem',
                            padding: '6px 4px'
                          }}
                        >
                          {displayValue}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Graphique */}
      {data.tableData.length > 0 && (
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('occupation', 'Taux d\'occupation')}
          </Typography>
          <Box sx={{ height: 300 }}>
            <Bar data={chartData} options={chartOptions} />
          </Box>
        </Paper>
      )}

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

export default SpaceTable;