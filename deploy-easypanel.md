# 🚀 Plano de Deploy - EasyPanel

## 📋 Visão Geral

Este documento contém o plano completo para publicar o backend **Webhook Gonnect CRM** no EasyPanel, incluindo todos os arquivos de configuração necessários e etapas detalhadas.

## 🎯 Objetivos

- [ ] Configurar ambiente de produção no EasyPanel
- [ ] Configurar banco de dados MongoDB
- [ ] Configurar variáveis de ambiente
- [ ] Configurar domínio e SSL
- [ ] Configurar monitoramento e logs
- [ ] Testar funcionalidades em produção

## 📁 Arquivos de Configuração Necessários

### 1. Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. docker-compose.yml
```yaml
version: '3.8'

services:
  webhook-gonnect:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin
    restart: unless-stopped
    volumes:
      - ./Logs:/app/Logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
Logs/*
!Logs/.gitkeep
```

### 4. nginx.conf (opcional - para proxy reverso)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Configurações do EasyPanel

### 1. Configuração do Aplicativo
- **Nome**: `webhook-gonnect-crm`
- **Tipo**: Node.js
- **Porta**: `3000`
- **Comando de inicialização**: `npm start`
- **Diretório de trabalho**: `/app`

### 2. Variáveis de Ambiente
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin
```

### 3. Configurações de Rede
- **Domínio**: `api.gonnect.com.br` (ou seu domínio)
- **SSL**: Ativar certificado Let's Encrypt
- **Proxy Reverso**: Configurar para porta 3000

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] Verificar se o código está no repositório Git
- [ ] Testar aplicação localmente
- [ ] Verificar conectividade com MongoDB
- [ ] Preparar arquivos de configuração

### Deploy no EasyPanel
- [ ] Criar novo aplicativo no EasyPanel
- [ ] Configurar repositório Git
- [ ] Definir variáveis de ambiente
- [ ] Configurar domínio e SSL
- [ ] Fazer primeiro deploy
- [ ] Verificar logs de inicialização

### Pós-Deploy
- [ ] Testar endpoint de health: `GET /health`
- [ ] Testar endpoint principal: `GET /`
- [ ] Testar webhook: `POST /webhook`
- [ ] Verificar documentação: `GET /api-docs`
- [ ] Configurar monitoramento
- [ ] Configurar backup automático

## 🔍 Testes de Validação

### 1. Teste de Conectividade
```bash
curl -X GET https://seu-dominio.com/health
```

### 2. Teste do Webhook
```bash
curl -X POST https://seu-dominio.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "payload"}'
```

### 3. Teste da Documentação
```bash
curl -X GET https://seu-dominio.com/api-docs
```

## 📊 Monitoramento

### 1. Logs
- Configurar rotação de logs
- Monitorar erros de aplicação
- Monitorar performance

### 2. Métricas
- Uptime da aplicação
- Tempo de resposta
- Uso de recursos
- Conexões com banco

### 3. Alertas
- Falha na aplicação
- Erro de conexão com banco
- Alto uso de CPU/Memória

## 🔒 Segurança

### 1. Configurações de Segurança
- [ ] Ativar HTTPS
- [ ] Configurar headers de segurança
- [ ] Implementar rate limiting
- [ ] Configurar firewall

### 2. Backup
- [ ] Configurar backup do banco
- [ ] Configurar backup dos logs
- [ ] Testar processo de restore

## 🚨 Troubleshooting

### Problemas Comuns

1. **Aplicação não inicia**
   - Verificar logs do EasyPanel
   - Verificar variáveis de ambiente
   - Verificar conectividade com banco

2. **Erro de conexão com MongoDB**
   - Verificar credenciais
   - Verificar firewall
   - Verificar rede

3. **Webhook não funciona**
   - Verificar URL pública
   - Verificar formato do payload
   - Verificar logs de processamento

## 📞 Suporte

Para problemas específicos do EasyPanel:
- Documentação oficial: https://easypanel.io/docs
- Comunidade: https://github.com/easypanelio/easypanel

---

**Última atualização**: $(date)
**Versão**: 1.0.0 