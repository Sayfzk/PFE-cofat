// routes/cofatGroupRoutes.js
const express = require('express');
const router = express.Router();
const { Site, Equipment, EquipmentPlanning, Spaces, HR } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../db');
const { compatibleAuthOptional } = require('../middlewares/compatibleAuth');

// GET /api/cofat-group/consolidated - Récupérer les données consolidées par équipement
router.get('/consolidated', compatibleAuthOptional, async (req, res) => {
  try {
    console.log('🔄 CofatGroup Equipment - Début récupération données consolidées...');

    // Récupérer tous les équipements avec leurs données de planning
    const consolidatedData = await EquipmentPlanning.findAll({
      include: [
        {
          model: Equipment,
          attributes: ['id', 'equipmentId', 'equipmentCode', 'nom', 'imagePath', 'referenceEquipment'],
        },
        {
          model: Site,
          attributes: ['id', 'code', 'nom'],
        },
      ],
      order: [
        [Equipment, 'nom', 'ASC'],
        ['year', 'ASC'],
        ['month', 'ASC'],
        [Site, 'nom', 'ASC'],
      ],
    });

    console.log(`📊 CofatGroup Equipment - ${consolidatedData.length} entrées récupérées depuis la base`);

    // 🔍 DEBUG: Vérifier les données CAO63 pour 2027
    const cao63Entries = consolidatedData.filter(entry => entry.Equipment.nom?.includes('CAO'));
    if (cao63Entries.length > 0) {
      console.log('🔍 DEBUG CAO63 - Entrées trouvées:', cao63Entries.length);
      cao63Entries.forEach(entry => {
        if (entry.year === 2027) {
          console.log(`🔍 DEBUG CAO63 - 2027 ${entry.month}: Site=${entry.Site.nom}, MachineNeed=${entry.machineNeed}, Available=${entry.availableMachine}, ToOrder=${entry.toOrder}, Load=${entry.load}`);
        }
      });
    }

    // Grouper les données par equipmentId pour agrégation
    const groupedByEquipment = consolidatedData.reduce((acc, entry) => {
      const equipmentKey = entry.Equipment.equipmentId;
      const periodKey = `${entry.year}-${entry.month}`;

      if (!acc[equipmentKey]) {
        acc[equipmentKey] = {
          equipment: {
            id: entry.Equipment.id,
            equipmentId: entry.Equipment.equipmentId,
            equipmentCode: entry.Equipment.equipmentCode,
            nom: entry.Equipment.nom,
            imagePath: entry.Equipment.imagePath,
            referenceEquipment: entry.Equipment.referenceEquipment
          },
          sites: new Set(),
          periods: {},
          totalSites: 0
        };
      }

      // Ajouter le site à la liste
      acc[equipmentKey].sites.add(entry.Site.nom);

      // Initialiser la période si elle n'existe pas
      if (!acc[equipmentKey].periods[periodKey]) {
        acc[equipmentKey].periods[periodKey] = {
          year: entry.year,
          month: entry.month,
          machineNeed: 0,
          availableMachine: 0,
          toOrder: 0,
          load: 0,
          sitesCount: 0,
          siteDetails: []
        };
      }

      // Additionner les valeurs
      const period = acc[equipmentKey].periods[periodKey];
      period.machineNeed += entry.machineNeed || 0;
      period.availableMachine += entry.availableMachine || 0;
      period.toOrder += entry.toOrder || 0;
      // Load (Occupation) doit être sommé tel quel (valeur brute, non pourcentage)
      // Load (Occupation) doit être sommé tel quel (valeur brute, non pourcentage)
      period.load += entry.load || 0;
      period.sitesCount += 1;

      // Ajouter les détails du site pour cette période
      period.siteDetails.push({
        siteName: entry.Site.nom,
        siteCode: entry.Site.code,
        machineNeed: entry.machineNeed || 0,
        availableMachine: entry.availableMachine || 0,
        toOrder: entry.toOrder || 0,
        load: entry.load || 0
      });

      return acc;
    }, {});

    // Transformer en format final pour le frontend
    const consolidatedEquipments = Object.keys(groupedByEquipment).map(equipmentKey => {
      const equipmentData = groupedByEquipment[equipmentKey];

      // Convertir Set en Array et compter les sites uniques
      const uniqueSites = Array.from(equipmentData.sites);
      equipmentData.totalSites = uniqueSites.length;

      // 👉 Charge consolidée = somme des Load (Occupation) de tous les sites
      // On conserve period.load tel qu'accumulé plus haut pour refléter la somme globale.
      // IMPORTANT: La base de données stocke des ratios (0.xx), mais le front attend des pourcentages (xx).
      // On multiplie donc par 100 pour l'affichage.
      Object.keys(equipmentData.periods).forEach(periodKey => {
        const period = equipmentData.periods[periodKey];
        // Load (Occupation) consolidated = Sum (Percentage Site A + Percentage Site B + ...)
        // The values stored in DB are ratios (0.45). The sum of ratios (0.45 + 0.50 = 0.95) must be multiplied by 100 to display 95%.
        // If the sum exceeds 1 (e.g. 115%), it will display 115%, which is the user's desired behavior.
        period.load = period.load * 100;
        period.totalLoad = period.load;
      });

      return {
        equipment: equipmentData.equipment,
        sites: uniqueSites,
        totalSites: equipmentData.totalSites,
        periods: equipmentData.periods
      };
    });

    console.log(`✅ CofatGroup Equipment - ${consolidatedEquipments.length} équipements consolidés`);

    // 🔍 DEBUG: Vérifier la consolidation CAO63 pour 2027
    const cao63Consolidated = consolidatedEquipments.find(eq => eq.equipment.nom?.includes('CAO'));
    if (cao63Consolidated) {
      console.log('🔍 DEBUG CAO63 Consolidé - Périodes disponibles:', Object.keys(cao63Consolidated.periods));
      Object.keys(cao63Consolidated.periods).forEach(period => {
        if (period.startsWith('2027')) {
          console.log(`🔍 DEBUG CAO63 Consolidé - ${period}:`, cao63Consolidated.periods[period]);
        }
      });
    }

    res.json({
      success: true,
      data: consolidatedEquipments,
      count: consolidatedEquipments.length,
      summary: {
        totalEquipments: consolidatedEquipments.length,
        totalSites: await Site.count(),
        totalPlanningEntries: consolidatedData.length
      }
    });

  } catch (err) {
    console.error('❌ Erreur CofatGroup consolidation:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la consolidation des données',
      details: err.message
    });
  }
});

// GET /api/cofat-group/space/consolidated - Consolidation Space (tous les sites)
router.get('/space/consolidated', compatibleAuthOptional, async (req, res) => {
  try {
    console.log('🔄 CofatGroup Space - Début consolidation...');

    // Récupérer toutes les données Space de tous les sites
    const spaceData = await Spaces.findAll({
      include: [{
        model: Site,
        attributes: ['id', 'code', 'nom'],
      }],
      order: [
        ['type', 'ASC'],
        ['year', 'ASC'],
        ['month', 'ASC'],
        [Site, 'nom', 'ASC'],
      ],
    });

    console.log(`📊 CofatGroup Space - ${spaceData.length} entrées récupérées`);

    // Grouper par type et période pour consolider
    const consolidatedByType = {};

    spaceData.forEach(entry => {
      const typeKey = entry.type;
      const periodKey = `${entry.year}-${entry.month}`;

      if (!consolidatedByType[typeKey]) {
        consolidatedByType[typeKey] = {
          type: entry.type,
          category: entry.category,
          sites: new Set(),
          periods: {}
        };
      }

      consolidatedByType[typeKey].sites.add(entry.Site.nom);

      if (!consolidatedByType[typeKey].periods[periodKey]) {
        consolidatedByType[typeKey].periods[periodKey] = {
          year: entry.year,
          month: entry.month,
          totalArea: 0,
          totalCutting: 0,
          totalLeadPrep: 0,
          totalScania: 0,
          totalClaas: 0,
          totalVw: 0,
          totalProject4: 0,
          totalProject5: 0,
          totalProject6: 0,
          totalProject7: 0,
          totalAssembly: 0,
          sitesCount: 0,
          siteDetails: []
        };
      }

      const period = consolidatedByType[typeKey].periods[periodKey];
      period.totalArea += entry.area || 0;

      // Ajouter les totaux par type
      if (entry.type === "Cutting area") period.totalCutting += entry.area || 0;
      if (entry.type === "Lead prep") period.totalLeadPrep += entry.area || 0;
      if (entry.type === "SCANIA") period.totalScania += entry.area || 0;
      if (entry.type === "CLAAS") period.totalClaas += entry.area || 0;
      if (entry.type === "VW") period.totalVw += entry.area || 0;
      if (entry.type === "PROJECT 4") period.totalProject4 += entry.area || 0;
      if (entry.type === "PROJECT 5") period.totalProject5 += entry.area || 0;
      if (entry.type === "PROJECT 6") period.totalProject6 += entry.area || 0;
      if (entry.type === "PROJECT 7") period.totalProject7 += entry.area || 0;
      if (entry.category === "Assembly") period.totalAssembly += entry.area || 0;
      period.sitesCount += 1;
      period.siteDetails.push({
        siteName: entry.Site.nom,
        siteCode: entry.Site.code,
        area: entry.area || 0
      });
    });

    // Transformer en tableau
    const consolidatedSpace = Object.values(consolidatedByType).map(item => ({
      type: item.type,
      category: item.category,
      sites: Array.from(item.sites),
      totalSites: item.sites.size,
      periods: item.periods
    }));

    console.log(`✅ CofatGroup Space - ${consolidatedSpace.length} types consolidés`);

    res.json({
      success: true,
      data: consolidatedSpace,
      count: consolidatedSpace.length,
      summary: {
        totalTypes: consolidatedSpace.length,
        totalSites: await Site.count(),
        totalEntries: spaceData.length
      }
    });

  } catch (err) {
    console.error('❌ Erreur CofatGroup Space:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la consolidation Space',
      details: err.message
    });
  }
});

// GET /api/cofat-group/hr/consolidated - Consolidation HR (tous les sites)
router.get('/hr/consolidated', compatibleAuthOptional, async (req, res) => {
  try {
    console.log('🔄 CofatGroup HR - Début consolidation...');

    // Récupérer toutes les données HR de tous les sites
    const hrData = await HR.findAll({
      include: [{
        model: Site,
        attributes: ['id', 'code', 'nom'],
      }],
      order: [
        ['type', 'ASC'],
        ['year', 'ASC'],
        ['month', 'ASC'],
        [Site, 'nom', 'ASC'],
      ],
    });

    console.log(`📊 CofatGroup HR - ${hrData.length} entrées récupérées`);

    // Grouper par type et période pour consolider
    const consolidatedByType = {};

    hrData.forEach(entry => {
      const typeKey = entry.type;
      const periodKey = `${entry.year}-${entry.month}`;

      if (!consolidatedByType[typeKey]) {
        consolidatedByType[typeKey] = {
          type: entry.type,
          category: entry.category,
          sites: new Set(),
          periods: {}
        };
      }

      consolidatedByType[typeKey].sites.add(entry.Site.nom);

      if (!consolidatedByType[typeKey].periods[periodKey]) {
        consolidatedByType[typeKey].periods[periodKey] = {
          year: entry.year,
          month: entry.month,
          totalCount: 0,
          sitesCount: 0,
          siteDetails: []
        };
      }

      const period = consolidatedByType[typeKey].periods[periodKey];
      period.totalCount += entry.count || 0;
      period.sitesCount += 1;
      period.siteDetails.push({
        siteName: entry.Site.nom,
        siteCode: entry.Site.code,
        count: entry.count || 0
      });
    });

    // Transformer en tableau
    const consolidatedHR = Object.values(consolidatedByType).map(item => ({
      type: item.type,
      category: item.category,
      sites: Array.from(item.sites),
      totalSites: item.sites.size,
      periods: item.periods
    }));

    console.log(`✅ CofatGroup HR - ${consolidatedHR.length} types consolidés`);

    res.json({
      success: true,
      data: consolidatedHR,
      count: consolidatedHR.length,
      summary: {
        totalTypes: consolidatedHR.length,
        totalSites: await Site.count(),
        totalEntries: hrData.length
      }
    });

  } catch (err) {
    console.error('❌ Erreur CofatGroup HR:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la consolidation HR',
      details: err.message
    });
  }
});

// GET /api/cofat-group/space - Route pour consolidation Space avec projets Assembly détaillés
router.get('/space', compatibleAuthOptional, async (req, res) => {
  try {
    console.log('🔄 CofatGroup Space - Récupération données consolidées avec projets Assembly détaillés...');

    // Récupérer toutes les données Space de tous les sites
    const spaceData = await Spaces.findAll({
      include: [{
        model: Site,
        attributes: ['id', 'code', 'nom'],
      }],
      order: [
        [Site, 'nom', 'ASC'],
        ['type', 'ASC'],
        ['year', 'ASC'],
        ['month', 'ASC'],
      ],
    });

    console.log(`📊 CofatGroup Space - ${spaceData.length} entrées récupérées`);

    // Log des types disponibles pour debug
    const availableTypes = [...new Set(spaceData.map(item => item.type))];
    console.log(`🔍 Types Space disponibles:`, availableTypes);

    // Détecter dynamiquement les années et périodes disponibles
    const yearsSet = new Set();
    const periodsMap = {};

    spaceData.forEach(item => {
      yearsSet.add(item.year);
      if (!periodsMap[item.year]) {
        periodsMap[item.year] = new Set();
      }
      periodsMap[item.year].add(item.month);
    });

    const years = Array.from(yearsSet).sort();
    const periods = {};
    years.forEach(year => {
      periods[year] = Array.from(periodsMap[year]).sort();
    });

    // Générer la liste des mois dans l'ordre
    const months = [];
    years.forEach(year => {
      periods[year].forEach(month => {
        months.push(month);
      });
    });

    console.log(`📅 Années détectées: ${years.join(', ')}`);
    console.log(`📅 Total périodes: ${months.length}`);

    // Fonction pour obtenir l'index du mois
    const getMonthIndex = (year, month) => {
      let index = 0;
      for (const y of years) {
        if (y === year) {
          const monthIndex = periods[y].indexOf(month);
          return index + monthIndex;
        }
        index += periods[y].length;
      }
      return -1;
    };

    const totalPeriods = months.length;

    // 1. Initialiser les structures de données
    const cuttingArea = new Array(totalPeriods).fill(0);
    const leadPrep = new Array(totalPeriods).fill(0);

    // Structure pour accumuler les données PAR SITE
    const siteData = {};

    // 2. Parcourir les données et peupler les structures
    spaceData.forEach(entry => {
      const monthIndex = getMonthIndex(entry.year, entry.month);
      if (monthIndex < 0 || monthIndex >= totalPeriods) return;

      const type = entry.type;
      const area = entry.area || 0;
      const siteName = entry.Site.nom;

      // Normaliser le type pour la vérification insensible à la casse
      const normalizedType = type.toUpperCase().trim();

      // Initialiser les données du site si nécessaire
      if (!siteData[siteName]) {
        siteData[siteName] = {
          cutting: new Array(totalPeriods).fill(0),
          leadPrep: new Array(totalPeriods).fill(0),
          assembly: new Array(totalPeriods).fill(0),


          totalArea: new Array(totalPeriods).fill(0),
          totalAreaNeeded: new Array(totalPeriods).fill(0),
          availableSpace: new Array(totalPeriods).fill(0),
          occupation: new Array(totalPeriods).fill(0),
          hasExplicitTotalArea: false,
          hasExplicitNeeded: false,
          hasExplicitAvailable: false,
          hasExplicitOccupation: false
        };
      }

      // Remplir les données globales pour l'affichage (Cutting, Lead Prep, Assembly Projects)
      if (type === 'Cutting area') {
        cuttingArea[monthIndex] += area;
        siteData[siteName].cutting[monthIndex] += area;
      } else if (type === 'Lead prep') {
        leadPrep[monthIndex] += area;
        siteData[siteName].leadPrep[monthIndex] += area;
      } else if (entry.category === 'Assembly') {
        siteData[siteName].assembly[monthIndex] += area;
      }




      // Capturer les lignes explicites (Total Area, Needed, Available, Occupation)
      if (normalizedType === 'TOTAL AREA' || normalizedType === 'TOTAL PLANT AREA') {
        siteData[siteName].totalArea[monthIndex] = area;
        siteData[siteName].hasExplicitTotalArea = true;
      } else if (normalizedType === 'TOTAL AREA NEEDED') {
        siteData[siteName].totalAreaNeeded[monthIndex] = area;
        siteData[siteName].hasExplicitNeeded = true;
      } else if (normalizedType === 'AVAILABLE SPACE' || normalizedType === 'AVAILABLE AREA') {
        siteData[siteName].availableSpace[monthIndex] = area;
        siteData[siteName].hasExplicitAvailable = true;
      } else if (normalizedType === 'OCCUPATION') {
        siteData[siteName].occupation[monthIndex] = area;
        siteData[siteName].hasExplicitOccupation = true;
      }
    });



    // 3. Calculer les totaux globaux en SOMMANT les totaux de chaque site
    const totals = {
      sTotalAssembly: new Array(totalPeriods).fill(0),


      totalAreaNeeded: new Array(totalPeriods).fill(0),
      totalArea: new Array(totalPeriods).fill(0),
      occupation: new Array(totalPeriods).fill(0),
      availableSpace: new Array(totalPeriods).fill(0)
    };







    // Calculer S-Total Assembly (somme des totaux assembly de chaque site)
    Object.values(siteData).forEach(data => {
      for (let i = 0; i < totalPeriods; i++) {
        totals.sTotalAssembly[i] += data.assembly[i];
      }
    });

    // Calculer les 4 lignes de totaux en priorisant les valeurs explicites
    Object.keys(siteData).forEach(siteName => {
      const data = siteData[siteName];

      for (let i = 0; i < totalPeriods; i++) {
        // 1. Total Area
        const siteTotalArea = data.totalArea[i]; // Déjà rempli par explicit ou 0

        // 2. Total Area Needed
        let siteAreaNeeded = 0;
        if (data.hasExplicitNeeded) {
          siteAreaNeeded = data.totalAreaNeeded[i];
        } else {
          // Fallback: Cutting + Lead + Assembly (Note: Manque 'Others' si pas explicite)
          siteAreaNeeded = data.cutting[i] + data.leadPrep[i] + data.assembly[i];
        }

        // 3. Available Space
        let siteAvailable = 0;
        if (data.hasExplicitAvailable) {
          siteAvailable = data.availableSpace[i];
        } else {
          siteAvailable = siteTotalArea - siteAreaNeeded;
        }

        // 4. Occupation
        let siteOccupation = 0;
        if (data.hasExplicitOccupation) {
          siteOccupation = data.occupation[i];
        } else {
          if (siteTotalArea > 0) {
            siteOccupation = (siteAreaNeeded / siteTotalArea) * 100;
          }
        }

        // Ajouter aux totaux GLOBAUX
        totals.totalAreaNeeded[i] += siteAreaNeeded;
        totals.totalArea[i] += siteTotalArea;
        totals.availableSpace[i] += siteAvailable;
        totals.occupation[i] += siteOccupation;
      }
    });

    console.log(`✅ CofatGroup Space - Consolidation terminée:`);

    console.log(`  - Totaux calculés pour ${totalPeriods} périodes`);

    res.json({
      success: true,
      data: {
        months,
        years,
        periods,
        cuttingArea,
        leadPrep,
        totals
      }
    });

  } catch (err) {
    console.error('❌ Erreur CofatGroup Space:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données Space',
      details: err.message
    });
  }
});


// GET /api/cofat-group/hr - Route pour consolidation HR avec lignes détaillées par site
router.get('/hr', compatibleAuthOptional, async (req, res) => {
  try {
    console.log('🔄 CofatGroup HR - Récupération données consolidées...');

    // Récupérer toutes les données HR de tous les sites
    const hrData = await HR.findAll({
      include: [{
        model: Site,
        attributes: ['id', 'code', 'nom'],
      }],
      order: [
        ['category', 'ASC'],
        ['rowOrder', 'ASC'],
        ['year', 'ASC'],
        ['month', 'ASC'],
      ],
    });

    console.log(`📊 CofatGroup HR - ${hrData.length} entrées récupérées`);

    // Détecter dynamiquement les années et périodes disponibles
    const yearsSet = new Set();
    const periodsMap = {};

    hrData.forEach(item => {
      yearsSet.add(item.year);
      if (!periodsMap[item.year]) {
        periodsMap[item.year] = new Set();
      }
      periodsMap[item.year].add(item.month);
    });

    const years = Array.from(yearsSet).sort();
    const periods = {};
    years.forEach(year => {
      periods[year] = Array.from(periodsMap[year]).sort();
    });

    // Générer la liste des mois dans l'ordre
    const months = [];
    years.forEach(year => {
      periods[year].forEach(month => {
        months.push(month);
      });
    });

    console.log(`📅 Années: ${years.join(', ')}, Total périodes: ${months.length}`);

    // Fonction pour obtenir l'index du mois
    const getMonthIndex = (year, month) => {
      let index = 0;
      for (const y of years) {
        if (y === year) {
          const monthIndex = periods[y].indexOf(month);
          return index + monthIndex;
        }
        index += periods[y].length;
      }
      return -1;
    };

    const totalPeriods = months.length;

    // Grouper les données par site ET type (pour garder les lignes séparées par site)
    const rowsBySiteAndType = {};

    hrData.forEach(entry => {
      const siteName = entry.Site.nom;
      const type = entry.type;
      const category = entry.category;
      const key = `${siteName}|||${type}`; // Clé unique par site+type

      if (!rowsBySiteAndType[key]) {
        rowsBySiteAndType[key] = {
          site: siteName,
          type,
          category,
          values: new Array(totalPeriods).fill(0)
        };
      }

      const monthIndex = getMonthIndex(entry.year, entry.month);
      if (monthIndex >= 0 && monthIndex < totalPeriods) {
        rowsBySiteAndType[key].values[monthIndex] += entry.count || 0;
      }
    });

    // Organiser les lignes par catégorie
    const categories = {
      'Direct': [],
      'Assembly Direct': [],
      'Indirect': []
    };

    // Séparer les lignes de calcul (CALCULATION) des autres catégories
    const calculationRows = {};

    // Liste des types de lignes considérés comme des calculs (insensible à la casse)
    const calculationTypes = [
      's-total',
      'total plant',
      's-total production',
      'total production',
      's-total assembly'
    ];

    // DEBUG: Log pour voir ce qu'on a dans les données
    console.log('🔍 DEBUG: Analyse des types de lignes reçues:');
    const debugTypes = new Set();

    Object.values(rowsBySiteAndType).forEach(row => {
      debugTypes.add(`${row.category} - ${row.type}`);

      const normalizedType = row.type.toLowerCase().trim();

      // Vérifier d'abord si c'est une ligne de calcul (basé sur le TYPE, peu importe la catégorie)
      if (calculationTypes.includes(normalizedType)) {
        console.log(`  👉 Found CALCULATION row (by type): "${row.type}" -> normalized: "${normalizedType}" (Site: ${row.site})`);

        if (!calculationRows[normalizedType]) {
          calculationRows[normalizedType] = [];
        }
        calculationRows[normalizedType].push(row);
      }
      // Sinon, vérifier si c'est une catégorie standard (Direct, Indirect)
      else if (categories[row.category]) {
        if (row.category === 'Assembly Direct') {
          // NO-OP: We accumulate later for S-Total but do not display
        } else {
          categories[row.category].push(row);
        }
      }
      // Fallback: Si la catégorie est 'CALCULATION' mais le type n'est pas dans la liste (cas rare)
      else if (row.category === 'CALCULATION') {
        console.log(`  👉 Found CALCULATION row (by category): "${row.type}" -> normalized: "${normalizedType}" (Site: ${row.site})`);
        if (!calculationRows[normalizedType]) {
          calculationRows[normalizedType] = [];
        }
        calculationRows[normalizedType].push(row);
      }
    });

    console.log('📋 Liste des types trouvés dans la DB:', Array.from(debugTypes));
    console.log('🔑 Clés disponibles dans calculationRows:', Object.keys(calculationRows));

    // Trier les lignes Direct et Assembly Direct par site puis par type
    ['Direct'].forEach(cat => {
      categories[cat].sort((a, b) => {
        if (a.site !== b.site) return a.site.localeCompare(b.site);
        return a.type.localeCompare(b.type);
      });
    });

    // Fonction pour normaliser les noms de départements Indirect
    // Règle 2.1: Départements avec des noms similaires doivent être regroupés
    // Exemples: "Production" et "Production (Leader)" → "Production"
    //           "Eng" et "Eng (Agent Method)" → "Eng"
    const normalizeDepartmentName = (name) => {
      // 1. Retirer tout ce qui est entre parenthèses
      let normalized = name.replace(/\s*\([^)]*\)\s*/g, '');
      // 2. Trim et lowercase pour la comparaison
      return normalized.trim().toLowerCase();
    };

    // Fonction pour formater le nom d'affichage (Capitalize)
    const formatDisplayName = (name) => {
      // Si le nom a été normalisé (minuscule), on essaie de le remettre en Title Case
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // Pour Indirect: consolider par nom de catégorie normalisé
    const indirectByType = {};
    Object.values(rowsBySiteAndType).forEach(row => {
      if (row.category === 'Indirect') {
        // Normaliser le nom du département pour le regroupement
        const normalizedName = normalizeDepartmentName(row.type);

        if (!indirectByType[normalizedName]) {
          indirectByType[normalizedName] = {
            type: normalizedName, // Clé normalisée
            category: 'Indirect',
            values: new Array(totalPeriods).fill(0),
            sites: [],
            originalNames: [] // Garder trace des noms originaux
          };
        }
        // Sommer les valeurs pour cette catégorie Indirect normalisée
        for (let i = 0; i < totalPeriods; i++) {
          indirectByType[normalizedName].values[i] += row.values[i];
        }
        if (!indirectByType[normalizedName].sites.includes(row.site)) {
          indirectByType[normalizedName].sites.push(row.site);
        }
        if (!indirectByType[normalizedName].originalNames.includes(row.type)) {
          indirectByType[normalizedName].originalNames.push(row.type);
        }
      }
    });

    // Convertir indirectByType en tableau et trier par nom
    categories['Indirect'] = Object.values(indirectByType).map(dept => {
      let displayName = formatDisplayName(dept.type); // Nom par défaut

      // Si on a des noms originaux, on essaie de trouver le meilleur nom d'affichage
      if (dept.originalNames.length > 0) {
        // Chercher le nom le plus court (souvent le nom de base sans parenthèses)
        const shortestName = dept.originalNames.reduce((a, b) => a.length <= b.length ? a : b);

        // Si c'est un département unique (1 seul nom original), on garde ce nom exact
        if (dept.originalNames.length === 1) {
          displayName = dept.originalNames[0];
        } else {
          // Sinon (regroupement), on utilise le nom le plus court comme base (ex: "Production" vs "Production (Leader)")
          displayName = shortestName;
        }
      }

      return { ...dept, type: displayName };
    }).sort((a, b) => a.type.localeCompare(b.type));

    // --- CALCUL DES TOTAUX ---
    // On priorise les lignes de calcul ("CALCULATION") si elles existent en base
    // pour garantir la correspondance avec les exports Excel originaux.

    const totals = {
      direct: new Array(totalPeriods).fill(0),
      sTotalAssembly: new Array(totalPeriods).fill(0),
      totalProduction: new Array(totalPeriods).fill(0),
      indirect: new Array(totalPeriods).fill(0),
      sTotal: new Array(totalPeriods).fill(0),
      totalPlant: new Array(totalPeriods).fill(0)
    };

    // 1. T-Direct : Toujours calculé à partir des lignes Direct Individuelles car consolidées
    categories['Direct'].forEach(row => {
      for (let i = 0; i < totalPeriods; i++) {
        totals.direct[i] += row.values[i] || 0;
      }
    });

    // 2. S-Total Assembly : Pris en base si dispo, sinon somme des projets Assembly Direct
    if (calculationRows['s-total assembly']) {
      calculationRows['s-total assembly'].forEach(row => {
        for (let i = 0; i < totalPeriods; i++) {
          totals.sTotalAssembly[i] += row.values[i] || 0;
        }
      });
    } else {
      Object.values(rowsBySiteAndType).forEach(row => {
        if (row.category === 'Assembly Direct') {
          for (let i = 0; i < totalPeriods; i++) {
            totals.sTotalAssembly[i] += row.values[i] || 0;
          }
        }
      });
    }

    // 3. T-Indirect : Somme de toutes les catégories Indirect consolidées
    categories['Indirect'].forEach(row => {
      for (let i = 0; i < totalPeriods; i++) {
        totals.indirect[i] += row.values[i] || 0;
      }
    });

    // 4. Total Production (ou S-Total Production)
    if (calculationRows['total production'] || calculationRows['s-total production']) {
      const prodRows = (calculationRows['total production'] || []).concat(calculationRows['s-total production'] || []);
      prodRows.forEach(row => {
        for (let i = 0; i < totalPeriods; i++) {
          totals.totalProduction[i] += row.values[i] || 0;
        }
      });
    } else {
      // Fallback: Direct + Assembly
      for (let i = 0; i < totalPeriods; i++) {
        totals.totalProduction[i] = totals.direct[i] + totals.sTotalAssembly[i];
      }
    }

    // 5. S-Total (Dans cette version, correspond au total des Indirects comme vu sur le screenshot)
    if (calculationRows['s-total']) {
      calculationRows['s-total'].forEach(row => {
        for (let i = 0; i < totalPeriods; i++) {
          totals.sTotal[i] += row.values[i] || 0;
        }
      });
    } else {
      // Fallback: Dans le screenshot du client, S-Total = T-Indirect
      for (let i = 0; i < totalPeriods; i++) {
        totals.sTotal[i] = totals.indirect[i];
      }
    }

    // 6. Total Plant (Le vrai total global)
    if (calculationRows['total plant']) {
      calculationRows['total plant'].forEach(row => {
        for (let i = 0; i < totalPeriods; i++) {
          totals.totalPlant[i] += row.values[i] || 0;
        }
      });
    } else {
      // Fallback: Somme de tout
      for (let i = 0; i < totalPeriods; i++) {
        totals.totalPlant[i] = totals.direct[i] + totals.sTotalAssembly[i] + totals.indirect[i];
      }
    }

    // --- CONSOLIDATION DIRECT (FINAL STEP) ---
    // Règle 1: Consolider les lignes Direct (Cutting area, Lead prep) de tous les sites
    // On le fait à la fin pour ne pas casser les calculs par site ci-dessus
    const directConsolidated = {};
    categories['Direct'].forEach(row => {
      const type = row.type;
      if (!directConsolidated[type]) {
        directConsolidated[type] = {
          type: type,
          category: 'Direct',
          values: new Array(totalPeriods).fill(0),
          sites: []
        };
      }
      for (let i = 0; i < totalPeriods; i++) {
        directConsolidated[type].values[i] += row.values[i];
      }
      if (!directConsolidated[type].sites.includes(row.site)) {
        directConsolidated[type].sites.push(row.site);
      }
    });

    // Remplacer la liste Direct par la liste consolidée pour l'affichage
    categories['Direct'] = Object.values(directConsolidated).sort((a, b) => a.type.localeCompare(b.type));

    console.log(`✅ CofatGroup HR - Consolidation terminée:`);
    console.log(`  - Direct: ${categories['Direct'].length} lignes`);

    console.log(`  - Indirect: ${categories['Indirect'].length} catégories consolidées`);

    // Afficher les détails de consolidation Indirect
    console.log(`📋 Détails consolidation Indirect:`);
    categories['Indirect'].forEach(dept => {
      if (dept.originalNames && dept.originalNames.length > 1) {
        console.log(`  ✓ "${dept.type}" consolidé depuis: ${dept.originalNames.join(', ')}`);
      } else {
        console.log(`  • "${dept.type}" (département unique)`);
      }
    });

    console.log(`📊 Totaux consolidés (premier mois):`);
    console.log(`  - Direct: ${totals.direct[0]}`);

    console.log(`  - Total Production: ${totals.totalProduction[0]}`);
    console.log(`  - Indirect: ${totals.indirect[0]}`);
    console.log(`  - S-Total: ${totals.sTotal[0]}`);
    console.log(`  - Total Plant: ${totals.totalPlant[0]}`);

    res.json({
      success: true,
      data: {
        months,
        years,
        periods,
        categories,
        totals
      }
    });

  } catch (err) {
    console.error('❌ Erreur CofatGroup HR:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données HR',
      details: err.message
    });
  }
});



// Fonction utilitaire pour calculer l'index de période
function getPeriodIndex(year, month) {
  if (year === 2025) {
    // Pour 2025: MO 01 à MO 12 = index 0-11
    const monthNum = typeof month === 'string' ? parseInt(month.replace('MO ', '')) : month;
    return monthNum - 1;
  } else if (year === 2026) {
    // Pour 2026: Q 01 à Q 04 = index 12-15
    const quarterNum = typeof month === 'string' ? parseInt(month.replace('Q ', '')) : month;
    return 12 + quarterNum - 1;
  } else if (year === 2027) {
    // Pour 2027: Q 01 à Q 04 = index 16-19
    const quarterNum = typeof month === 'string' ? parseInt(month.replace('Q ', '')) : month;
    return 16 + quarterNum - 1;
  }
  return -1;
}

module.exports = router;
}

module.exports = router;
