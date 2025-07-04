const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Endpoints de gestão de tickets
 */

/**
 * @swagger
 * /tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: Lista tickets
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, open, closed]
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
 *         description: Lista de tickets
 */
router.get('/', ticketController.listTickets);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Detalhes do ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket + mensagens
 */
router.get('/:id', ticketController.getTicketById);

/**
 * @swagger
 * /tickets/{id}/status:
 *   put:
 *     tags: [Tickets]
 *     summary: Alterar status do ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, open, closed]
 *     responses:
 *       200:
 *         description: Ticket atualizado
 */
router.put('/:id/status', ticketController.updateTicketStatus);

module.exports = router; 