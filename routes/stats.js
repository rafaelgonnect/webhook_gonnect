const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

/**
 * @swagger
 * tags:
 *   name: Estatísticas
 *   description: Métricas gerais do sistema
 */

/**
 * @swagger
 * /stats:
 *   get:
 *     tags: [Estatísticas]
 *     summary: Retorna métricas de tickets, mensagens e atendimento
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
router.get('/', statsController.getStats);

module.exports = router; 