require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = 'morgan';
const { connectDatabase } = require('./config/database');
const webhookRoutes = require('./routes/webhook');
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require('./config/swagger');
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
const healthRoutes = require('./routes/health');
const authJwt = require('./middleware/auth');
const http = require('http');
const { initRealtime } = require('./services/realtime');

const PORT = process.env.PORT || 3003;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rotas
app.get('/', (req, res) => {
  res.json({
    service: 'Gonnect CRM Webhook API',
    version: version,
    status: 'online',
    docs: '/api-docs',
    health: '/health',
    dashboard: '/dashboard'
  });
});

app.use('/webhook', webhookRoutes);
app.use('/contacts', authJwt, contactsRoutes);
app.use('/tickets', authJwt, ticketsRoutes);
app.use('/messages', authJwt, messagesRoutes);
app.use('/stats', authJwt, statsRoutes);
app.use('/tags', authJwt, tagsRoutes);
app.use('/auth', authRoutes);
app.use('/health', healthRoutes);
app.use('/dashboard-api', authJwt, dashboardApiRoutes);

// Servir o Dashboard estático
const dashboardPath = path.join(__dirname, 'public', 'dashboard');
app.use('/dashboard', express.static(dashboardPath));
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.join(dashboardPath, 'index.html'));
});

// Error handling
app.use((error, req, res, next) => {
  console.error('❌ Erro interno:', error);
  res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint não encontrado.' });
});

async function ensureAdminExists() {
  try {
    const count = await AdminUser.countDocuments();
    if (count === 0) {
      const username = process.env.ADMIN_USER || 'admin';
      const password = process.env.ADMIN_PASS || 'admin123';
      const hash = await bcrypt.hash(password, 10);
      await AdminUser.create({ username, passwordHash: hash });
      console.log(`👑 Usuário admin padrão criado: ${username}`);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar/criar usuário admin:', error);
  }
}

async function startServer() {
  try {
    console.log(`🚀 Iniciando Gonnect CRM v${version} em modo ${NODE_ENV}...`);

    await connectDatabase();
    await ensureAdminExists();
    scheduleLogRotation();

    const server = http.createServer(app);
    initRealtime(server);

    server.listen(PORT, () => {
      console.log(`✅ Servidor pronto e ouvindo na porta ${PORT}`);
      console.log(`🔗 Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`📚 Docs: http://localhost:${PORT}/api-docs`);
    });

    const gracefulShutdown = (signal) => {
      console.log(`
👋 Recebido ${signal}. Encerrando graciosamente...`);
      server.close(() => {
        console.log('✅ Servidor encerrado.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Erro crítico na inicialização:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };