import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  styled,
  useTheme as useMuiTheme,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Toolbar,
  IconButton,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import LanguageIcon from '@mui/icons-material/Language';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import EquipmentPlanningExcelImporter from './EquipmentPlanningExcelImporter';
import AddEquipmentButton from './AddEquipmentButton';
import { getAuthHeaders } from '../../../utils/apiUtils';
import notificationService from '../../../services/NotificationService';
import useTheme from '../../../hooks/useTheme';
import useNotifications from '../../../hooks/useNotifications';

// Import images
import mccWireImage from '../../../img/MCC WIRE.png';
import singleWireCCImage from '../../../img/single wire cc.png';
import cutCTubeImage from '../../../img/cut c tube.png';
import cutSTubeImage from '../../../img/cut s tube.png';
import crimpPressImage from '../../../img/crimp press.png';
import manualPressP40Image from '../../../img/manual press.png';
import manualPressP120P250Image from '../../../img/manual pressp120p150.png';
import solderingImage from '../../../img/soldering.png';
import spliceImage from '../../../img/splice.png';
import heatingTubeImage from '../../../img/heating tube.png';
import inkMarkingImage from '../../../img/INK MARKING Connector.png';
import manualOpCutSensorImage from '../../../img/MANUAL OP.png';
import strippingMccImage from '../../../img/STRIPPING MCC.png';
import puInjectionImage from '../../../img/PU INJECTION.png';
import manualPressP40ECapillaryImage from '../../../img/MANUAL PRESS CAPILLAY.png';
import manualOpSiliconeImage from '../../../img/MANUAL OPsilicone.png';
import wireMarkingWhiteImage from '../../../img/WIRE MARKING white.png';
import wireMarkingBlackImage from '../../../img/WIRE MARKING black.png';

// Styled components
const StyledTableContainer = styled(Paper)(({ theme }) => ({
  maxWidth: '100%',
  overflowX: 'auto',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  marginTop: theme.spacing(2),
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& th': {
    color: theme.palette.common.white,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: theme.spacing(1.5),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

// Constants
const initialMachines = [
  'MCC WIRE (PS-9550 / 9580)', 'SINGLE WIRE CC (ALPHA550)', 'CUT C TUBE (ULMER WSM30)',
  'CUT S TUBE (ULMER SM15)', 'CRIMP PRESS (BT752 / DELTA)', 'MANUAL PRESS (P40)',
  'MANUAL PRESS (P120 / P250)', 'SOLDERING (MAQUINEO)', 'SPLICE (SCHUNK MIII)',
  'HEATING TUBE (RAYCHEM)', 'INK MARKING Connector (WHITE / BLACK)', 'MANUAL OP (CUT SENSOR)',
  'STRIPPING MCC (JS8440)', 'PU INJECTION (CANNON)', 'MANUAL PRESS (P40E CAPILLAY)',
  'MANUAL OP (SILICONE)', 'WIRE MARKING (WHITE)', 'WIRE MARKING (BLACK)',
];

const machineImages = {
  'MCC WIRE (PS-9550 / 9580)': mccWireImage,
  'SINGLE WIRE CC (ALPHA550)': singleWireCCImage,
  'CUT C TUBE (ULMER WSM30)': cutCTubeImage,
  'CUT S TUBE (ULMER SM15)': cutSTubeImage,
  'CRIMP PRESS (BT752 / DELTA)': crimpPressImage,
  'MANUAL PRESS (P40)': manualPressP40Image,
  'MANUAL PRESS (P120 / P250)': manualPressP120P250Image,
  'SOLDERING (MAQUINEO)': solderingImage,
  'SPLICE (SCHUNK MIII)': spliceImage,
  'HEATING TUBE (RAYCHEM)': heatingTubeImage,
  'INK MARKING Connector (WHITE / BLACK)': inkMarkingImage,
  'MANUAL OP (CUT SENSOR)': manualOpCutSensorImage,
  'STRIPPING MCC (JS8440)': strippingMccImage,
  'PU INJECTION (CANNON)': puInjectionImage,
  'MANUAL PRESS (P40E CAPILLAY)': manualPressP40ECapillaryImage,
  'MANUAL OP (SILICONE)': manualOpSiliconeImage,
  'WIRE MARKING (WHITE)': wireMarkingWhiteImage,
  'WIRE MARKING (BLACK)': wireMarkingBlackImage,
};

// DÉFINITION DES PÉRIODES (V1: 2025-2027, V2: 2026-2028)
// V1 - Ancienne structure
const months2025 = Array.from({ length: 12 }, (_, i) => `MO ${String(i + 1).padStart(2, '0')}`);
const quarters2026_V1 = ['Q 01', 'Q 02', 'Q 03', 'Q 04'];
const quarters2027_V1 = ['Q 05', 'Q 06', 'Q 07', 'Q 08'];
const allPeriodsV1 = [...months2025, ...quarters2026_V1, ...quarters2027_V1];

// V2 - Nouvelle structure
const months2026 = Array.from({ length: 12 }, (_, i) => `MO ${String(i + 1).padStart(2, '0')}`);
const quarters2027 = ['Q 01', 'Q 02', 'Q 03', 'Q 04'];
const quarters2028 = ['Q 05', 'Q 06', 'Q 07', 'Q 08']; // Internal keys kept for DB mapping
const quarters2028Display = ['Q 01', 'Q 02', 'Q 03', 'Q 04']; // Display labels for 2028
const allPeriodsV2 = [...months2026, ...quarters2027, ...quarters2028];

// Par défaut pour l'initialisation (V2)
const allPeriods = allPeriodsV2;
const defaultRows = ['Machine need', 'Available machine', 'To order', 'Load (Occupation)'];

const decimalInputRegex = /^\d*(?:[.,]\d*)?$/;
const integerInputRegex = /^\d*$/;

const sanitizeNumericString = (value) => {
  if (value === null || value === undefined) return '';
  return value.toString().replace('%', '').trim();
};

const parseNumericValue = (value) => {
  const sanitized = sanitizeNumericString(value);
  if (sanitized === '') return null;
  const parsed = parseFloat(sanitized.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const API_BASE_URL = 'http://172.23.23.31:9001';

// Créer un composant Alert avec forwardRef pour React 19
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

// Debug functions
const debugSaveData = (equipmentData) => {
  console.log('=== DEBUG SAVE DATA ===');
  equipmentData.forEach((equipment, index) => {
    console.log(`Equipment ${index}: ${equipment.machine} (ID: ${equipment.equipmentId})`);
    equipment.data.forEach((row, rowIndex) => {
      const nonEmptyValues = row.values.filter(v => v !== '' && v !== '0').length;
      console.log(`  Row ${rowIndex} (${row.label}): ${nonEmptyValues} non-empty/non-zero values`);
      if (nonEmptyValues > 0) {
        row.values.forEach((val, colIndex) => {
          if (val !== '' && val !== '0') {
            console.log(`    ${allPeriods[colIndex]}: ${val} (Year: ${getYearForPeriod(allPeriods[colIndex])})`);
          }
        });
      }
    });
  });
  console.log('=== END DEBUG ===');
};

const debugLoadData = (apiData) => {
  console.log('=== DEBUG LOAD DATA ===');
  console.log('API Data length:', apiData.length);
  apiData.forEach((item, index) => {
    console.log(`Item ${index}:`, {
      equipmentId: item.Equipment?.equipmentId,
      equipmentName: item.Equipment?.nom,
      month: item.month,
      year: item.year,
      machineNeed: item.machineNeed,
      availableMachine: item.availableMachine,
      toOrder: item.toOrder,
      load: item.load,
    });
  });
  console.log('=== END DEBUG ===');
};

// FONCTION CORRIGÉE : Year calculation logic (Version Aware)
const getYearForPeriod = (period, version = 'V2') => {
  // === LOGIQUE V1 (2025-2027) ===
  if (version === 'V1') {
    if (period.startsWith('MO')) return 2025;

    // Q01-Q04 -> 2026
    if (quarters2026_V1.includes(period) || period.match(/^Q\s*(01|02|03|04)$/)) return 2026;

    // Q05-Q08 -> 2027
    if (quarters2027_V1.includes(period) || period.match(/^Q\s*(05|06|07|08)$/)) return 2027;

    return 2025; // Fallback V1
  }

  // === LOGIQUE V2 (2026-2028) ===
  if (period.startsWith('MO')) {
    return 2026;
  }

  // Vérification explicite pour 2027 (Q 01-04)
  if (quarters2027.includes(period)) {
    return 2027;
  }

  // Vérification explicite pour 2028 (Q 05-08)
  if (quarters2028.includes(period)) {
    return 2028;
  }

  // Vérification par pattern pour 2028
  if (period.match(/^Q\s*(05|06|07|08)$/)) {
    return 2028;
  }

  // Vérification par pattern pour 2027  
  if (period.match(/^Q\s*(01|02|03|04)$/)) {
    return 2027;
  }

  return 2026; // Default fallback V2
};

const SiteTable = () => {
  const { t, i18n } = useTranslation();
  const { theme: appTheme, toggleTheme, isDark } = useTheme();
  const muiTheme = useMuiTheme();
  const { site = 'tunis', section = 'equipement' } = useParams();
  const { notifySaveSuccess, notifyDeleteSuccess, notifyError } = useNotifications('Equipment Planning');

  // Aliases pour les sites (URL -> Nom en base) - Même système que SpaceTable
  const siteAliases = {
    'cofatec': 'Mexique',
    'mateur': 'Mateur',
    'tunis': 'Tunis',
    'brazil': 'Brazil',
    'egypt': 'Egypt',
    'kairouan': 'Kairouan',
    'maroc': 'Maroc'
  };

  const [machineList, setMachineList] = useState(initialMachines);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [equipmentData, setEquipmentData] = useState([]);
  const [user, setUser] = useState(null);

  // Role checks
  const isAdmin = user?.role === 'admin' || user?.role === 'super admin';
  const isUser = user?.role === 'user' || user?.role === 'User';
  const isReadOnly = isUser && !isAdmin;
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, machineIndex: null });
  const [equipments, setEquipments] = useState([]);
  const [sites, setSites] = useState([]);
  const [siteCode, setSiteCode] = useState(null); // Dynamique maintenant
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEquipments, setSelectedEquipments] = useState(new Set());

  // Calculer selectAll basé sur l'état actuel
  const selectAll = selectedEquipments.size === equipmentData.length && equipmentData.length > 0;

  const loadPlanningData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/equipment-planning/site/${siteCode}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des données');
      }

      debugLoadData(result.data);
      const apiData = result.data.reduce((acc, item) => {
        const equipment = item.Equipment;
        if (!equipment) return acc;

        let equipmentEntry = acc.find(eq => eq.equipmentId === equipment.equipmentId);
        if (!equipmentEntry) {
          equipmentEntry = {
            machine: equipment.nom,
            equipmentId: equipment.equipmentId,
            equipmentCode: equipment.equipmentCode,
            imagePath: equipment.imagePath,
            referenceEquipment: equipment.referenceEquipment,
            version: 'V2', // Default to V2
            tempData: [] // Store raw items temporarily
          };
          acc.push(equipmentEntry);
        }
        equipmentEntry.tempData.push(item);
        return acc;
      }, []);

      // Process each equipment to detect version and map data
      const processedData = apiData.map(entry => {
        // Detect version: if any item has year 2025, it's V1
        const has2025 = entry.tempData.some(item => item.year === 2025);
        const version = has2025 ? 'V1' : 'V2';
        const activePeriods = version === 'V1' ? allPeriodsV1 : allPeriodsV2;

        const mappedData = defaultRows.map(row => ({
          label: row,
          values: activePeriods.map(() => ''),
        }));

        entry.tempData.forEach(item => {
          const periodIndex = activePeriods.indexOf(item.month);
          if (periodIndex !== -1) {
            mappedData.forEach(row => {
              if (row.label === 'Machine need' && item.machineNeed != null) row.values[periodIndex] = item.machineNeed.toString();
              if (row.label === 'Available machine' && item.availableMachine != null) row.values[periodIndex] = item.availableMachine.toString();
              if (row.label === 'To order' && item.toOrder != null) row.values[periodIndex] = item.toOrder.toString();
              if (row.label === 'Load (Occupation)' && item.load != null) row.values[periodIndex] = item.load.toString();
            });
          }
        });

        // Clean up temp properties
        delete entry.tempData;

        return {
          ...entry,
          version,
          data: mappedData
        };
      });

      setEquipmentData(processedData);
      // Réinitialiser la sélection quand de nouvelles données sont chargées
      setSelectedEquipments(new Set());
      setFeedback({
        open: true,
        message: `Données de planning chargées avec succès (${apiData.length} équipements)`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des données de planning:', err);
      setFeedback({
        open: true,
        message: `Erreur: ${err.message}`,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [siteCode]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Erreur lors de l\'analyse de l\'utilisateur', err);
        setUser(null);
      }
    }

    const fetchEquipments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/equipment`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setEquipments(result.data);
          const equipmentNames = result.data.map(eq => eq.nom);
          setMachineList([...new Set([...initialMachines, ...equipmentNames])]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des équipements:', error);
        setFeedback({
          open: true,
          message: 'Erreur lors du chargement des équipements',
          severity: 'error',
        });
      }
    };

    const fetchSites = async () => {
      try {
        console.log('🌍 Equipment Planning - Chargement des sites disponibles...');
        const response = await fetch(`${API_BASE_URL}/api/sites`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setSites(result.data);
          console.log('✅ Sites chargés:', result.data.map(s => `${s.nom} (${s.code})`));

          // Déterminer le siteCode pour le site actuel avec les alias
          const siteParam = site.toLowerCase();
          const targetSiteName = siteAliases[siteParam] || site;

          console.log(`🔍 Equipment Planning - Recherche du site: URL="${site}" -> Cible="${targetSiteName}"`);

          const currentSite = result.data.find(s =>
            s.nom.toLowerCase() === targetSiteName.toLowerCase() ||
            s.code.toLowerCase() === siteParam ||
            s.nom.toLowerCase() === siteParam
          );

          if (currentSite) {
            setSiteCode(currentSite.code);
            console.log(`✅ Equipment Planning - Site trouvé: ${currentSite.nom} (${currentSite.code})`);
          } else {
            console.error(`❌ Equipment Planning - Site "${site}" non trouvé dans:`, result.data.map(s => s.nom));
            setSiteCode('TUN'); // Fallback
          }
        } else {
          throw new Error(result.error || 'Erreur lors du chargement des sites');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des sites:', err);
        setSiteCode('TUN'); // Fallback en cas d'erreur
        setFeedback({
          open: true,
          message: 'Erreur lors du chargement des sites',
          severity: 'error',
        });
      }
    };

    fetchEquipments();
    fetchSites(); // Charger les sites en premier pour déterminer siteCode
  }, [site]);

  // UseEffect séparé pour charger les données de planning quand siteCode est déterminé
  useEffect(() => {
    if (siteCode) {
      console.log(`📊 Equipment Planning - Chargement des données pour: ${site} (${siteCode})`);
      loadPlanningData();
    }
  }, [siteCode, loadPlanningData]);

  if (!user?.isAuthenticated) {
    return (
      <Box sx={{ p: 3, maxWidth: '100%' }}>
        <Typography variant="h6" color="error">Vous devez être connecté pour accéder à cette page.</Typography>
      </Box>
    );
  }

  const handleMachineSelect = (machine) => {
    if (machine) {
      const existingEquipmentIndex = equipmentData.findIndex(eq => eq.machine === machine);
      if (existingEquipmentIndex === -1) {
        const newTableData = defaultRows.map(row => ({
          label: row,
          values: allPeriodsV2.map(() => ''), // Default new equipment to V2
        }));

        const backendEquipment = equipments.find(eq => eq.nom === machine);
        setEquipmentData([...equipmentData, {
          machine,
          equipmentId: backendEquipment?.equipmentId || '',
          equipmentCode: backendEquipment?.equipmentCode || '',
          imagePath: backendEquipment?.imagePath || '',
          referenceEquipment: backendEquipment?.referenceEquipment || '',
          version: 'V2', // Explicitly V2 for new
          data: newTableData,
        }]);
      }
      setSelectedMachine(machine);
    }
  };

  const handleDataImported = ({ tableData, years, periods }) => {
    if (!selectedMachine) {
      setFeedback({
        open: true,
        message: 'Veuillez sélectionner une machine avant d\'importer des données.',
        severity: 'error',
      });
      return;
    }

    const validLabels = defaultRows.every(row => tableData.some(data => data.label === row));
    if (!validLabels) {
      setFeedback({
        open: true,
        message: 'Les données importées ne correspondent pas au format attendu.',
        severity: 'error',
      });
      return;
    }

    // S'assurer que les données importées ont la bonne longueur
    const normalizedTableData = tableData.map(row => ({
      ...row,
      values: row.values.slice(0, allPeriods.length).concat(
        Array(Math.max(0, allPeriods.length - row.values.length)).fill('')
      )
    }));

    const updatedEquipmentData = [...equipmentData];
    const existingIndex = updatedEquipmentData.findIndex(eq => eq.machine === selectedMachine);

    if (existingIndex !== -1) {
      updatedEquipmentData[existingIndex] = {
        ...updatedEquipmentData[existingIndex],
        data: normalizedTableData,
      };
    } else {
      const backendEquipment = equipments.find(eq => eq.nom === selectedMachine);
      updatedEquipmentData.push({
        machine: selectedMachine,
        equipmentId: backendEquipment?.equipmentId || '',
        equipmentCode: backendEquipment?.equipmentCode || '',
        imagePath: backendEquipment?.imagePath || '',
        referenceEquipment: backendEquipment?.referenceEquipment || '',
        data: normalizedTableData,
      });
    }

    setEquipmentData(updatedEquipmentData);
    setFeedback({
      open: true,
      message: `Données importées avec succès pour ${selectedMachine}`,
      severity: 'success',
    });
  };

  const handleAddEquipment = (newEquipment) => {
    if (!newEquipment.nom || machineList.includes(newEquipment.nom)) {
      setFeedback({
        open: true,
        message: 'Le nom de l\'équipement est vide ou existe déjà.',
        severity: 'error',
      });
      return;
    }

    setMachineList(prev => [...prev, newEquipment.nom]);
    setSelectedMachine(newEquipment.nom);

    const newTableData = defaultRows.map(row => ({
      label: row,
      values: allPeriodsV2.map(() => ''),
    }));

    setEquipmentData(prev => [...prev, {
      machine: newEquipment.nom,
      equipmentId: newEquipment.equipmentId,
      equipmentCode: newEquipment.equipmentCode,
      imagePath: newEquipment.imagePath,
      referenceEquipment: newEquipment.referenceEquipment,
      version: 'V2',
      data: newTableData,
    }]);

    setEquipments(prev => [...prev, newEquipment]);
    setFeedback({
      open: true,
      message: `Équipement "${newEquipment.nom}" ajouté avec succès`,
      severity: 'success',
    });
  };

  const handleChange = (equipmentIndex, rowIndex, colIndex, value) => {
    const updatedEquipmentData = [...equipmentData];
    if (updatedEquipmentData[equipmentIndex]?.data?.[rowIndex]?.values) {
      const targetRow = updatedEquipmentData[equipmentIndex].data[rowIndex];
      const isMachineNeed = targetRow.label === 'Machine need';
      const isLoadField = targetRow.label === 'Load (Occupation)';
      const isOtherNumeric = ['Available machine', 'To order'].includes(targetRow.label);
      const allowsDecimal = isMachineNeed || isLoadField;
      const regexToUse = allowsDecimal ? decimalInputRegex : integerInputRegex;

      if ((isMachineNeed || isLoadField || isOtherNumeric) && value !== '' && !regexToUse.test(value)) {
        setFeedback({
          open: true,
          message: allowsDecimal
            ? 'Veuillez entrer une valeur numérique (décimale autorisée, "," ou ".")'
            : 'Veuillez entrer une valeur numérique entière',
          severity: 'error',
        });
        return;
      }
      let nextValue = value;
      if (value !== '') {
        const sanitizedValue = sanitizeNumericString(value);
        if (sanitizedValue === '') {
          nextValue = '';
        } else if (allowsDecimal) {
          nextValue = sanitizedValue.replace(',', '.');
        } else {
          nextValue = sanitizedValue;
        }
      }
      targetRow.values[colIndex] = nextValue;
      setEquipmentData(updatedEquipmentData);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Début de la sauvegarde...');
      debugSaveData(equipmentData);

      const planningData = equipmentData.flatMap(equipment => {
        if (!equipment.equipmentId) {
          console.warn('❌ Missing equipmentId for machine:', equipment.machine);
          return [];
        }

        console.log(`📋 Traitement de l'équipement: ${equipment.machine} (ID: ${equipment.equipmentId})`);

        const version = equipment.version || 'V2';
        const activePeriods = version === 'V1' ? allPeriodsV1 : allPeriodsV2;

        const equipmentEntries = activePeriods.map((period, colIndex) => {
          const machineNeed = equipment.data.find(row => row.label === 'Machine need')?.values[colIndex] || '';
          const availableMachine = equipment.data.find(row => row.label === 'Available machine')?.values[colIndex] || '';
          const toOrder = equipment.data.find(row => row.label === 'To order')?.values[colIndex] || '';
          const load = equipment.data.find(row => row.label === 'Load (Occupation)')?.values[colIndex] || '';

          const hasAnyValue = (machineNeed !== '' && machineNeed !== '0') ||
            (availableMachine !== '' && availableMachine !== '0') ||
            (toOrder !== '' && toOrder !== '0') ||
            (load !== '' && load !== '0' && load !== '0.0');

          if (!hasAnyValue) {
            return null;
          }

          const yearForPeriod = getYearForPeriod(period);

          const parsedMachineNeed = parseNumericValue(machineNeed);
          const parsedAvailableMachine = parseNumericValue(availableMachine);
          const parsedToOrder = parseNumericValue(toOrder);
          const parsedLoad = parseNumericValue(load);

          // Validation et conversion strictes
          const entry = {
            equipmentId: equipment.equipmentId,
            year: parseInt(yearForPeriod),
            month: period.toString(),
            machineNeed: parsedMachineNeed !== null ? parsedMachineNeed : 0,
            availableMachine: parsedAvailableMachine !== null ? Math.trunc(parsedAvailableMachine) : 0,
            toOrder: parsedToOrder !== null ? Math.trunc(parsedToOrder) : 0,
            load: parsedLoad !== null ? parsedLoad : 0,
          };

          // Log spécialement pour 2027
          if (yearForPeriod === 2027 && (entry.machineNeed > 0 || entry.availableMachine > 0 || entry.toOrder > 0 || entry.load > 0)) {
            console.log(`🎯 Données 2027 détectées:`, {
              equipment: equipment.machine,
              period,
              year: yearForPeriod,
              data: entry
            });
          }

          // Validation des types
          if (isNaN(entry.year) || entry.year < 2026 || entry.year > 2030) {
            console.error(`❌ Année invalide pour ${equipment.machine}, période ${period}:`, entry.year);
            return null;
          }

          if (!entry.month || entry.month.trim() === '') {
            console.error(`❌ Mois invalide pour ${equipment.machine}:`, entry.month);
            return null;
          }

          return entry;
        });

        // Filtrer les entrées nulles
        const validEntries = equipmentEntries.filter(entry => entry !== null);
        console.log(`✅ ${validEntries.length}/${equipmentEntries.length} entrées valides pour ${equipment.machine}`);

        return validEntries;
      });

      if (planningData.length === 0) {
        throw new Error('Aucune donnée valide à sauvegarder');
      }

      // Statistiques par année pour debug
      const yearStats = planningData.reduce((acc, entry) => {
        acc[entry.year] = (acc[entry.year] || 0) + 1;
        return acc;
      }, {});

      console.log('📊 Statistiques par année avant envoi:', yearStats);
      console.log('📦 Échantillon des données à envoyer (premières 10):', planningData.slice(0, 10));

      const response = await fetch(`${API_BASE_URL}/api/equipment-planning/save`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: JSON.stringify({
          siteCode,
          planning: planningData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log('📨 Réponse du serveur:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      setFeedback({
        open: true,
        message: result.message || `Données sauvegardées avec succès pour ${site} – ${section}`,
        severity: 'success',
      });

      // Recharger les notifications globales
      setTimeout(() => {
        notificationService.loadNotificationsFromAPI();
      }, 500);

      // Reload data after save to ensure consistency
      console.log('🔄 Rechargement des données...');
      await loadPlanningData();

    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde des données de planning:', err);
      setFeedback({
        open: true,
        message: `Erreur: ${err.message}`,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (equipmentIndex) => {
    setConfirmDialog({
      open: true,
      machineIndex: equipmentIndex,
    });
  };

  const confirmDelete = async () => {
    if (confirmDialog.machineIndex !== null) {
      try {
        if (confirmDialog.machineIndex === 'bulk') {
          // Suppression en lot
          const selectedIndexes = Array.from(selectedEquipments).sort((a, b) => b - a); // Trier en ordre décroissant
          let deletedCount = 0;

          for (const index of selectedIndexes) {
            const equipment = equipmentData[index];
            if (equipment.equipmentId) {
              const response = await fetch(`${API_BASE_URL}/api/equipment-planning/delete/${siteCode}/${equipment.equipmentId}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erreur lors de la suppression de ${equipment.machine}:`, errorText);
              } else {
                deletedCount++;
              }
            }
          }

          // Supprimer les éléments du tableau (en ordre décroissant pour ne pas décaler les indices)
          const updatedEquipmentData = [...equipmentData];
          for (const index of selectedIndexes) {
            updatedEquipmentData.splice(index, 1);
          }

          setEquipmentData(updatedEquipmentData);
          setSelectedEquipments(new Set()); // Vider la sélection

          setFeedback({
            open: true,
            message: `${deletedCount} équipement(s) supprimé(s) avec succès`,
            severity: 'success',
          });

          // Recharger les notifications globales avec un délai
          setTimeout(() => {
            notificationService.loadNotificationsFromAPI();
          }, 500);
        } else {
          // Suppression individuelle
          const equipment = equipmentData[confirmDialog.machineIndex];
          if (equipment.equipmentId) {
            const response = await fetch(`${API_BASE_URL}/api/equipment-planning/delete/${siteCode}/${equipment.equipmentId}`, {
              method: 'DELETE',
            });
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }
          }

          const updatedEquipmentData = [...equipmentData];
          updatedEquipmentData.splice(confirmDialog.machineIndex, 1);
          setEquipmentData(updatedEquipmentData);

          // Mettre à jour la sélection si l'élément supprimé était sélectionné
          const newSelected = new Set(selectedEquipments);
          newSelected.delete(confirmDialog.machineIndex);

          // Ajuster les indices des éléments sélectionnés
          const adjustedSelected = new Set();
          newSelected.forEach(index => {
            if (index < confirmDialog.machineIndex) {
              adjustedSelected.add(index);
            } else if (index > confirmDialog.machineIndex) {
              adjustedSelected.add(index - 1);
            }
          });

          setSelectedEquipments(adjustedSelected);
          setFeedback({
            open: true,
            message: 'Données d\'équipement supprimées avec succès',
            severity: 'success',
          });

          // Recharger les notifications globales avec un délai
          setTimeout(() => {
            notificationService.loadNotificationsFromAPI();
          }, 500);
        }
      } catch (err) {
        console.error('Erreur lors de la suppression des données de planning:', err);
        setFeedback({
          open: true,
          message: `Erreur: ${err.message}`,
          severity: 'error',
        });
      }
    }
    setConfirmDialog({ open: false, machineIndex: null });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, machineIndex: null });
  };

  // Fonctions de gestion de la sélection
  const handleSelectEquipment = (equipmentIndex) => {
    const newSelected = new Set(selectedEquipments);
    if (newSelected.has(equipmentIndex)) {
      newSelected.delete(equipmentIndex);
    } else {
      newSelected.add(equipmentIndex);
    }
    setSelectedEquipments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEquipments(new Set());
    } else {
      const allIndexes = new Set(equipmentData.map((_, index) => index));
      setSelectedEquipments(allIndexes);
    }
  };

  // Actions groupées
  const handleBulkSave = async () => {
    if (selectedEquipments.size === 0) {
      setFeedback({
        open: true,
        message: 'Veuillez sélectionner au moins un équipement à sauvegarder.',
        severity: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Début de la sauvegarde groupée...');

      // Filtrer les données pour ne sauvegarder que les équipements sélectionnés
      const selectedEquipmentData = equipmentData.filter((_, index) => selectedEquipments.has(index));
      debugSaveData(selectedEquipmentData);

      const planningData = selectedEquipmentData.flatMap(equipment => {
        if (!equipment.equipmentId) {
          console.warn('❌ Missing equipmentId for machine:', equipment.machine);
          return [];
        }

        console.log(`📋 Traitement de l'équipement: ${equipment.machine} (ID: ${equipment.equipmentId})`);

        const equipmentEntries = allPeriods.map((period, colIndex) => {
          const machineNeed = equipment.data.find(row => row.label === 'Machine need')?.values[colIndex] || '';
          const availableMachine = equipment.data.find(row => row.label === 'Available machine')?.values[colIndex] || '';
          const toOrder = equipment.data.find(row => row.label === 'To order')?.values[colIndex] || '';
          const load = equipment.data.find(row => row.label === 'Load (Occupation)')?.values[colIndex] || '';

          const hasAnyValue = (machineNeed !== '' && machineNeed !== '0') ||
            (availableMachine !== '' && availableMachine !== '0') ||
            (toOrder !== '' && toOrder !== '0') ||
            (load !== '' && load !== '0' && load !== '0.0');

          if (!hasAnyValue) {
            return null;
          }

          const yearForPeriod = getYearForPeriod(period);

          const parsedMachineNeed = parseNumericValue(machineNeed);
          const parsedAvailableMachine = parseNumericValue(availableMachine);
          const parsedToOrder = parseNumericValue(toOrder);
          const parsedLoad = parseNumericValue(load);

          const entry = {
            equipmentId: equipment.equipmentId,
            year: parseInt(yearForPeriod),
            month: period.toString(),
            machineNeed: parsedMachineNeed !== null ? Math.trunc(parsedMachineNeed) : 0,
            availableMachine: parsedAvailableMachine !== null ? Math.trunc(parsedAvailableMachine) : 0,
            toOrder: parsedToOrder !== null ? Math.trunc(parsedToOrder) : 0,
            load: parsedLoad !== null ? parsedLoad : 0,
          };

          if (yearForPeriod === 2027 && (entry.machineNeed > 0 || entry.availableMachine > 0 || entry.toOrder > 0 || entry.load > 0)) {
            console.log(`🎯 Données 2027 détectées:`, {
              equipment: equipment.machine,
              period,
              year: yearForPeriod,
              data: entry
            });
          }

          if (isNaN(entry.year) || entry.year < 2025 || entry.year > 2030) {
            console.error(`❌ Année invalide pour ${equipment.machine}, période ${period}:`, entry.year);
            return null;
          }

          if (!entry.month || entry.month.trim() === '') {
            console.error(`❌ Mois invalide pour ${equipment.machine}:`, entry.month);
            return null;
          }

          return entry;
        });

        const validEntries = equipmentEntries.filter(entry => entry !== null);
        console.log(`✅ ${validEntries.length}/${equipmentEntries.length} entrées valides pour ${equipment.machine}`);

        return validEntries;
      });

      if (planningData.length === 0) {
        throw new Error('Aucune donnée valide à sauvegarder');
      }

      const yearStats = planningData.reduce((acc, entry) => {
        acc[entry.year] = (acc[entry.year] || 0) + 1;
        return acc;
      }, {});

      console.log('📊 Statistiques par année avant envoi:', yearStats);

      const response = await fetch(`${API_BASE_URL}/api/equipment-planning/save`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: JSON.stringify({
          siteCode,
          planning: planningData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log('📨 Réponse du serveur:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      setFeedback({
        open: true,
        message: t('equipmentsSavedSuccess', `${selectedEquipments.size} équipement(s) sauvegardé(s) avec succès`),
        severity: 'success',
      });

      // Reload data after save to ensure consistency
      console.log('🔄 Rechargement des données...');
      await loadPlanningData();

    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde groupée:', err);
      setFeedback({
        open: true,
        message: t('errorSavingData', 'Erreur: ') + err.message,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEquipments.size === 0) {
      setFeedback({
        open: true,
        message: t('selectEquipmentToDelete', 'Veuillez sélectionner au moins un équipement à supprimer.'),
        severity: 'warning',
      });
      return;
    }

    setConfirmDialog({
      open: true,
      machineIndex: 'bulk',
    });
  };

  const handleBulkRefresh = async () => {
    if (selectedEquipments.size === 0) {
      setFeedback({
        open: true,
        message: t('selectEquipmentToRefresh', 'Veuillez sélectionner au moins un équipement à actualiser.'),
        severity: 'warning',
      });
      return;
    }

    await loadPlanningData();
    setFeedback({
      open: true,
      message: t('dataRefreshedSuccess', `Données actualisées pour ${selectedEquipments.size} équipement(s) sélectionné(s)`),
      severity: 'success',
    });
  };

  const handleCloseFeedback = () => {
    setFeedback({ ...feedback, open: false });
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    const normalizedPath = filePath.replace(/\\/g, '/');
    const relativePath = normalizedPath.includes('Uploads/') ? normalizedPath.split('Uploads/')[1] : normalizedPath;
    return `${API_BASE_URL}/Uploads/${relativePath}`;
  };

  const currentSite = sites.find(s => s.code === siteCode);
  const siteId = currentSite ? currentSite.id : null;

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: muiTheme.palette.primary.main }}>
        {t('planningEquipment', 'Planification Équipement')} - {section} - {site}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('selectEquipment', 'Sélectionner un équipement')}</InputLabel>
          <Select value={selectedMachine} onChange={(e) => handleMachineSelect(e.target.value)} label={t('selectEquipment', 'Sélectionner un équipement')}>
            <MenuItem value="">{t('selectEquipment', 'Sélectionner un équipement')}</MenuItem>
            {machineList.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        </FormControl>

        {!isReadOnly && (
          <EquipmentPlanningExcelImporter onDataImported={handleDataImported} />
        )}

        {isAdmin && (
          <AddEquipmentButton onEquipmentAdded={handleAddEquipment} site={{ id: siteId, code: siteCode }} />
        )}

        {/* Language Switcher */}
        <IconButton
          onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
          color="primary"
          title={t('changeLanguage')}
          sx={{ ml: 'auto' }}
        >
          <LanguageIcon />
          <Typography variant="caption" sx={{ ml: 0.5 }}>{i18n.language.toUpperCase()}</Typography>
        </IconButton>

        {/* Theme Toggle */}
        <IconButton
          onClick={toggleTheme}
          color="primary"
          title={t('toggleTheme')}
        >
          {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      {isLoading && <CircularProgress sx={{ mt: 2, display: 'block', mx: 'auto' }} />}

      {equipmentData.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, backgroundColor: muiTheme.palette.grey[100], borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  indeterminate={selectedEquipments.size > 0 && selectedEquipments.size < equipmentData.length}
                  checked={selectAll}
                  onChange={handleSelectAll}
                  color="primary"
                />
              }
              label={t('selectAll', 'Sélectionner tout') + ` (${selectedEquipments.size}/${equipmentData.length})`}
            />

            {selectedEquipments.size > 0 && (
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                {isAdmin && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleBulkSave}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                      disabled={isLoading}
                    >
                      {t('save', 'Sauvegarder')} ({selectedEquipments.size})
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleBulkDelete}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                      disabled={isLoading}
                    >
                      {t('delete', 'Supprimer')} ({selectedEquipments.size})
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<RefreshIcon />}
                  onClick={handleBulkRefresh}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                  disabled={isLoading}
                >
                  {t('refresh', 'Recharger')} ({selectedEquipments.size})
                </Button>
              </Box>
            )}
          </Toolbar>
        </Box >
      )}

      {
        equipmentData.map((equipment, equipmentIndex) => {
          if (!equipment || !Array.isArray(equipment.data)) {
            console.warn(`Invalid equipment entry at index ${equipmentIndex}:`, equipment);
            return null;
          }

          let imageSource = equipment.imagePath ? getFileUrl(equipment.imagePath) : machineImages[equipment.machine] || '';

          return (
            <Box key={`${equipment.machine}-${equipmentIndex}`} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', mb: 2, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Checkbox
                    checked={selectedEquipments.has(equipmentIndex)}
                    onChange={() => handleSelectEquipment(equipmentIndex)}
                    color="primary"
                    sx={{ mt: 1, mr: 1 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <img
                      src={imageSource}
                      alt={equipment.machine}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '8px', marginRight: muiTheme.spacing(2), border: '1px solid #e0e0e0' }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{equipment.machine}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {equipment.equipmentId || 'N/A'}, Code: {equipment.equipmentCode || 'N/A'}, Ref: {equipment.referenceEquipment || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(equipmentIndex)}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Supprimer
                  </Button>
                )}
              </Box>

              <StyledTableContainer>
                <Table>
                  <StyledTableHead>
                    <TableRow>
                      <TableCell rowSpan={3}></TableCell>
                      {(equipment.version === 'V1' ?
                        [
                          { label: '2025', cols: months2025.length, color: muiTheme.palette.primary.dark },
                          { label: '2026', cols: quarters2026_V1.length, color: muiTheme.palette.primary.dark },
                          { label: '2027', cols: quarters2027_V1.length, color: muiTheme.palette.primary.dark }
                        ] :
                        [
                          { label: '2026', cols: months2026.length, color: muiTheme.palette.primary.dark },
                          { label: '2027', cols: quarters2027.length, color: muiTheme.palette.primary.dark },
                          { label: '2028', cols: quarters2028.length, color: muiTheme.palette.primary.dark }
                        ]
                      ).map((header, idx) => (
                        <TableCell key={idx} colSpan={header.cols} align="center" sx={{ backgroundColor: header.color }}>
                          {header.label}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={months2026.length} align="center" sx={{ backgroundColor: muiTheme.palette.primary.main, fontSize: '0.875rem' }}>
                        Mois
                      </TableCell>
                      <TableCell colSpan={quarters2027.length} align="center" sx={{ backgroundColor: muiTheme.palette.primary.main, fontSize: '0.875rem' }}>
                        Trimestres
                      </TableCell>
                      <TableCell colSpan={quarters2028.length} align="center" sx={{ backgroundColor: muiTheme.palette.primary.main, fontSize: '0.875rem' }}>
                        Trimestres
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {(equipment.version === 'V1' ? allPeriodsV1 : allPeriodsV2).map((period, i) => {
                        let backgroundColor = muiTheme.palette.primary.light;
                        const limit = equipment.version === 'V1'
                          ? months2025.length + quarters2026_V1.length
                          : months2026.length + quarters2027.length;

                        if (i >= limit) {
                          backgroundColor = muiTheme.palette.secondary.light;
                        }

                        // For V2: display Q 01-Q 04 for 2028 periods (index >= limit)
                        let displayPeriod = period;
                        if (equipment.version !== 'V1' && i >= limit) {
                          const quarterIdx = i - limit;
                          displayPeriod = quarters2028Display[quarterIdx] || period;
                        }

                        return (
                          <TableCell
                            key={i}
                            align="center"
                            sx={{
                              backgroundColor,
                              fontSize: '0.75rem',
                              padding: '8px 4px',
                              fontWeight: 'bold',
                              color: i >= limit ? muiTheme.palette.secondary.contrastText : muiTheme.palette.primary.contrastText
                            }}>
                            {displayPeriod}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {equipment.data.map((row, rowIndex) => {
                      const isLoadRow = row.label === 'Load (Occupation)';
                      return (
                        <StyledTableRow key={rowIndex}>
                          <TableCell sx={{ fontWeight: 'bold' }}>{row.label}</TableCell>
                          {Array.isArray(row.values) ? (
                            row.values.map((val, colIndex) => {
                              // Formater la valeur pour l'affichage
                              let displayValue = val;
                              if (isLoadRow && val) {
                                const numVal = parseNumericValue(val);
                                if (numVal !== null) {
                                  // Si la valeur est < 1, c'est une décimale (0.94), convertir en pourcentage
                                  if (numVal < 1 && numVal > 0) {
                                    displayValue = Math.round(numVal * 100) + '%';
                                  } else if (numVal >= 1 && numVal <= 100) {
                                    // Si c'est déjà un pourcentage (94), ajouter juste le %
                                    displayValue = Math.round(numVal) + '%';
                                  } else {
                                    displayValue = val;
                                  }
                                }
                              }

                              return (
                                <TableCell key={colIndex} align="center">
                                  <input
                                    type="text"
                                    value={displayValue}
                                    onChange={(e) => handleChange(equipmentIndex, rowIndex, colIndex, e.target.value)}
                                    style={{
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                      padding: '4px',
                                      width: '80px',
                                      textAlign: 'center',
                                      backgroundColor: isLoadRow ? '#e8f5e9' : 'white'
                                    }}
                                    readOnly={isLoadRow || isReadOnly || !isAdmin}
                                  />
                                </TableCell>
                              );
                            })
                          ) : (
                            <TableCell colSpan={(equipment.version === 'V1' ? allPeriodsV1 : allPeriodsV2).length} align="center">
                              No data available
                            </TableCell>
                          )}
                        </StyledTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Box>
          );
        })
      }

      {
        equipmentData.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
                disabled={isLoading}
              >
                Sauvegarder
              </Button>
            )}
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={loadPlanningData}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
              disabled={isLoading}
            >
              Recharger
            </Button>
          </Box>
        )
      }

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          {confirmDialog.machineIndex === 'bulk'
            ? `Êtes-vous sûr de vouloir supprimer les ${selectedEquipments.size} équipement(s) sélectionné(s) et toutes leurs données ?`
            : 'Êtes-vous sûr de vouloir supprimer cet équipement et toutes ses données ?'
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
};

export default SiteTable;