const mongoose = require('mongoose');

/**
 * Configurações de conexão com MongoDB
 */
const MONGODB_CONFIG = {
  URI: process.env.MONGODB_URI,
  OPTIONS: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000
  }
};

/**
 * Conecta ao banco de dados MongoDB
 * @returns {Promise} Promise da conexão
 */
async function connectDatabase() {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    
    await mongoose.connect(MONGODB_CONFIG.URI, MONGODB_CONFIG.OPTIONS);
    
    console.log('✅ Conectado ao MongoDB com sucesso!');
    console.log(`📊 Database: webhook_gonnect`);
    
    // Event listeners para monitoramento da conexão
    mongoose.connection.on('error', (error) => {
      console.error('❌ Erro na conexão MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
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

module.exports = {
  connectDatabase,
  disconnectDatabase,
  MONGODB_CONFIG
}; 