const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints para o dashboard admin
 */

/**
 * @swagger
 * /dashboard-api/metrics:
 *   get:
 *     tags: [Dashboard]
 *     summary: Retorna métricas consolidadas para o dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas retornadas com sucesso
 */

router.get('/metrics', dashboardController.getMetrics);

module.exports = router; 