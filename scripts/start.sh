#!/bin/sh

echo "🚀 =========================================="
echo "🚀 INICIANDO WEBHOOK GONNECT CRM"
echo "🚀 =========================================="
echo "📦 Node.js: $(node --version)"
echo "🌍 NODE_ENV: ${NODE_ENV:-production}"
echo "🔧 PORT: ${PORT:-3000}"
echo "📅 Data/Hora: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=========================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado. Verifique se está no diretório correto."
    exit 1
fi

# Verificar dependências
echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules não encontrado. Instalando dependências..."
    npm install --only=production
fi

# Executar verificação
echo "🔍 Executando verificação de deploy..."
node scripts/check-deploy.js

if [ $? -ne 0 ]; then
    echo "❌ Verificação falhou. Abortando inicialização."
    exit 1
fi

echo "✅ Verificação concluída com sucesso!"

# Definir variáveis de ambiente padrão se não estiverem definidas
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}

# Log de variáveis de ambiente importantes
echo "🔧 Variáveis de ambiente:"
echo "   • NODE_ENV: $NODE_ENV"
echo "   • PORT: $PORT"
echo "   • MONGODB_URI: ${MONGODB_URI:+definido}"
echo "   • JWT_SECRET: ${JWT_SECRET:+definido}"
echo "   • WHATICKET_BACKEND_URL: ${WHATICKET_BACKEND_URL:+definido}"
echo "   • WHATICKET_TOKEN: ${WHATICKET_TOKEN:+definido}"

# Iniciar servidor com tratamento de sinais
echo "🎯 Iniciando servidor..."
trap 'echo "📡 Recebido sinal de parada. Encerrando graciosamente..."; exit 0' TERM INT

# Executar servidor
node server.js 