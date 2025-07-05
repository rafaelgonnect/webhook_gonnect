# Dockerfile simplificado para dashboard técnico puro
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache curl

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Criar diretório de logs e definir permissões
RUN mkdir -p Logs && chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização com verificação e logs detalhados
CMD ["sh", "-c", "echo '🚀 Iniciando aplicação...' && echo '📦 Node.js:' $(node --version) && echo '🌍 NODE_ENV:' ${NODE_ENV:-production} && echo '🔧 PORT:' ${PORT:-3000} && npm run check && npm start"] 