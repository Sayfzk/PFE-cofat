
const { Site, Equipment, EquipmentPlanning } = require('./models');
const { Op } = require('sequelize');

async function debugSingleWireCC2025() {
    try {
        console.log('🔍 Searching for "Single Wire CC"...');

        const equipment = await Equipment.findOne({
            where: {
                nom: { [Op.like]: '%Single Wire CC%' }
            }
        });

        if (!equipment) {
            console.log('❌ Equipment "Single Wire CC" not found.');
            return;
        }

        console.log(`✅ Found Equipment: ${equipment.nom} (ID: ${equipment.id})`);

        const planningData = await EquipmentPlanning.findAll({
            where: {
                equipmentId: equipment.id,
                year: 2025
            },
            include: [{ model: Site, attributes: ['nom', 'code'] }],
            order: [['month', 'ASC'], [Site, 'nom', 'ASC']]
        });

        console.log(`📊 Found ${planningData.length} entries for 2025.`);

        const groupedByMonth = {};

        planningData.forEach(entry => {
            const month = entry.month;
            if (!groupedByMonth[month]) {
                groupedByMonth[month] = [];
            }
            groupedByMonth[month].push({
                site: entry.Site.nom,
                need: entry.machineNeed,
                available: entry.availableMachine,
                load: entry.load
            });
        });

        // Show first 3 months
        const months = Object.keys(groupedByMonth).sort().slice(0, 3);

        months.forEach(month => {
            console.log(`\n📅 Month: ${month}`);
            let totalLoad = 0;
            groupedByMonth[month].forEach(d => {
                console.log(`   - Site: ${d.site} | Need: ${d.need} | Avail: ${d.available} | Load (DB): ${d.load}`);
                totalLoad += d.load || 0;
            });
            console.log(`   👉 SUM Load: ${totalLoad}`);
            console.log(`   👉 SUM Load * 100: ${totalLoad * 100}`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

debugSingleWireCC2025();
