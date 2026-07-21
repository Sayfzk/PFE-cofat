const express = require('express');
const router = express.Router();
const { HR, Space, Site } = require('../models');
const { compatibleAuthOptional } = require('../middleware/auth');

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
            // 'Assembly Direct': [], // Removed per user request
            'Indirect': []
        };

        // Séparer les lignes de calcul (CALCULATION) des autres catégories
        const calculationRows = {};

        Object.values(rowsBySiteAndType).forEach(row => {
            if (categories[row.category]) {
                categories[row.category].push(row);
            } else if (row.category === 'Assembly Direct') {
                // Skip Assembly Direct validation/collection
                // Do nothing
            } else if (row.category === 'CALCULATION') {
                // Stocker les lignes de calcul par type (S-Total production, S-Total, Total Plant)
                // Utiliser une clé normalisée pour éviter les problèmes de casse/espaces
                const normalizedType = row.type.toLowerCase().trim();

                if (!calculationRows[normalizedType]) {
                    calculationRows[normalizedType] = [];
                }
                calculationRows[normalizedType].push(row);
            }
        });

        // Trier les lignes Direct par site puis par type
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
                    // Ou on utilise le nom normalisé formaté si le plus court contient encore des parenthèses (peu probable avec notre logique)
                    displayName = shortestName;
                }
            }

            return { ...dept, type: displayName };
        }).sort((a, b) => a.type.localeCompare(b.type));

        // Calculer les totaux consolidés
        const totals = {
            direct: new Array(totalPeriods).fill(0),
            // sTotalAssembly: new Array(totalPeriods).fill(0), // Removed
            totalProduction: new Array(totalPeriods).fill(0),
            indirect: new Array(totalPeriods).fill(0),
            sTotal: new Array(totalPeriods).fill(0),
            totalPlant: new Array(totalPeriods).fill(0)
        };

        // Calculer Direct (somme de toutes les lignes Direct)
        categories['Direct'].forEach(row => {
            for (let i = 0; i < totalPeriods; i++) {
                totals.direct[i] += row.values[i];
            }
        });

        // Calculer S-Total Assembly (REMOVED)
        // if (calculationRows['s-total production']) ... (Removed)

        // Calculer Total Production
        // Règle 2.2: Sommer Total Production de chaque site
        if (calculationRows['total production']) {
            calculationRows['total production'].forEach(row => {
                for (let i = 0; i < totalPeriods; i++) {
                    totals.totalProduction[i] += row.values[i];
                }
            });
        } else {
            // Sinon, calculer: Direct only (as Assembly is removed)
            for (let i = 0; i < totalPeriods; i++) {
                totals.totalProduction[i] = totals.direct[i]; // Changed logic
            }
        }

        // Calculer Indirect (somme de toutes les catégories Indirect consolidées)
        categories['Indirect'].forEach(row => {
            for (let i = 0; i < totalPeriods; i++) {
                totals.indirect[i] += row.values[i];
            }
        });

        // Calculer S-Total
        if (calculationRows['s-total']) {
            console.log(`Found ${calculationRows['s-total'].length} S-Total rows to sum`);
            calculationRows['s-total'].forEach(row => {
                for (let i = 0; i < totalPeriods; i++) {
                    totals.sTotal[i] += row.values[i];
                }
            });
        } else {
            console.log('No S-Total rows found, calculating from parts');
            // Sinon, calculer: Total Production + Indirect
            for (let i = 0; i < totalPeriods; i++) {
                totals.sTotal[i] = totals.totalProduction[i] + totals.indirect[i];
            }
        }

        // Calculer Total Plant
        if (calculationRows['total plant']) {
            console.log(`Found ${calculationRows['total plant'].length} Total Plant rows to sum`);
            calculationRows['total plant'].forEach(row => {
                for (let i = 0; i < totalPeriods; i++) {
                    totals.totalPlant[i] += row.values[i];
                }
            });
        } else {
            console.log('No Total Plant rows found, using S-Total');
            // Sinon, Total Plant = S-Total
            for (let i = 0; i < totalPeriods; i++) {
                totals.totalPlant[i] = totals.sTotal[i];
            }
        }

        console.log(`✅ CofatGroup HR - Consolidation terminée`);
        console.log(`  - Direct: ${categories['Direct'].length} lignes`);
        console.log(`  - Indirect: ${categories['Indirect'].length} catégories consolidées`);

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

module.exports = router;
