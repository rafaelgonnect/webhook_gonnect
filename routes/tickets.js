const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const tagsController = require('../controllers/tagsController');

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

/**
 * @swagger
 * /tickets/{id}/message:
 *   post:
 *     tags: [Tickets]
 *     summary: Enviar mensagem manual no ticket
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensagem criada
 */
router.post('/:id/message', ticketController.createManualMessage);

/**
 * @swagger
 * /tickets/{id}/media:
 *   post:
 *     tags: [Tickets]
 *     summary: Enviar mídia manual no ticket
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
 *             required: [media]
 *             properties:
 *               media:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mídia criada
 */
router.post('/:id/media', ticketController.createManualMedia);

/**
 * @swagger
 * /tickets/{id}/tags:
 *   post:
 *     tags: [Tickets]
 *     summary: Gerenciar tags do ticket
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
 *             required: [tags]
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tags gerenciadas com sucesso
 */
router.post('/:id/tags', tagsController.manageTicketTags);

module.exports = router; 