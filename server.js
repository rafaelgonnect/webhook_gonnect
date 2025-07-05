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
const messagesRoutes = require('./routes/messages');
const statsRoutes = require('./routes/stats');
const tagsRoutes = require('./routes/tags');
const { scheduleLogRotation } = require('./services/logRotation');
const authRoutes = require('./routes/auth');
const AdminUser = require('./models/AdminUser');
const bcrypt = require('bcryptjs');
const path = require('path');
const dashboardApiRoutes = require('./routes/dashboardApi');
const authJwt = require('./middleware/auth');
const http = require('http');
const { initRealtime } = require('./services/realtime');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: false
}));
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
    version: version,
    endpoints: {
      webhook: 'POST /webhook',
      test: 'GET /webhook/test',
      health: 'GET /webhook/health',
      docs: 'GET /api-docs',
      swagger: 'GET /swagger.json',
      messages: `GET /messages`,
      stats: 'GET /stats',
      tags: 'GET /tags',
      dashboard: 'GET /dashboard'
    }
  });
});

app.use('/webhook', webhookRoutes);
app.use('/contacts', authJwt, contactsRoutes);
app.use('/tickets', authJwt, ticketsRoutes);
app.use('/messages', authJwt, messagesRoutes);
app.use('/stats', authJwt, statsRoutes);
app.use('/tags', authJwt, tagsRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', express.static(path.join(__dirname,'public','dashboard')));
app.get('/dashboard', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','dashboard','index.html'));
});
app.use('/dashboard-api', authJwt, dashboardApiRoutes);

// servir assets gerados do dashboard
app.use('/assets', express.static(path.join(__dirname, 'public', 'dashboard', 'assets')));

// favicon do dashboard (evita 404)
app.get('/favicon.ico', (req, res) => {
  const iconPath = path.join(__dirname, 'public', 'dashboard', 'favicon.ico');
  res.sendFile(iconPath);
});

// Custom 404 para dashboard (HTML simples)
app.use('/dashboard', (req, res, next) => {
  res.status(404).send(`
    <html style='background:#222;color:#fff;font-family:sans-serif;'>
      <head><title>Dashboard 404</title></head>
      <body style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;'>
        <h1 style='font-size:3em;'>404 - Dashboard Customizado</h1>
        <p>Esta tela foi gerada pelo backend Express.<br>Se você está vendo isso, o build do dashboard não foi encontrado ou há erro de rota.</p>
        <p style='color:#ff0;'>Verifique se <b>public/dashboard/index.html</b> existe e se o build foi copiado corretamente.</p>
        <hr style='width:50%;border:1px solid #444;'>
        <small>Gonnect CRM &mdash; build: <span id='build-date'></span></small>
        <script>document.getElementById('build-date').textContent = new Date().toLocaleString()</script>
      </body>
    </html>
  `);
});

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

// Health extended
app.get('/health/extended', async (req, res) => {
  try {
    const Ticket = require('./models/Ticket');
    const Message = require('./models/Message');
    const Tag = require('./models/Tag').Tag;
    const counts = await Promise.all([
      Ticket.countDocuments(),
      Message.countDocuments(),
      Tag.countDocuments()
    ]);
    res.json({
      status: 'ok',
      mongoState: require('mongoose').connection.readyState,
      totals: {
        tickets: counts[0],
        messages: counts[1],
        tags: counts[2]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
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
    console.log('🚀 ==========================================');
    console.log('🚀 INICIANDO WEBHOOK GONNECT CRM');
    console.log('🚀 ==========================================');
    console.log(`📦 Versão: ${version}`);
    console.log(`🌍 Ambiente: ${NODE_ENV}`);
    console.log(`🔧 Porta: ${PORT}`);
    console.log(`📅 Data/Hora: ${new Date().toISOString()}`);
    console.log('==========================================');
    
    // Verificar variáveis de ambiente
    console.log('🔍 Verificando variáveis de ambiente...');
    console.log(`   • NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
    console.log(`   • PORT: ${process.env.PORT || 'não definido (usando 3000)'}`);
    console.log(`   • EXTERNAL_BASE_URL: ${process.env.EXTERNAL_BASE_URL || 'não definido'}`);
    console.log(`   • MONGODB_URI: ${process.env.MONGODB_URI ? 'definido' : 'não definido'}`);
    
    // Verificar dependências críticas
    console.log('📦 Verificando dependências...');
    try {
      require('express');
      require('mongoose');
      require('cors');
      require('helmet');
      require('bcryptjs');
      require('jsonwebtoken');
      console.log('   ✅ Todas as dependências carregadas com sucesso');
    } catch (depError) {
      console.error('   ❌ Erro ao carregar dependência:', depError.message);
      throw depError;
    }
    
    // Conectar ao banco de dados
    console.log('🗄️  Conectando ao banco de dados...');
    await connectDatabase();
    console.log('   ✅ Conexão com banco de dados estabelecida');
    
    // Configurar logger
    console.log('📝 Configurando sistema de logs...');
    const { logger } = require('./utils/logger');
    await logger.ensureLogDirectory();
    console.log('   ✅ Sistema de logs configurado');
    
    // Verificar arquivos críticos
    console.log('📁 Verificando arquivos críticos...');
    const fs = require('fs');
    const path = require('path');
    
    const criticalFiles = [
      'public/dashboard/index.html',
      'middleware/auth.js',
      'routes/auth.js',
      'models/AdminUser.js'
    ];
    
    for (const file of criticalFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ⚠️  ${file} - NÃO ENCONTRADO`);
      }
    }
    
    const BASE_URL = process.env.EXTERNAL_BASE_URL || `http://localhost:${PORT}`;
    console.log('🔗 Endpoints disponíveis:');
    console.log(`   • Swagger:    ${BASE_URL}/api-docs`);
    console.log(`   • Health:     ${BASE_URL}/health`);
    console.log(`   • Webhook:    ${BASE_URL}/webhook`);
    console.log(`   • Auth:       ${BASE_URL}/auth/login`);
    console.log(`   • Contacts:   ${BASE_URL}/contacts`);
    console.log(`   • Tickets:    ${BASE_URL}/tickets`);
    console.log(`   • Messages:   ${BASE_URL}/messages`);
    console.log(`   • Stats:      ${BASE_URL}/stats`);
    console.log(`   • Tags:       ${BASE_URL}/tags`);
    console.log(`   • Dashboard:  ${BASE_URL}/dashboard`);
    
    // Garantir usuário admin
    console.log('👑 Verificando usuário administrador...');
    await ensureAdminExists();
    console.log('   ✅ Usuário admin verificado/criado');
    
    // Criar servidor HTTP
    console.log('🌐 Criando servidor HTTP...');
    const server = http.createServer(app);
    
    // Inicializar realtime
    console.log('⚡ Inicializando sistema realtime...');
    initRealtime(server);
    console.log('   ✅ Sistema realtime inicializado');
    
    // Iniciar servidor
    console.log('🎯 Iniciando servidor na porta', PORT);
    server.listen(PORT, () => {
      console.log('🎉 ==========================================');
      console.log('🎉 SERVIDOR INICIADO COM SUCESSO!');
      console.log('🎉 ==========================================');
      console.log(`🌐 URL Local: http://localhost:${PORT}`);
      console.log(`🔗 Webhook: http://localhost:${PORT}/webhook`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
      console.log('==========================================');
      
      // Executar diagnósticos
      runDiagnostics();
    });
    
    // Configurar rotação de logs
    console.log('📋 Configurando rotação de logs...');
    scheduleLogRotation();
    console.log('   ✅ Rotação de logs configurada');
    
    // Log de memória
    const memUsage = process.memoryUsage();
    console.log('💾 Uso de memória inicial:');
    console.log(`   • RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
    console.log(`   • Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
    
    console.log('✅ Inicialização concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ ==========================================');
    console.error('❌ ERRO CRÍTICO NA INICIALIZAÇÃO');
    console.error('❌ ==========================================');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.error('==========================================');
    process.exit(1);
  }
}

async function ensureAdminExists() {
  try {
    const count = await AdminUser.countDocuments();
    if (count === 0) {
      const username = process.env.ADMIN_USER || 'admin';
      const password = process.env.ADMIN_PASS || 'admin123';
      const hash = await bcrypt.hash(password, 10);
      await AdminUser.create({ username, passwordHash: hash });
      console.log('👑 Usuário administrador padrão criado:');
      console.log(`   • username: ${username}`);
      console.log(`   • password: ${password}`);
    }
  } catch (error) {
    console.error('Erro ao garantir admin:', error);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
