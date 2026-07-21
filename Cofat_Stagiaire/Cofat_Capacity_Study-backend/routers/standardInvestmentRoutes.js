const express = require('express');
const router = express.Router();
const StandardInvestment = require('../models/StandardInvestment');
const { Op } = require('sequelize');

// POST create a single standard investment
router.post('/', async (req, res) => {
    try {
        const investmentData = req.body;

        // Validate required fields
        const requiredFields = ['code_eq', 'operation', 'equipment_reference', 'supplier_technology', 'equipment_type', 'calculation_method'];
        const missingFields = requiredFields.filter(field => !investmentData[field] || String(investmentData[field]).trim() === '');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                missingFields
            });
        }

        const newInvestment = await StandardInvestment.create(investmentData);

        res.status(201).json({
            success: true,
            message: 'Standard investment created successfully',
            data: newInvestment
        });
    } catch (error) {
        console.error('Error creating standard investment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create standard investment',
            details: error.message
        });
    }
});

// GET all standard investments with optional filters
router.get('/', async (req, res) => {
    try {
        const { operationCodes, search } = req.query;

        let whereClause = {};

        // Filter by operation codes if provided
        if (operationCodes) {
            const codes = operationCodes.split(',').map(code => code.trim());
            // Use LIKE to match codes that start with the operation code (e.g., "1" matches "1.1", "1.2", etc.)
            const codeConditions = codes.map(code => ({
                code_eq: { [Op.like]: `${code}.%` }
            }));

            if (codeConditions.length === 1) {
                whereClause.code_eq = codeConditions[0].code_eq;
            } else {
                whereClause[Op.or] = codeConditions;
            }
        }

        // Search across multiple fields if search term provided
        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`;
            const searchConditions = [
                { code_eq: { [Op.like]: searchTerm } },
                { operation: { [Op.like]: searchTerm } },
                { operation_code: { [Op.like]: searchTerm } },
                { equipment_reference: { [Op.like]: searchTerm } },
                { supplier_technology: { [Op.like]: searchTerm } },
                { equipment_type: { [Op.like]: searchTerm } }
            ];

            // If we already have operation code filter, combine with AND
            if (operationCodes) {
                whereClause = {
                    [Op.and]: [
                        whereClause,
                        { [Op.or]: searchConditions }
                    ]
                };
            } else {
                whereClause[Op.or] = searchConditions;
            }
        }

        const investments = await StandardInvestment.findAll({
            where: whereClause,
            order: [['code_eq', 'ASC'], ['id', 'ASC']]
        });

        res.json(investments);
    } catch (error) {
        console.error('Error fetching standard investments:', error);
        res.status(500).json({ error: 'Failed to fetch standard investments' });
    }
});

// POST batch save/update standard investments
router.post('/save', async (req, res) => {
    try {
        const investmentsData = req.body;

        if (!Array.isArray(investmentsData)) {
            return res.status(400).json({ error: 'Request body must be an array' });
        }

        const results = [];

        for (const data of investmentsData) {
            if (data.id) {
                // Update existing
                await StandardInvestment.update(data, {
                    where: { id: data.id }
                });
                results.push({ id: data.id, action: 'updated' });
            } else {
                // Create new
                const newInvestment = await StandardInvestment.create(data);
                results.push({ id: newInvestment.id, action: 'created' });
            }
        }

        res.json({
            success: true,
            message: `Successfully processed ${results.length} investments`,
            results
        });
    } catch (error) {
        console.error('Error saving standard investments:', error);
        res.status(500).json({ error: 'Failed to save standard investments' });
    }
});

// DELETE multiple standard investments by IDs
router.delete('/', async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'IDs array is required' });
        }

        const deletedCount = await StandardInvestment.destroy({
            where: {
                id: { [Op.in]: ids }
            }
        });

        res.json({
            success: true,
            message: `Successfully deleted ${deletedCount} investments`,
            deletedCount
        });
    } catch (error) {
        console.error('Error deleting standard investments:', error);
        res.status(500).json({ error: 'Failed to delete standard investments' });
    }
});

module.exports = router;
