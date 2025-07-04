const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

/**
 * @swagger
 * /contacts:
 *   get:
 *     tags:
 *       - Contatos
 *     summary: Lista contatos
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto para busca (nome, número ou email)
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true,false,all]
 *         description: Filtrar por ativo/inativo
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
 *         description: Lista de contatos
 */
router.get('/', contactController.listContacts);

module.exports = router; 