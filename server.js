const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDatabase } = require('./config/database-local');
const webhookRoutes = require('./routes/webhook');
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require('./config/swagger');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Endpoint para especificação Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rotas
/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Informações básicas da API
 *     description: Retorna informações gerais sobre a API e endpoints disponíveis
 *     responses:
 *       200:
 *         description: Informações da API retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 service:
 *                   type: string
 *                   example: 'Gonnect CRM Webhook API'
 *                 version:
 *                   type: string
 *                   example: '1.0.0'
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     webhook:
 *                       type: string
 *                       example: 'POST /webhook'
 *                     docs:
 *                       type: string
 *                       example: 'GET /api-docs'
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Gonnect CRM Webhook API',
    version: '1.0.0',
    endpoints: {
      webhook: 'POST /webhook',
      test: 'GET /webhook/test',
      health: 'GET /webhook/health',
      docs: 'GET /api-docs',
      swagger: 'GET /swagger.json'
    }
  });
});

app.use('/webhook', webhookRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Health check do sistema
 *     description: Verifica o status de saúde da aplicação e suas dependências
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
 *                   example: 'ok'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Tempo de atividade em segundos
 *                   example: 3600
 *       500:
 *         description: Sistema com problemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado'
  });
});

app.use((error, req, res, next) => {
  console.error('Erro:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

async function startServer() {
  try {
    console.log('🚀 Iniciando servidor...');
    await connectDatabase();
    
    const { logger } = require('./utils/logger');
    await logger.ensureLogDirectory();
    
    app.listen(PORT, () => {
      console.log(`🌐 Servidor rodando na porta ${PORT}`);
      console.log(`🎯 Webhook: http://localhost:${PORT}/webhook`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
