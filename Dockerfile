# Dockerfile otimizado para EasyPanel
FROM node:18-alpine

# Informações sobre a imagem
LABEL maintainer="Webhook Gonnect CRM"
LABEL description="Sistema webhook CRM para integração com Whaticket"
LABEL version="1.5.0"

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (cache layer)
COPY package*.json ./

# Instalar dependências de produção com otimizações
RUN npm ci --only=production \
    && npm cache clean --force \
    && chown -R nextjs:nodejs /app

# Copiar código da aplicação
COPY --chown=nextjs:nodejs . .

# Criar diretório de logs com permissões corretas
RUN mkdir -p Logs \
    && chown -R nextjs:nodejs Logs

# Mudar para usuário não-root
USER nextjs

# Expor porta 3003
EXPOSE 3003

# Health check otimizado para EasyPanel
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Usar dumb-init para melhor signal handling
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicialização otimizado para EasyPanel
CMD ["node", "start-easypanel.js"] 