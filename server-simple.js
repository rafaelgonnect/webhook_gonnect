const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

console.log('🚀 Servidor simples iniciando...');
console.log('📦 Node.js:', process.version);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('🔧 PORT:', PORT);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    version: process.version
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('🎉 Servidor simples rodando na porta', PORT);
  console.log('🌐 Teste: http://localhost:' + PORT);
  console.log('❤️ Health: http://localhost:' + PORT + '/health');
});

console.log('✅ Script executado com sucesso!'); 