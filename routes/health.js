const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { version } = require('../package.json');

/**
 * @swagger
 * /health:
 *   get:
 *     tags: ["Health"]
 *     summary: Verifica a saúde da aplicação e suas dependências.
 *     description: Retorna o status da aplicação, incluindo a conexão com o banco de dados.
 *     responses:
 *       200:
 *         description: A aplicação está saudável.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 version:
 *                   type: string
 *                   example: "1.6.0"
 *                 uptime:
 *                   type: number
 *                 database:
 *                   type: string
 *                   example: "connected"
 *       503:
 *         description: A aplicação não está saudável.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 database:
 *                   type: string
 *                   example: "disconnected"
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  const healthStatus = {
    status: isDbConnected ? 'ok' : 'error',
    version,
    uptime: process.uptime(),
    database: mongoose.STATES[dbState],
  };

  if (isDbConnected) {
    res.status(200).json(healthStatus);
  } else {
    res.status(503).json(healthStatus);
  }
});

module.exports = router;