FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache curl git

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

# Comando de inicialização
CMD ["npm", "start"]

# Clonar e buildar dashboard
RUN git clone --depth 1 https://github.com/minimal-ui-kit/material-kit-react.git frontend \
    && cd frontend \
    && npm ci --legacy-peer-deps \
    && npm run build \
    && cp -r dist ../public/dashboard \
    && cd .. \
    && rm -rf frontend 