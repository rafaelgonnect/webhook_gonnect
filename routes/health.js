const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check básico (otimizado para EasyPanel)
 *     description: Endpoint simples para verificação de status da aplicação
 *     responses:
 *       200:
 *         description: Aplicação saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 12345.678
 *       503:
 *         description: Aplicação com problemas
 */
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3003
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness check (EasyPanel)
 *     description: Verifica se a aplicação está pronta para receber tráfego
 *     responses:
 *       200:
 *         description: Aplicação pronta
 *       503:
 *         description: Aplicação não está pronta
 */
router.get('/ready', async (req, res) => {
  try {
    // Verificar conexão com banco
    const dbStatus = mongoose.connection.readyState;
    
    if (dbStatus !== 1) {
      return res.status(503).json({
        status: 'not_ready',
        reason: 'database_not_connected',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus === 1 ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness check (EasyPanel)
 *     description: Verifica se a aplicação está viva (para restart automático)
 *     responses:
 *       200:
 *         description: Aplicação viva
 *       503:
 *         description: Aplicação com problemas graves
 */
router.get('/live', (req, res) => {
  try {
    // Verificações básicas de liveness
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    // Se usar mais de 1GB de RAM, pode indicar vazamento de memória
    if (heapUsedMB > 1024) {
      return res.status(503).json({
        status: 'unhealthy',
        reason: 'high_memory_usage',
        memory_mb: heapUsedMB,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory_mb: heapUsedMB
    });
  } catch (error) {
    res.status(503).json({
      status: 'dead',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     tags: [Health]
 *     summary: Health check detalhado
 *     description: Informações completas sobre o status da aplicação
 *     responses:
 *       200:
 *         description: Status detalhado da aplicação
 */
router.get('/detailed', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const dbStatus = mongoose.connection.readyState;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.5.0',
      uptime: process.uptime(),
      system: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heap_used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heap_total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        }
      },
      services: {
        database: {
          status: dbStatus === 1 ? 'connected' : 'disconnected',
          ready_state: dbStatus,
          name: mongoose.connection.name || 'unknown'
        }
      },
      features: {
        whaticket: !!process.env.WHATICKET_BACKEND_URL,
        auth: !!process.env.JWT_SECRET,
        logs: true,
        realtime: true
      }
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 