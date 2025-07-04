const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

/**
 * @swagger
 * tags:
 *   name: Mensagens
 *   description: Endpoints de listagem de mensagens
 */

/**
 * @swagger
 * /messages:
 *   get:
 *     tags: [Mensagens]
 *     summary: Lista mensagens
 *     parameters:
 *       - in: query
 *         name: ticketId
 *         schema:
 *           type: integer
 *         description: Filtrar pelo ID do ticket (Whaticket)
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *         description: Número do contato (formato E.164)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data/hora inicial (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data/hora final (ISO 8601)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de mensagens
 */
router.get('/', messageController.listMessages);

module.exports = router; 