const express = require('express');
const router = express.Router();
const webhookProcessor = require('../services/webhookProcessor');

/**
 * Middleware para validação básica do payload
 */
const validatePayload = (req, res, next) => {
  const payload = req.body;
  
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Payload inválido',
      message: 'Corpo da requisição deve ser um objeto JSON válido'
    });
  }
  
  // Verificações básicas de estrutura
  if (!payload.sender && !payload.contact && !payload.action) {
    return res.status(400).json({
      success: false,
      error: 'Payload incompleto',
      message: 'Payload deve conter pelo menos sender, contact ou action'
    });
  }
  
  next();
};

/**
 * Middleware para logging de requests
 */
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`📥 [${timestamp}] Webhook recebido de ${ip} - User-Agent: ${userAgent}`);
  console.log(`📝 Payload keys: ${Object.keys(req.body).join(', ')}`);
  
  next();
};

/**
 * @swagger
 * /webhook:
 *   post:
 *     tags:
 *       - Webhook
 *     summary: Endpoint principal do webhook
 *     description: Recebe e processa payloads do Whaticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookPayload'
 *           examples:
 *             mensagem:
 *               summary: Exemplo de mensagem
 *               value:
 *                 sender: "5511989091838"
 *                 mensagem: "Olá, preciso de ajuda"
 *                 acao: "start"
 *                 companyid: 1
 *                 ticketdata:
 *                   id: 357
 *                   status: "pending"
 *                   contact:
 *                     id: 4192
 *                     name: "João Silva"
 *                     number: "5511989091838"
 *             tag_sync:
 *               summary: Exemplo de sincronização de tags
 *               value:
 *                 action: "tag sync"
 *                 tags:
 *                   ticketid: 383
 *                   tags:
 *                     - id: 27
 *                       name: "lead qualificado"
 *                       color: "#00c75a"
 *                 contact:
 *                   id: 4300
 *                   name: "Maria Santos"
 *                   number: "5511987654321"
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook processado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     action:
 *                       type: string
 *                       example: "start"
 *                     processed:
 *                       type: string
 *                       example: "message"
 *                     logFile:
 *                       type: string
 *                       example: "2024-01-15_start_103045-123.json"
 *                     processingTime:
 *                       type: string
 *                       example: "150ms"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Payload inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', logRequest, validatePayload, async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Processar o webhook
    const result = await webhookProcessor.processWebhook(req.body);
    
    const processingTime = Date.now() - startTime;
    
    // Resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      data: {
        action: result.action,
        processed: result.result.processed,
        logFile: result.logFile,
        processingTime: `${processingTime}ms`
      },
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Webhook processado em ${processingTime}ms - Ação: ${result.action}`);
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha ao processar webhook',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /webhook/test:
 *   get:
 *     tags:
 *       - Webhook
 *     summary: Teste do endpoint webhook
 *     description: Verifica se o endpoint webhook está funcionando corretamente
 *     responses:
 *       200:
 *         description: Webhook funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook endpoint funcionando"
 *                 service:
 *                   type: string
 *                   example: "Gonnect CRM Webhook"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 supportedActions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["start", "message", "tag_sync", "status_change", "file"]
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     webhook:
 *                       type: string
 *                       example: "POST /webhook"
 *                     test:
 *                       type: string
 *                       example: "GET /webhook/test"
 *                     health:
 *                       type: string
 *                       example: "GET /webhook/health"
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint funcionando',
    service: 'Gonnect CRM Webhook',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supportedActions: [
      'start',
      'message', 
      'tag_sync',
      'status_change',
      'file'
    ],
    endpoints: {
      webhook: 'POST /webhook',
      test: 'GET /webhook/test',
      health: 'GET /webhook/health'
    }
  });
});

/**
 * @swagger
 * /webhook/health:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Health check detalhado do webhook
 *     description: Verifica a saúde do sistema webhook e suas dependências
 *     responses:
 *       200:
 *         description: Sistema saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 memory:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: number
 *                     heapTotal:
 *                       type: number
 *                     heapUsed:
 *                       type: number
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "connected"
 *                     host:
 *                       type: string
 *                       example: "configured"
 *                 logging:
 *                   type: object
 *                   properties:
 *                     directory:
 *                       type: string
 *                       example: "exists"
 *                     path:
 *                       type: string
 *                       example: "./Logs"
 *       500:
 *         description: Sistema com problemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Verificar conexão com MongoDB
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Verificar se os diretórios de log existem
    const fs = require('fs-extra');
    const logDirectoryExists = await fs.pathExists('./Logs');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: dbStatus,
        host: process.env.MONGODB_URI ? 'configured' : 'not configured'
      },
      logging: {
        directory: logDirectoryExists ? 'exists' : 'missing',
        path: './Logs'
      },
      version: '1.0.0'
    };
    
    res.status(200).json(health);
    
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /webhook/stats:
 *   get:
 *     tags:
 *       - Estatísticas
 *     summary: Estatísticas do sistema
 *     description: Retorna métricas e estatísticas de uso do webhook
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totals:
 *                   type: object
 *                   properties:
 *                     contacts:
 *                       type: number
 *                       example: 1523
 *                     tickets:
 *                       type: number
 *                       example: 2847
 *                     messages:
 *                       type: number
 *                       example: 15632
 *                 last7Days:
 *                   type: object
 *                   properties:
 *                     contacts:
 *                       type: number
 *                       example: 89
 *                     tickets:
 *                       type: number
 *                       example: 156
 *                     messages:
 *                       type: number
 *                       example: 892
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       example: "2024-01-15"
 *                     totalEvents:
 *                       type: number
 *                       example: 45
 *                     eventTypes:
 *                       type: object
 *                       example:
 *                         message: 32
 *                         start: 8
 *                         tag_sync: 3
 *                         file: 2
 *                     hourlyDistribution:
 *                       type: object
 *                       example:
 *                         "09": 8
 *                         "10": 12
 *                         "11": 15
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Erro ao buscar estatísticas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', async (req, res) => {
  try {
    const { logger } = require('../utils/logger');
    const Contact = require('../models/Contact');
    const Ticket = require('../models/Ticket');
    const Message = require('../models/Message');
    
    // Buscar estatísticas básicas
    const [contactCount, ticketCount, messageCount] = await Promise.all([
      Contact.countDocuments(),
      Ticket.countDocuments(),
      Message.countDocuments()
    ]);
    
    // Estatísticas dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [recentContacts, recentTickets, recentMessages] = await Promise.all([
      Contact.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Ticket.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Message.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);
    
    // Tentar gerar relatório de análise dos logs
    let analysisReport = null;
    try {
      analysisReport = await logger.generateAnalysisReport();
    } catch (error) {
      console.log('Não foi possível gerar relatório de análise:', error.message);
    }
    
    const stats = {
      totals: {
        contacts: contactCount,
        tickets: ticketCount,
        messages: messageCount
      },
      last7Days: {
        contacts: recentContacts,
        tickets: recentTickets,
        messages: recentMessages
      },
      analysis: analysisReport,
      timestamp: new Date().toISOString()
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
      message: error.message
    });
  }
});

/**
 * Middleware para capturar rotas não encontradas no webhook
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    message: `Rota ${req.method} ${req.originalUrl} não existe`,
    availableEndpoints: [
      'POST /webhook',
      'GET /webhook/test',
      'GET /webhook/health',
      'GET /webhook/stats'
    ]
  });
});

module.exports = router; 