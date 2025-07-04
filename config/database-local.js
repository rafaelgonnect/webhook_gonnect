const mongoose = require('mongoose');

/**
 * Configuração alternativa para desenvolvimento local
 * Se não conseguir conectar ao MongoDB remoto, tenta conectar localmente
 */
const LOCAL_MONGODB_CONFIG = {
  URI: 'mongodb://localhost:27017/webhook_gonnect_local',
  OPTIONS: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000
  }
};

const REMOTE_MONGODB_CONFIG = {
  URI: 'mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin',
  OPTIONS: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000
  }
};

/**
 * Conecta ao banco de dados com fallback
 */
async function connectDatabase() {
  try {
    console.log('🔄 Tentando conectar ao MongoDB remoto...');
    
    // Primeira tentativa: MongoDB remoto
    try {
      await mongoose.connect(REMOTE_MONGODB_CONFIG.URI, REMOTE_MONGODB_CONFIG.OPTIONS);
      console.log('✅ Conectado ao MongoDB remoto com sucesso!');
      console.log(`📊 Database: webhook_gonnect (remoto)`);
      return mongoose.connection;
    } catch (remoteError) {
      console.warn('⚠️ Falha ao conectar no MongoDB remoto:', remoteError.message);
      
      // Segunda tentativa: MongoDB local
      console.log('🔄 Tentando conectar ao MongoDB local...');
      await mongoose.connect(LOCAL_MONGODB_CONFIG.URI, LOCAL_MONGODB_CONFIG.OPTIONS);
      console.log('✅ Conectado ao MongoDB local com sucesso!');
      console.log(`📊 Database: webhook_gonnect_local (local)`);
      console.log('💡 Para usar o banco remoto, verifique as credenciais e conectividade');
      return mongoose.connection;
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB (local e remoto):', error);
    console.error('💡 Certifique-se de que o MongoDB está rodando localmente ou as credenciais remotas estão corretas');
    
    // Para desenvolvimento, vamos continuar sem banco
    console.log('⚠️ Continuando sem conexão de banco para desenvolvimento...');
    return null;
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
  LOCAL_MONGODB_CONFIG,
  REMOTE_MONGODB_CONFIG
}; 