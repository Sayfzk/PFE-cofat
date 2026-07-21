// src/components/user/pages/CofatGroup.js
import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './style/CofatGroup.css';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

const API_BASE_URL = 'http://172.23.23.31:9001';

const CofatGroup = () => {
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // DÉFINITION DES PÉRIODES (V1: 2025-2027, V2: 2026-2028)

  // V1 - Ancienne structure (2025 MO, 2026 Q, 2027 Q)
  const periodsV1 = {
    '2025': Array.from({ length: 12 }, (_, i) => `MO ${String(i + 1).padStart(2, '0')}`),
    '2026': ['Q 01', 'Q 02', 'Q 03', 'Q 04'],
    '2027': ['Q 05', 'Q 06', 'Q 07', 'Q 08'],
  };
  const allPeriodsV1 = Object.entries(periodsV1).flatMap(([year, periods]) =>
    periods.map(period => `${year}-${period}`)
  );

  // V2 - Nouvelle structure (2026 MO, 2027 Q, 2028 Q)
  const periodsV2 = {
    '2026': Array.from({ length: 12 }, (_, i) => `MO ${String(i + 1).padStart(2, '0')}`),
    '2027': ['Q 01', 'Q 02', 'Q 03', 'Q 04'],
    '2028': ['Q 05', 'Q 06', 'Q 07', 'Q 08'],
  };
  const allPeriodsV2 = Object.entries(periodsV2).flatMap(([year, periods]) =>
    periods.map(period => `${year}-${period}`)
  );

  const yearColumnsV1 = [
    { year: '2025', periods: periodsV1['2025'], colspan: 12 },
    { year: '2026', periods: periodsV1['2026'], colspan: 4 },
    { year: '2027', periodsV1: periodsV1['2027'], colspan: 4 }
  ];

  const yearColumnsV2 = [
    { year: '2026', periods: periodsV2['2026'], colspan: 12 },
    { year: '2027', periods: periodsV2['2027'], colspan: 4 },
    { year: '2028', periods: periodsV2['2028'], colspan: 4 }
  ];

  // Helper pour détecter la version des données
  const detectVersion = (equipmentData) => {
    // Si des données existent pour 2025, c'est la V1
    const has2025 = Object.keys(equipmentData.periods).some(key => key.startsWith('2025-'));
    if (has2025) return 'V1';

    // Sinon, par défaut V2 (nouvelles données ou migration)
    return 'V2';
  };

  const loadConsolidatedData = async () => {
    setLoading(true);
    try {
      console.log('🔄 CofatGroup - Chargement données consolidées...');

      const response = await fetch(`${API_BASE_URL}/api/cofat-group/consolidated`);
      if (!response.ok) throw new Error(`Failed to load consolidated data: ${response.status}`);

      const result = await response.json();
      console.log('📊 CofatGroup - Données reçues:', result);

      if (result.success) {
        setConsolidatedData(result.data || []);
        setSummary(result.summary || {});

        // 🔍 DEBUG: Vérifier les périodes pour CAO63
        const cao63 = result.data?.find(eq => eq.equipment.nom?.includes('CAO'));
        if (cao63) {
          console.log('🔍 DEBUG CAO63 - Périodes disponibles:', Object.keys(cao63.periods));
          console.log('🔍 DEBUG CAO63 - Périodes 2027:', Object.keys(cao63.periods).filter(p => p.startsWith('2027')));
          Object.keys(cao63.periods).forEach(period => {
            if (period.startsWith('2027')) {
              console.log(`🔍 DEBUG CAO63 - ${period}:`, cao63.periods[period]);
            }
          });
        }

        console.log(`✅ CofatGroup - ${result.data?.length || 0} équipements consolidés chargés`);
        setSnackbar({ open: true, message: `${result.data?.length || 0} équipements consolidés chargés`, severity: 'success' });
      } else {
        throw new Error(result.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('❌ CofatGroup - Erreur de chargement:', err);
      setSnackbar({ open: true, message: `Erreur: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsolidatedData();
  }, []);

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    if (!consolidatedData.length) return { machineNeedData: {}, loadData: {} };

    // Top 5 équipements par besoin total
    const top5Equipments = consolidatedData
      .map(eq => {
        const totalNeed = Object.values(eq.periods).reduce((sum, period) => sum + (period.machineNeed || 0), 0);
        return { ...eq, totalNeed };
      })
      .sort((a, b) => b.totalNeed - a.totalNeed)
      .slice(0, 5);

    const machineNeedData = {
      labels: top5Equipments.map(eq => eq.equipment.nom),
      datasets: [
        {
          label: 'Besoin Total Machines',
          data: top5Equipments.map(eq => eq.totalNeed),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Machines Disponibles',
          data: top5Equipments.map(eq =>
            Object.values(eq.periods).reduce((sum, period) => sum + (period.availableMachine || 0), 0)
          ),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    // Données de charge par période pour un équipement populaire
    const popularEquipment = consolidatedData.find(eq => eq.totalSites > 1) || consolidatedData[0];
    const loadData = popularEquipment ? {
      labels: allPeriodsV2.slice(0, 20), // Limiter à 20 périodes pour lisibilité
      datasets: [
        {
          label: `Charge - ${popularEquipment.equipment.nom}`,
          data: allPeriodsV2.slice(0, 20).map(period => {
            const periodData = popularEquipment.periods[period];
            return periodData ? Math.round(periodData.load) : 0;
          }),
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
        },
      ],
    } : {};

    return { machineNeedData, loadData };
  };

  const { machineNeedData, loadData } = prepareChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };



  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <PrecisionManufacturingIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        CofatGroup - Consolidation Équipements
      </Typography>

      {/* Boutons d'action */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadConsolidatedData}
          disabled={loading}
          color="primary"
        >
          Actualiser
        </Button>
        <Button
          variant="outlined"
          startIcon={<AnalyticsIcon />}
          disabled={loading}
          onClick={() => setSnackbar({ open: true, message: 'Fonctionnalité d\'analyse avancée à venir', severity: 'info' })}
        >
          Analyser
        </Button>
        {loading && <CircularProgress size={24} />}
      </Box>

      {/* Résumé statistique */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {summary.totalEquipments || 0}
                </Typography>
                <Typography variant="body2">
                  Équipements Uniques
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary">
                  {summary.totalSites || 0}
                </Typography>
                <Typography variant="body2">
                  Sites Actifs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {summary.totalPlanningEntries || 0}
                </Typography>
                <Typography variant="body2">
                  Entrées Planning
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {consolidatedData.filter(eq => eq.totalSites > 1).length}
                </Typography>
                <Typography variant="body2">
                  Équipements Multi-Sites
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Graphiques */}
      {consolidatedData.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top 5 - Besoins vs Disponibilité
              </Typography>
              <Box sx={{ height: 320 }}>
                {Object.keys(machineNeedData).length > 0 && (
                  <Bar data={machineNeedData} options={chartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Évolution de la Charge
              </Typography>
              <Box sx={{ height: 320 }}>
                {Object.keys(loadData).length > 0 && (
                  <Line data={loadData} options={chartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Table consolidée */}
      <Paper sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Équipements Consolidés ({consolidatedData.length})
        </Typography>

        {consolidatedData.map((equipmentData, index) => (
          <Accordion key={equipmentData.equipment.equipmentId}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {equipmentData.equipment.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {equipmentData.equipment.equipmentCode} - {equipmentData.equipment.referenceEquipment}
                  </Typography>
                </Box>
                <Tooltip title={`Sites: ${equipmentData.sites.join(', ')}`}>
                  <Chip
                    label={`${equipmentData.totalSites} sites`}
                    color={equipmentData.totalSites > 1 ? 'primary' : 'default'}
                    size="small"
                  />
                </Tooltip>
                <Chip
                  label={`${Object.keys(equipmentData.periods).length} périodes`}
                  color="secondary"
                  size="small"
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ overflow: 'auto' }}>
                <Table size="small" sx={{ minWidth: 1400 }}>
                  <TableHead>
                    {/* Première ligne d'en-tête avec les années */}
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        sx={{ fontWeight: 'bold', verticalAlign: 'middle', minWidth: 120 }}
                      >
                        Métrique
                      </TableCell>
                      {(detectVersion(equipmentData) === 'V1' ? yearColumnsV1 : yearColumnsV2).map(({ year, colspan }) => (
                        <TableCell
                          key={year}
                          colSpan={colspan}
                          align="center"
                          sx={{
                            fontWeight: 'bold',
                            backgroundColor: year === '2025' || year === '2026' ? '#1976d2' : year === '2027' ? '#7b1fa2' : '#512da8',
                            color: 'white'
                          }}
                        >
                          {year}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Deuxième ligne d'en-tête avec les périodes */}
                    <TableRow>
                      {Object.entries(detectVersion(equipmentData) === 'V1' ? periodsV1 : periodsV2).flatMap(([year, yearPeriods]) =>
                        yearPeriods.map((period) => (
                          <TableCell
                            key={`${year}-${period}`}
                            align="center"
                            sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '0.8rem' }}
                          >
                            {period}
                          </TableCell>
                        ))
                      )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {/* Ligne Machine Need */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Machine Need</TableCell>
                      {(detectVersion(equipmentData) === 'V1' ? allPeriodsV1 : allPeriodsV2).map((period) => {
                        const periodData = equipmentData.periods[period];
                        return (
                          <TableCell key={period} align="center">
                            {periodData ? periodData.machineNeed : 0}
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {/* Ligne Available Machine */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Available Machine</TableCell>
                      {(detectVersion(equipmentData) === 'V1' ? allPeriodsV1 : allPeriodsV2).map((period) => {
                        const periodData = equipmentData.periods[period];
                        return (
                          <TableCell key={period} align="center">
                            {periodData ? periodData.availableMachine : 0}
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {/* Ligne To Order */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>To Order</TableCell>
                      {(detectVersion(equipmentData) === 'V1' ? allPeriodsV1 : allPeriodsV2).map((period) => {
                        const periodData = equipmentData.periods[period];
                        return (
                          <TableCell key={period} align="center">
                            {periodData ? periodData.toOrder : 0}
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {/* Ligne Load (Occupation) */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Load (Occupation)</TableCell>
                      {(detectVersion(equipmentData) === 'V1' ? allPeriodsV1 : allPeriodsV2).map((period) => {
                        const periodData = equipmentData.periods[period];
                        const load = periodData ? Math.round(periodData.load) : 0;
                        return (
                          <TableCell
                            key={period}
                            align="center"
                            sx={{
                              backgroundColor: load > 100 ? '#ffebee' : load === 100 ? '#e8f5e8' : 'transparent',
                              color: load > 100 ? '#c62828' : load === 100 ? '#2e7d32' : 'inherit'
                            }}
                          >
                            {load}%
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Détails des sites pour cet équipement */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Sites concernés: {equipmentData.sites.join(', ')}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Message si aucune donnée */}
      {!loading && consolidatedData.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PrecisionManufacturingIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucun équipement consolidé trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Assurez-vous que des données de planification équipement existent
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
    </Box>
  );
};

export default CofatGroup;