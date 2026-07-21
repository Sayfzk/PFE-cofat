// src/components/user/pages/HRTable.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Alert,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import ExcelImporter from './ExcelImporter';

const API_BASE_URL = 'http://172.23.23.31:9001';

const HRTable = () => {
  const { site } = useParams();

  console.log(`👥 HRTable - Site actuel: ${site}`);

  // State pour les sites disponibles
  const [availableSites, setAvailableSites] = useState([]);
  const [siteCode, setSiteCode] = useState(null);

  // Structure complète du tableau HR - toutes les lignes sont uploadables via Excel
  const getEmptyTableStructure = () => [
    { label: 'Cutting area', category: 'Direct', values: new Array(20).fill(0) },
    { label: 'Lead prep area', category: 'Direct', values: new Array(20).fill(0) },
    { label: 'project1', category: 'Assembly Direct', values: new Array(20).fill(0) },
    { label: 'project2', category: 'Assembly Direct', values: new Array(20).fill(0) },
    { label: 'Production', category: 'Indirect', values: new Array(20).fill(0) },
    { label: 'Eng', category: 'Indirect', values: new Array(20).fill(0) },
    { label: 'Quality', category: 'Indirect', values: new Array(20).fill(0) },
    { label: 'Maintenance', category: 'Indirect', values: new Array(20).fill(0) },
    { label: 'S-Total production', category: 'CALCULATION', values: new Array(20).fill(0) },
    { label: 'S-Total', category: 'CALCULATION', values: new Array(20).fill(0) },
    { label: 'Total Plant', category: 'CALCULATION', values: new Array(20).fill(0) },
  ];

  const initialTableStructure = getEmptyTableStructure();

  console.log('📊 Longueur des valeurs dans initialTableStructure:', initialTableStructure.map(row => ({ label: row.label, length: row.values.length })));

  const [data, setData] = useState({
    tableData: [...initialTableStructure],
    years: ['2025', '2026', '2027'],
    periods: {
      '2025': Array.from({ length: 12 }, (_, i) => `MO ${String(i + 1).padStart(2, '0')}`),
      '2026': ['Q 01', 'Q 02', 'Q 03', 'Q 04'],
      '2027': ['Q 01', 'Q 02', 'Q 03', 'Q 04'],
    }
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);

  console.log('⚙️ Module HR simplifié - Pas de calculs automatiques, toutes les données viennent d\'Excel');

  // Aliases pour les sites (URL -> Nom en base)
  const siteAliases = {
    'cofatec': 'Mexique',
    'mateur': 'Mateur',
    'tunis': 'Tunis',
    'brazil': 'Brazil',
    'egypt': 'Egypt',
    'kairouan': 'Kairouan',
    'maroc': 'Maroc'
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
        // Reconstruire les données depuis la base en partant d'une structure vide
        const loadedData = getEmptyTableStructure();

        console.log('📊 Items HR depuis la base de données:', result.data.slice(0, 5)); // Afficher les 5 premiers items

        result.data.forEach(item => {
          const rowIndex = loadedData.findIndex(row => row.label === item.type);
          if (rowIndex !== -1) {
            // Déterminer l'index de colonne basé sur l'année et la période
            let columnIndex = 0;
            if (item.year === 2025) {
              const monthNum = parseInt(item.month.replace('MO ', ''));
              columnIndex = monthNum - 1;
            } else if (item.year === 2026) {
              const quarterNum = parseInt(item.month.replace('Q ', ''));
              columnIndex = 12 + quarterNum - 1;
            } else if (item.year === 2027) {
              const quarterNum = parseInt(item.month.replace('Q ', ''));
              columnIndex = 16 + quarterNum - 1;
            }

            console.log(`🔄 Reconstruction HR: ${item.type} ${item.year} ${item.month} -> colonne ${columnIndex} = ${item.count}`);

            if (columnIndex >= 0 && columnIndex < 20) {
              loadedData[rowIndex].values[columnIndex] = item.count;
            } else {
              console.warn(`⚠️ Index de colonne invalide: ${columnIndex} pour ${item.type} ${item.year} ${item.month}`);
            }
          } else {
            console.warn(`⚠️ Type HR non trouvé: ${item.type}`);
          }
        });

        // Plus de calculs automatiques - la structure complète est chargée depuis la base
        console.log('✅ Structure HR complète chargée depuis la base:', loadedData.length, 'lignes');
        setData(prev => ({ ...prev, tableData: loadedData }));
      } else {
        console.log(`🏴 Aucune donnée HR trouvée pour ${siteCode}, utilisation d'une structure vide complète`);
        // Utiliser une structure complètement vide pour ce site (avec toutes les lignes)
        const emptyStructure = getEmptyTableStructure();
        console.log('🏴 Structure HR vide créée avec', emptyStructure.length, 'lignes');
        setData(prev => ({ ...prev, tableData: emptyStructure }));
      }
    } catch (err) {
      console.error('HR Load error:', err);
      setSnackbar({ open: true, message: err.message, severity: 'error' });

      // Utiliser une structure vide en cas d'erreur pour ne pas afficher les données d'un autre site
      console.log(`❌ Erreur de chargement HR pour ${siteCode}, utilisation d'une structure vide complète`);
      const emptyStructure = getEmptyTableStructure();
      console.log('❌ Structure HR vide créée suite à erreur avec', emptyStructure.length, 'lignes');
      setData(prev => ({ ...prev, tableData: emptyStructure }));
    } finally {
      setLoading(false);
    }
  };

  const handleDataImported = (importedData) => {
    console.log('Données HR importées:', importedData);

    try {
      const { tableData: importedTableData } = importedData;

      // Mapper les données importées vers une structure vide propre à ce site
      const updatedTableData = getEmptyTableStructure();

      // Mapping des noms possibles - INCLUANT toutes les lignes HR (base + calculs)
      const nameMapping = {
        'Cutting area': 'Cutting area',
        'Lead prep area': 'Lead prep area',
        'Lead prep': 'Lead prep area',
        'project1': 'project1',
        'project2': 'project2',
        'Production': 'Production',
        'Eng': 'Eng',
        'Quality': 'Quality',
        'Maintenance': 'Maintenance',
        'S-Total production': 'S-Total production',
        'S-Total': 'S-Total',
        'Total Plant': 'Total Plant',
        // Anciens mappings pour compatibilité
        'STotalProduction': 'S-Total production',
        'STotal': 'S-Total',
        'TotalPlant': 'Total Plant'
      };

      importedTableData.forEach(importedRow => {
        const mappedName = nameMapping[importedRow.label] || importedRow.label;
        console.log(`HR - Tentative de mapping: ${importedRow.label} -> ${mappedName}`);

        // Chercher la ligne correspondante dans notre structure
        const targetRowIndex = updatedTableData.findIndex(row =>
          row.label === mappedName || row.label === importedRow.label
        );

        if (targetRowIndex !== -1) {
          updatedTableData[targetRowIndex].values = [...importedRow.values];
          console.log(`Ligne HR mise à jour: ${updatedTableData[targetRowIndex].label}`);
        } else {
          console.log(`Ligne HR non trouvée pour: ${importedRow.label}`);
        }
      });

      // Plus de calculs automatiques - utiliser directement les données importées
      console.log('📊 HR - Données finales après import:', updatedTableData.length, 'lignes');
      setData(prev => ({ ...prev, tableData: updatedTableData }));
      setSnackbar({ open: true, message: 'Données HR importées avec succès. Cliquez sur Save pour sauvegarder.', severity: 'success' });

      // Plus de sauvegarde automatique - l'utilisateur doit cliquer Save manuellement

    } catch (error) {
      console.error('Erreur lors de l\'importation HR:', error);
      setSnackbar({ open: true, message: 'Erreur lors de l\'importation HR: ' + error.message, severity: 'error' });
    }
  };

  const saveData = async (tableDataToSave = data.tableData) => {
    setLoading(true);
    try {
      const hrData = [];

      tableDataToSave.forEach((row) => {
        // Sauvegarder TOUTES les lignes maintenant (Direct, Assembly Direct, Indirect et CALCULATION)
        if (row.category === 'Direct' || row.category === 'Assembly Direct' || row.category === 'Indirect' || row.category === 'CALCULATION') {
          Object.keys(data.periods).forEach((year) => {
            data.periods[year].forEach((period, i) => {
              let globalIndex = i;
              if (year === '2026') globalIndex = 12 + i;
              if (year === '2027') globalIndex = 16 + i;

              hrData.push({
                type: row.label,
                category: row.category,
                year: parseInt(year),
                month: period,
                count: parseInt(row.values[globalIndex]) || 0,
              });
            });
          });
        }
      });

      console.log(`💾 HR - Sauvegarde de ${hrData.length} entrées pour le site ${siteCode} (Direct, Assembly Direct, Indirect et CALCULATION incluses)`);
      console.log(`🔍 HR - Aperçu des données à sauvegarder:`, hrData.slice(0, 5).map(item => ({ type: item.type, category: item.category, year: item.year, month: item.month, count: item.count })));

      const res = await fetch(`${API_BASE_URL}/api/hr/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteCode, hrData }),
      });

      if (!res.ok) throw new Error('HR Save failed');
      setSnackbar({ open: true, message: 'Données HR sauvegardées avec succès', severity: 'success' });

      // Recharger les données depuis la base après la sauvegarde
      console.log(`🔄 HR - Rechargement des données après sauvegarde pour le site: ${siteCode}...`);

      // Forcer un rechargement complet avec un délai pour s'assurer que la base de données est mise à jour
      setTimeout(async () => {
        await loadData();
        console.log('✅ HR - Rechargement terminé');
      }, 500);
    } catch (err) {
      console.error('HR Save error:', err);
      setSnackbar({ open: true, message: 'Erreur de sauvegarde HR: ' + err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    const result = await Swal.fire({
      title: '🗑️ Supprimer les données',
      text: `Êtes-vous sûr de vouloir supprimer toutes les données HR pour le site ${site} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
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
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('HR Delete failed');

      // Notification de succès avec SweetAlert
      Swal.fire({
        title: '✅ Supprimé !',
        text: 'Toutes les données HR ont été supprimées avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Recharger pour afficher un tableau vide
      setTimeout(async () => {
        await loadData();
        console.log('✅ HR - Rechargement après suppression terminé');
      }, 500);

    } catch (err) {
      console.error('HR Delete error:', err);
      setSnackbar({ open: true, message: 'Erreur de suppression HR: ' + err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // UseEffect pour charger les sites au démarrage et lors du changement de site
  useEffect(() => {
    console.log(`🔄 HR - Changement de site détecté: ${site}`);
    // Reset immédiat du tableau
    const emptyStructure = getEmptyTableStructure();
    setData(prev => ({ ...prev, tableData: emptyStructure }));

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

  // Organiser les colonnes par année
  const yearColumns = [
    { year: '2025', periods: data.periods['2025'], colspan: 12 },
    { year: '2026', periods: data.periods['2026'], colspan: 4 },
    { year: '2027', periods: data.periods['2027'], colspan: 4 }
  ];

  const allPeriods = Object.values(data.periods).flat();

  // Vérifier que le site est valide - Même logique que SpaceTable
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
        <Typography sx={{ ml: 2 }}>Chargement des sites HR...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        HR Management - {site}
      </Typography>

      {/* Boutons Save et Recharger en haut à gauche */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Box sx={{ minWidth: 140 }}>
          <ExcelImporter onDataImported={handleDataImported} />
        </Box>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => saveData()}
          disabled={loading}
          color="primary"
          sx={{ minWidth: 140 }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
          sx={{ minWidth: 140 }}
        >
          Recharger
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={deleteData}
          disabled={loading}
          color="error"
          sx={{ minWidth: 140 }}
        >
          Supprimer
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tableau HR avec la structure selon votre image */}
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
                manufacturing range plant
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
                    backgroundColor: year === '2025' ? '#1976d2' : year === '2026' ? '#7b1fa2' : '#512da8',
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
              let rowSpan = 1;
              let showCategory = false;

              // Déterminer si on doit afficher la catégorie et le rowspan
              if (row.category === 'Direct' && index === 0) {
                rowSpan = 2; // Cutting area et Lead prep area
                showCategory = true;
              } else if (row.category === 'Assembly Direct' && data.tableData[index - 1]?.category !== 'Assembly Direct') {
                rowSpan = 2; // project1, project2
                showCategory = true;
              } else if (row.category === 'Indirect' && data.tableData[index - 1]?.category !== 'Indirect') {
                rowSpan = 4; // Production, Eng, Quality, Maintenance
                showCategory = true;
              } else if (row.category === 'CALCULATION' && data.tableData[index - 1]?.category !== 'CALCULATION') {
                rowSpan = 3; // S-Total production, S-Total, Total Plant
                showCategory = true;
              }

              return (
                <TableRow key={index}>
                  {showCategory && (
                    <TableCell
                      rowSpan={rowSpan}
                      sx={{
                        fontWeight: 'bold',
                        verticalAlign: 'middle',
                        backgroundColor: row.category === 'Direct' ? '#c8e6c9' :
                          row.category === 'Assembly Direct' ? '#bbdefb' :
                            row.category === 'Indirect' ? '#fff3e0' :
                              '#f3e5f5',
                        border: '1px solid #000',
                        fontSize: '0.9rem'
                      }}
                    >
                      {row.category === 'Direct' ? 'Direct' :
                        row.category === 'Assembly Direct' ? 'Assembly Direct' :
                          row.category === 'Indirect' ? 'Indirect' :
                            'CALCULATION'}
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      fontWeight: row.category === 'CALCULATION' ? 'bold' : 'normal',
                      backgroundColor: row.category === 'CALCULATION' ? '#f3e5f5' : 'white',
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
                        backgroundColor: row.category === 'CALCULATION' ? '#f3e5f5' : 'white',
                        fontWeight: row.category === 'CALCULATION' ? 'bold' : 'normal'
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

      {/* Graphique HR */}
      <Paper sx={{ p: 2, height: 400 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Graphique HR - {site}
        </Typography>
        <Box sx={{ height: 320 }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Paper>

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
    </Box>
  );
};

export default HRTable;