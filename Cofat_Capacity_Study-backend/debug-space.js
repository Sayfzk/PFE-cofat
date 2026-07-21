const { Site, Spaces } = require('./models');
const sequelize = require('./db');
const fs = require('fs');
const path = require('path');

function log(message) {
    console.log(message);
    fs.appendFileSync(path.join(__dirname, 'debug_result.log'), message + '\n');
}

// Clear log file
fs.writeFileSync(path.join(__dirname, 'debug_result.log'), '');

async function debugSpaceConsolidation() {
    try {
        log('🔄 Debugging Space Consolidation...');

        // Récupérer toutes les données Space
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

        log(`📊 ${spaceData.length} entrées récupérées`);

        // Structure pour accumuler les données PAR SITE
        const siteData = {};

        spaceData.forEach(entry => {
            // Focus on 2025 MO 01 (Index 0)
            if (entry.year !== 2025 || entry.month !== 'MO 01') return;

            const siteName = entry.Site.nom;
            const type = entry.type;
            const area = entry.area || 0;

            if (!siteData[siteName]) {
                siteData[siteName] = {
                    cutting: 0,
                    leadPrep: 0,
                    assembly: 0,
                    totalArea: 0,
                    explicitAvailable: null
                };
            }

            // Check for variations of Total Area
            const normalizedType = type.toUpperCase().trim();
            if (normalizedType === 'TOTAL AREA' || normalizedType === 'TOTAL PLANT AREA') {
                siteData[siteName].totalArea = area;
            } else if (normalizedType === 'AVAILABLE SPACE' || normalizedType === 'AVAILABLE AREA') {
                // Capture explicit available space for debug
                siteData[siteName].explicitAvailable = area;
            } else if (type === 'Cutting area') {
                siteData[siteName].cutting += area;
            } else if (type === 'Lead prep') {
                siteData[siteName].leadPrep += area;
            } else if (entry.category === 'Assembly') {
                siteData[siteName].assembly += area;
            }
        });

        log('\n📋 Détails par site (2025 MO 01):');
        let globalNeeded = 0;
        let globalTotalArea = 0;
        let globalOccupation = 0;
        let globalAvailable = 0;

        Object.keys(siteData).forEach(siteName => {
            const data = siteData[siteName];
            const needed = data.cutting + data.leadPrep + data.assembly;
            const totalArea = data.totalArea;

            let available = 0;
            if (data.explicitAvailable !== null) {
                available = data.explicitAvailable;
            } else {
                available = totalArea - needed;
            }

            let occupation = 0;
            if (totalArea > 0) {
                occupation = (needed / totalArea) * 100;
            }

            log(`  Site: ${siteName}`);
            log(`    - Needed: ${needed} (Cut: ${data.cutting}, Lead: ${data.leadPrep}, Ass: ${data.assembly})`);
            log(`    - Total Area: ${totalArea}`);
            log(`    - Occupation: ${occupation.toFixed(2)}%`);
            log(`    - Available: ${available} ${data.explicitAvailable !== null ? '(Explicit)' : '(Calculated)'}`);

            globalNeeded += needed;
            globalTotalArea += totalArea;
            globalOccupation += occupation;
            globalAvailable += available;
        });

        log('\n∑ TOTAUX GLOBAUX (2025 MO 01):');
        log(`  - Total Needed: ${globalNeeded}`);
        log(`  - Total Area: ${globalTotalArea}`);
        log(`  - Total Occupation: ${globalOccupation.toFixed(2)}%`);
        log(`  - Total Available: ${globalAvailable}`);

    } catch (err) {
        log('❌ Erreur: ' + err.message);
    } finally {
        // sequelize.close(); // Keep open if needed or close
    }
}

debugSpaceConsolidation();
