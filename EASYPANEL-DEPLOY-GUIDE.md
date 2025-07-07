# 🚀 Guia Completo de Deploy no EasyPanel

## Webhook Gonnect CRM - Deploy Otimizado

### 📋 **Pré-requisitos**

- [x] Conta no EasyPanel
- [x] Repositório GitHub configurado
- [x] Banco MongoDB configurado
- [x] Variáveis de ambiente definidas

---

## 🔧 **1. Configuração das Variáveis de Ambiente**

### **Variáveis OBRIGATÓRIAS:**

```bash
NODE_ENV=production
PORT=3003
EXTERNAL_BASE_URL=https://seu-dominio.easypanel.app
MONGODB_URI=mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin
JWT_SECRET=webhook_gonnect_jwt_secret_2024_super_forte_123456789
```

### **Variáveis OPCIONAIS:**

```bash
ADMIN_USER=admin
ADMIN_PASS=Admin@2024!
WHATICKET_BACKEND_URL=https://sua-instancia-whaticket.com
WHATICKET_TOKEN=seu_token_de_acesso_whaticket
```

### **Variáveis Mágicas do EasyPanel:**

```bash
# Estas são substituídas automaticamente pelo EasyPanel:
$(PROJECT_NAME)     # Nome do seu projeto
$(SERVICE_NAME)     # Nome do serviço
$(PRIMARY_DOMAIN)   # Domínio primário configurado
```

---

## 🏗️ **2. Configuração do Projeto no EasyPanel**

### **Passo 1: Criar Novo Projeto**

1. Acesse o **EasyPanel Console**
2. Clique em **"Create Project"**
3. Escolha **"Deploy with GitHub"**
4. Conecte com seu repositório GitHub

### **Passo 2: Configurações do App Service**

#### **Source (Fonte):**
- **Tipo:** GitHub Repository
- **Repositório:** `rafaelgonnect/webhook_gonnect`
- **Branch:** `main`
- **Build Command:** `npm ci --only=production`
- **Start Command:** `npm start`

#### **Environment (Ambiente):**
```bash
NODE_ENV=production
PORT=3003
EXTERNAL_BASE_URL=https://$(PRIMARY_DOMAIN)
MONGODB_URI=mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin
JWT_SECRET=webhook_gonnect_jwt_secret_2024_super_forte_123456789
ADMIN_USER=admin
ADMIN_PASS=Admin@2024!
```

#### **Domains & Proxy (Domínios):**
- **Proxy Port:** `3003`
- **Domain:** `webhook-gonnect.seu-dominio.com`
- **SSL:** ✅ Ativar Let's Encrypt

#### **Mounts (Volumes):**
```yaml
# Volume para logs persistentes
Name: logs
Mount Path: /app/Logs
Type: Volume
```

#### **Deploy Settings:**
- **Replicas:** `1`
- **Command:** `node start-easypanel.js`
- **Working Directory:** `/app`

---

## 🐳 **3. Configuração Docker Otimizada**

### **Dockerfile (já otimizado):**
- ✅ Usuário não-root para segurança
- ✅ `dumb-init` para signal handling
- ✅ Health checks otimizados
- ✅ Cache layers para builds rápidos
- ✅ Multi-stage otimizado

### **Health Checks Disponíveis:**
```bash
# Health check básico (usado pelo EasyPanel)
GET /health

# Readiness check (aplicação pronta)
GET /health/ready

# Liveness check (aplicação viva)
GET /health/live

# Health detalhado (diagnósticos)
GET /health/detailed
```

---

## 📡 **4. Endpoints Configurados**

Após o deploy, sua aplicação estará disponível em:

```bash
# API Base
https://seu-dominio.com

# Health Checks
https://seu-dominio.com/health
https://seu-dominio.com/health/ready
https://seu-dominio.com/health/live

# Webhook Principal
https://seu-dominio.com/webhook

# Dashboard
https://seu-dominio.com/dashboard

# Documentação API
https://seu-dominio.com/api-docs

# Endpoints da API
https://seu-dominio.com/auth/login
https://seu-dominio.com/contacts
https://seu-dominio.com/tickets
https://seu-dominio.com/messages
https://seu-dominio.com/stats
https://seu-dominio.com/tags
```

---

## 🔍 **5. Verificação do Deploy**

### **Checklist Pós-Deploy:**

```bash
# 1. Verificar se a aplicação está online
curl -f https://seu-dominio.com/health

# 2. Verificar se está pronta para tráfego
curl -f https://seu-dominio.com/health/ready

# 3. Testar o webhook principal
curl -X POST https://seu-dominio.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 4. Verificar documentação
curl -f https://seu-dominio.com/api-docs

# 5. Testar autenticação
curl -X POST https://seu-dominio.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@2024!"}'
```

### **Logs de Sucesso Esperados:**

```bash
🚀 Iniciando servidor para EasyPanel...
📦 Node.js: v18.20.8
🌍 NODE_ENV: production
🔧 PORT: 3003
🎯 Carregando servidor principal...
🚀 INICIANDO WEBHOOK GONNECT CRM
📦 Versão: 1.5.0
🌍 Ambiente: production
🔧 Porta: 3003
✅ Conectado ao MongoDB com sucesso!
🎉 SERVIDOR INICIADO COM SUCESSO!
🌐 URL Local: http://localhost:3003
```

---

## 🚨 **6. Troubleshooting**

### **Problemas Comuns:**

#### **Aplicação não inicia:**
```bash
# Verificar logs no EasyPanel Console
# Verificar variáveis de ambiente
# Verificar se a porta 3003 está configurada corretamente
```

#### **Erro de conexão com MongoDB:**
```bash
# Verificar MONGODB_URI
# Verificar firewall/rede
# Testar conexão manualmente:
npm run db:test
```

#### **Health check falha:**
```bash
# Verificar se a aplicação está respondendo na porta 3003
# Verificar logs de erro
# Testar localmente:
npm run test:health
```

#### **Build falha:**
```bash
# Verificar se todas as dependências estão no package.json
# Verificar se não há arquivos corrompidos
# Verificar logs de build no EasyPanel
```

---

## 📊 **7. Monitoramento e Logs**

### **Logs Disponíveis:**
```bash
# No EasyPanel Console > Logs
# Logs estruturados em JSON
# Rotação automática diária
# Logs de erro separados
```

### **Métricas de Health:**
```bash
# Uptime da aplicação
GET /health/detailed

# Uso de memória
GET /health/live

# Status do banco
GET /health/ready
```

---

## 🔄 **8. Auto Deploy (CI/CD)**

### **Configuração do Auto Deploy:**

1. **No EasyPanel:**
   - Ative "Auto Deploy" nas configurações do projeto
   - Webhook será adicionado automaticamente ao GitHub

2. **Fluxo Automático:**
   ```bash
   git push origin main
   → GitHub webhook
   → EasyPanel build
   → Deploy automático
   → Health check
   → Aplicação online
   ```

### **Deploy Manual Via Webhook:**
```bash
# URL do webhook de deploy (disponível no console)
curl -X POST "https://api.easypanel.io/deploy/webhook/SEU_WEBHOOK_URL"
```

---

## 🛡️ **9. Segurança e Boas Práticas**

### **Implementado:**
- ✅ HTTPS com Let's Encrypt
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado
- ✅ JWT para autenticação
- ✅ Usuário não-root no container
- ✅ Variáveis de ambiente seguras
- ✅ Rate limiting

### **Recomendações:**
- 🔄 Rotacionar JWT_SECRET regularmente
- 🔄 Monitorar logs de acesso
- 🔄 Backup regular do MongoDB
- 🔄 Atualizações de segurança

---

## 📞 **10. Suporte**

### **Recursos Úteis:**
- [Documentação EasyPanel](https://easypanel.io/docs)
- [Templates EasyPanel](https://easypanel.io/docs/templates)
- [Suporte EasyPanel](https://discord.gg/easypanel)

### **Scripts de Diagnóstico:**
```bash
# Verificar deploy
npm run check

# Testar health checks
npm run test:health
npm run test:ready

# Verificar banco
npm run db:test

# Limpar logs
npm run logs:clean
```

---

## ✅ **Checklist Final**

- [ ] Variáveis de ambiente configuradas
- [ ] Domínio e SSL ativo
- [ ] Health checks respondendo
- [ ] Webhook funcionando
- [ ] Dashboard acessível
- [ ] API documentada
- [ ] Auto deploy ativo
- [ ] Logs funcionando
- [ ] Backup configurado

---

**🎉 Parabéns! Sua aplicação Webhook Gonnect CRM está rodando no EasyPanel!**

Para suporte técnico, consulte os logs no console do EasyPanel ou entre em contato através dos canais oficiais. 