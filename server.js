const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDatabase } = require('./config/database-local');
const webhookRoutes = require('./routes/webhook');
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require('./config/swagger');
const net = require('net');
const os = require('os');
const { version } = require('./package.json');
const contactsRoutes = require('./routes/contacts');
const ticketsRoutes = require('./routes/tickets');

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
app.use('/contacts', contactsRoutes);
app.use('/tickets', ticketsRoutes);

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

// Função para testar se a porta está realmente aberta
function testPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

// Função para obter IPs locais
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

// Diagnóstico ao iniciar o servidor
async function runDiagnostics() {
  const port = PORT;
  const localTest = await testPort(port, '127.0.0.1');
  const ips = getLocalIPs();
  const results = [];

  for (const ip of ips) {
    // Testa cada IP local
    // (em servidores cloud, pode não funcionar para IP público externo)
    const ok = await testPort(port, ip);
    results.push({ ip, ok });
  }

  console.log('\n=== Diagnóstico de Inicialização ===');
  console.log(`Porta configurada: ${port}`);
  console.log(`Acessível em localhost:${port}? ${localTest ? '✅ Sim' : '❌ Não'}`);
  results.forEach(r => {
    console.log(`Acessível em ${r.ip}:${port}? ${r.ok ? '✅ Sim' : '❌ Não'}`);
  });
  console.log('Testes HTTP recomendados:');
  console.log(`  curl -i http://localhost:${port}/health`);
  ips.forEach(ip => {
    console.log(`  curl -i http://${ip}:${port}/health`);
  });
  console.log('Se não conseguir acessar externamente, verifique:');
  console.log('- Variável de ambiente PORT');
  console.log('- Regras de firewall do servidor');
  console.log('- Configuração de proxy/rede do EasyPanel');
  console.log('====================================\n');
}

async function startServer() {
  try {
    console.log(`🛠️  Iniciando Webhook Gonnect CRM - Versão ${version}`);
    console.log('📦 Build: inclui correções de ticketData case-insensitive e debug de payload');
    await connectDatabase();
    
    const { logger } = require('./utils/logger');
    await logger.ensureLogDirectory();
    
    app.listen(PORT, () => {
      console.log(`🌐 Servidor rodando na porta ${PORT}`);
      console.log(`🎯 Webhook: http://localhost:${PORT}/webhook`);
      runDiagnostics();
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
