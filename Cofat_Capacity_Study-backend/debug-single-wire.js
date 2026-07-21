
const { Site, Equipment, EquipmentPlanning } = require('./models');
const { Op } = require('sequelize');

async function debugSingleWireCC() {
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

        console.log(`✅ Found Equipment: ${equipment.nom} (ID: ${equipment.id}, EqID: ${equipment.equipmentId})`);

        const planningData = await EquipmentPlanning.findAll({
            where: {
                equipmentId: equipment.id,
                year: 2027
            },
            include: [{ model: Site, attributes: ['nom', 'code'] }],
            order: [['month', 'ASC'], [Site, 'nom', 'ASC']]
        });

        console.log(`📊 Found ${planningData.length} entries for 2027.`);

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

        Object.keys(groupedByMonth).sort().forEach(month => {
            console.log(`\n📅 Month: ${month}`);
            let totalNeed = 0;
            let totalAvail = 0;
            groupedByMonth[month].forEach(d => {
                console.log(`   - Site: ${d.site} | Need: ${d.need} | Avail: ${d.available} | Load (DB): ${d.load}`);
                totalNeed += d.need || 0;
                totalAvail += d.available || 0;
            });
            const calcLoad = totalAvail > 0 ? (totalNeed / totalAvail) * 100 : 0;
            console.log(`   👉 TOTAL: Need=${totalNeed.toFixed(2)} | Avail=${totalAvail} | Calc Load=${calcLoad.toFixed(2)}%`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

debugSingleWireCC();
