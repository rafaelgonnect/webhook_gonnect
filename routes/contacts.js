const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

/**
 * @swagger
 * tags:
 *   name: Contatos
 *   description: Endpoints de gestão de contatos
 */

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

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     tags: [Contatos]
 *     summary: Obter detalhes de um contato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB do contato
 *     responses:
 *       200:
 *         description: Dados do contato
 *       404:
 *         description: Contato não encontrado
 */
router.get('/:id', contactController.getContactById);

/**
 * @swagger
 * /contacts:
 *   post:
 *     tags: [Contatos]
 *     summary: Criar ou atualizar contato manualmente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [whaticketId, name, number]
 *             properties:
 *               whaticketId:
 *                 type: integer
 *               name:
 *                 type: string
 *               number:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contato criado/atualizado
 */
router.post('/', contactController.createOrUpdateContact);

/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     tags: [Contatos]
 *     summary: Atualizar informações do contato
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
 *     responses:
 *       200:
 *         description: Contato atualizado
 */
router.put('/:id', contactController.updateContact);

module.exports = router; 