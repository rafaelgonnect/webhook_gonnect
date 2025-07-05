# Dockerfile otimizado para startup rápido
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache curl

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Criar diretório de logs
RUN mkdir -p Logs

# Expor porta
EXPOSE 3003

# Health check para porta 3003
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD curl -f http://localhost:3003/health || exit 1

# Comando de inicialização com proteção SIGTERM
CMD ["node", "start-easypanel.js"] 