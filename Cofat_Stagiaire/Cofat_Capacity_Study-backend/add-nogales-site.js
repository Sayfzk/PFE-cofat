/**
 * Script to add the Nogales site to the Sites table.
 * Run once with: node add-nogales-site.js
 */
const { Sequelize } = require('sequelize');
const sequelize = require('./db');
const { Site } = require('./models');

async function addNogalesSite() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Check if Nogales already exists
    const existing = await Site.findOne({
      where: { nom: 'Nogales' }
    });

    if (existing) {
      console.log('ℹ️  Site "Nogales" already exists in the database:', existing.toJSON());
      return;
    }

    // Insert Nogales
    const nogales = await Site.create({
      nom: 'Nogales',
      code: 'NOG',
      description: 'Site Nogales - Mexique',
      pays: 'Mexique',
      actif: true
    });

    console.log('✅ Site "Nogales" created successfully:');
    console.log(JSON.stringify(nogales.toJSON(), null, 2));

  } catch (error) {
    console.error('❌ Error creating Nogales site:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

addNogalesSite();
