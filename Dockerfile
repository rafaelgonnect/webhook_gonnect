# Estágio 1: Build - Instala dependências
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies se necessário para algum build step)
RUN npm ci

# ---

# Estágio 2: Produção - Imagem final e enxuta
FROM node:18-alpine

WORKDIR /app

# Cria um usuário e grupo não-root para a aplicação
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copia as dependências de produção do estágio de build
COPY --from=builder /app/node_modules ./node_modules

# Copia todo o código da aplicação
COPY . .

# Define as permissões para o usuário da aplicação
RUN chown -R appuser:appgroup /app

# Muda para o usuário não-root
USER appuser

# Expõe a porta da aplicação
EXPOSE 3003

# Healthcheck para o Easypanel
# Verifica se o endpoint /health responde com sucesso
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Comando para iniciar a aplicação
CMD [ "node", "server.js" ]