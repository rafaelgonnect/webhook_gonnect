const mongoose = require('mongoose');

/**
 * Configuração de produção para MongoDB
 * Otimizada para ambiente de produção com melhor tratamento de erros
 */
const PRODUCTION_MONGODB_CONFIG = {
  URI: process.env.MONGODB_URI || 'mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin',
  OPTIONS: {
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
    bufferCommands: true,
    bufferMaxEntries: 0
  }
};

/**
 * Conecta ao banco de dados de produção
 */
async function connectDatabase() {
  try {
    console.log('🔄 Conectando ao MongoDB de produção...');
    
    // Configurar listeners de eventos
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB conectado com sucesso!');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

    // Conectar ao banco
    await mongoose.connect(PRODUCTION_MONGODB_CONFIG.URI, PRODUCTION_MONGODB_CONFIG.OPTIONS);
    
    return mongoose.connection;
    
  } catch (error) {
    console.error('❌ Erro crítico ao conectar ao MongoDB:', error);
    console.error('💡 Verifique:');
    console.error('   - Credenciais do banco');
    console.error('   - Conectividade de rede');
    console.error('   - Firewall e configurações de segurança');
    
    // Em produção, não continuar sem banco
    process.exit(1);
  }
}

/**
 * Desconecta do banco de dados
 */
async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB');
  } catch (error) {
    console.error('❌ Erro ao desconectar do MongoDB:', error);
  }
}

/**
 * Verifica a saúde da conexão
 */
async function checkDatabaseHealth() {
  try {
    if (mongoose.connection.readyState === 1) {
      // Testar com um ping
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        readyState: mongoose.connection.readyState,
        database: mongoose.connection.name,
        host: mongoose.connection.host
      };
    } else {
      return {
        status: 'unhealthy',
        readyState: mongoose.connection.readyState,
        error: 'Conexão não está pronta'
      };
    }
  } catch (error) {
    return {
      status: 'error',
      readyState: mongoose.connection.readyState,
      error: error.message
    };
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
  PRODUCTION_MONGODB_CONFIG
}; 