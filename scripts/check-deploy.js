#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 ==========================================');
console.log('🔍 VERIFICAÇÃO DE DEPLOY');
console.log('🔍 ==========================================');

// Verificar Node.js
console.log('📦 Node.js:', process.version);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'production');
console.log('🔧 PORT:', process.env.PORT || 3000);

// Verificar package.json
console.log('\n📋 Verificando package.json...');
try {
  const packageJson = require('../package.json');
  console.log('   ✅ package.json válido');
  console.log(`   📦 Versão: ${packageJson.version}`);
  console.log(`   🎯 Main: ${packageJson.main}`);
  console.log(`   📚 Scripts: ${Object.keys(packageJson.scripts).join(', ')}`);
} catch (error) {
  console.error('   ❌ Erro no package.json:', error.message);
  process.exit(1);
}

// Verificar dependências críticas
console.log('\n📦 Verificando dependências...');
const criticalDeps = [
  'express',
  'mongoose',
  'cors',
  'helmet',
  'bcryptjs',
  'jsonwebtoken',
  'socket.io',
  'swagger-ui-express'
];

for (const dep of criticalDeps) {
  try {
    require(dep);
    console.log(`   ✅ ${dep}`);
  } catch (error) {
    console.error(`   ❌ ${dep}: ${error.message}`);
    process.exit(1);
  }
}

// Verificar arquivos críticos
console.log('\n📁 Verificando arquivos críticos...');
const criticalFiles = [
  'server.js',
  'package.json',
  'middleware/auth.js',
  'routes/auth.js',
  'routes/webhook.js',
  'models/AdminUser.js',
  'models/Contact.js',
  'models/Message.js',
  'models/Ticket.js',
  'models/Tag.js',
  'config/database-local.js',
  'config/swagger.js',
  'utils/logger.js',
  'public/dashboard/index.html'
];

for (const file of criticalFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.error(`   ❌ ${file} - NÃO ENCONTRADO`);
    process.exit(1);
  }
}

// Verificar diretórios
console.log('\n📂 Verificando diretórios...');
const directories = [
  'Logs',
  'public/dashboard',
  'middleware',
  'routes',
  'models',
  'config',
  'utils',
  'services'
];

for (const dir of directories) {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`   ✅ ${dir}/`);
  } else {
    console.error(`   ❌ ${dir}/ - NÃO ENCONTRADO`);
    process.exit(1);
  }
}

// Verificar variáveis de ambiente
console.log('\n🔧 Verificando variáveis de ambiente...');
const envVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET'
];

for (const envVar of envVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: ${envVar === 'JWT_SECRET' ? '***' : value}`);
  } else {
    console.log(`   ⚠️  ${envVar}: não definido (usando padrão)`);
  }
}

// Testar conexão com banco (se MONGODB_URI estiver definido)
if (process.env.MONGODB_URI) {
  console.log('\n🗄️  Testando conexão com banco...');
  try {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    setTimeout(() => {
      if (mongoose.connection.readyState === 1) {
        console.log('   ✅ Conexão com banco OK');
        mongoose.connection.close();
      } else {
        console.log('   ⚠️  Não foi possível conectar ao banco (pode ser normal em ambiente de build)');
      }
    }, 2000);
  } catch (error) {
    console.log('   ⚠️  Erro ao testar banco:', error.message);
  }
}

// Verificar se o servidor pode ser carregado
console.log('\n🚀 Testando carregamento do servidor...');
try {
  const { app } = require('../server.js');
  console.log('   ✅ Servidor carregado com sucesso');
} catch (error) {
  console.error('   ❌ Erro ao carregar servidor:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

console.log('\n🎉 ==========================================');
console.log('🎉 VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');
console.log('🎉 ==========================================');
console.log('✅ Todos os arquivos críticos encontrados');
console.log('✅ Todas as dependências carregadas');
console.log('✅ Servidor pode ser inicializado');
console.log('🚀 Pronto para deploy!');
console.log('=========================================='); 