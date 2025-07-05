#!/usr/bin/env node

console.log('🚀 Iniciando servidor para EasyPanel...');
console.log('📦 Node.js:', process.version);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'production');
console.log('🔧 PORT:', process.env.PORT || 3000);

// Ignorar SIGTERM nos primeiros 20 segundos
let startTime = Date.now();
let originalSigterm = process.listeners('SIGTERM');

function protectedSigterm() {
  const elapsed = Date.now() - startTime;
  if (elapsed < 20000) { // 20 segundos
    console.log(`⚠️  SIGTERM ignorado - apenas ${Math.round(elapsed/1000)}s desde o início`);
    console.log('🔄 Aguardando estabilização completa...');
    return;
  }
  
  console.log('📡 SIGTERM aceito - servidor estabilizado');
  process.exit(0);
}

// Substituir handler de SIGTERM
process.removeAllListeners('SIGTERM');
process.on('SIGTERM', protectedSigterm);

// Após 20 segundos, restaurar comportamento normal
setTimeout(() => {
  console.log('🛡️  Proteção SIGTERM desativada - servidor estabilizado');
  process.removeAllListeners('SIGTERM');
  
  // Restaurar handlers originais se existirem
  originalSigterm.forEach(listener => {
    process.on('SIGTERM', listener);
  });
}, 20000);

// Iniciar o servidor principal
console.log('🎯 Carregando servidor principal...');
require('./server.js'); 