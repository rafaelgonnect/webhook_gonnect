#!/bin/bash

# Script de Deploy para EasyPanel
# Webhook Gonnect CRM

set -e

echo "🚀 Iniciando deploy do Webhook Gonnect CRM..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar dependências
log "Verificando dependências..."
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado"
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    warn "Arquivo .env não encontrado. Criando template..."
    cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin
EOF
    log "Arquivo .env criado com configurações padrão"
fi

# Testar build local
log "Testando build local..."
docker build -t webhook-gonnect-test .

# Testar conectividade com MongoDB
log "Testando conectividade com MongoDB..."
if docker run --rm webhook-gonnect-test node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin';
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('✅ MongoDB conectado com sucesso'); process.exit(0); })
  .catch(err => { console.error('❌ Erro ao conectar MongoDB:', err.message); process.exit(1); });
"; then
    log "✅ Conectividade com MongoDB OK"
else
    error "❌ Falha na conectividade com MongoDB"
    exit 1
fi

# Criar diretório de logs se não existir
mkdir -p Logs

# Build da imagem de produção
log "Fazendo build da imagem de produção..."
docker build -t webhook-gonnect:latest .

# Parar containers existentes
log "Parando containers existentes..."
docker-compose down || true

# Iniciar serviços
log "Iniciando serviços..."
docker-compose up -d

# Aguardar inicialização
log "Aguardando inicialização da aplicação..."
sleep 10

# Verificar health check
log "Verificando health check..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log "✅ Aplicação está respondendo"
        break
    fi
    
    if [ $i -eq 30 ]; then
        error "❌ Aplicação não está respondendo após 30 tentativas"
        docker-compose logs
        exit 1
    fi
    
    warn "Tentativa $i/30 - Aguardando..."
    sleep 2
done

# Testar endpoints
log "Testando endpoints..."

# Teste do endpoint principal
if curl -s http://localhost:3000/ | grep -q "Gonnect CRM Webhook API"; then
    log "✅ Endpoint principal OK"
else
    error "❌ Endpoint principal falhou"
fi

# Teste do endpoint de health
if curl -s http://localhost:3000/health | grep -q "ok"; then
    log "✅ Endpoint health OK"
else
    error "❌ Endpoint health falhou"
fi

# Teste da documentação
if curl -s http://localhost:3000/api-docs > /dev/null; then
    log "✅ Documentação acessível"
else
    warn "⚠️ Documentação não acessível"
fi

# Mostrar informações finais
log "🎉 Deploy concluído com sucesso!"
echo ""
echo "📊 Informações do Deploy:"
echo "   URL Local: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo "   Documentação: http://localhost:3000/api-docs"
echo "   Webhook: http://localhost:3000/webhook"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""

# Verificar se há logs de erro
if docker-compose logs --tail=50 | grep -i error; then
    warn "⚠️ Encontrados erros nos logs. Verifique com: docker-compose logs"
fi

log "✅ Deploy finalizado!" 