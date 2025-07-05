# 🔧 Troubleshooting - Deploy EasyPanel

## 🚨 Problemas Comuns e Soluções

### 1. **Serviço não inicia**

**Sintomas:**
- Container para de funcionar
- Logs mostram erro de inicialização
- Health check falha

**Soluções:**
```bash
# 1. Verificar logs detalhados
docker logs <container_id>

# 2. Executar verificação manual
npm run check

# 3. Testar localmente
npm start
```

### 2. **Erro de Dependências**

**Sintomas:**
- `Cannot find module`
- `Module not found`

**Soluções:**
```bash
# 1. Limpar cache
npm cache clean --force

# 2. Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# 3. Verificar package.json
npm run check
```

### 3. **Erro de Conexão com Banco**

**Sintomas:**
- `MongoNetworkError`
- `Connection timeout`

**Soluções:**
```bash
# 1. Verificar MONGODB_URI
echo $MONGODB_URI

# 2. Testar conexão
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(e => console.log('ERRO:', e.message))"
```

### 4. **Erro de Porta**

**Sintomas:**
- `EADDRINUSE`
- `Port already in use`

**Soluções:**
```bash
# 1. Verificar porta
netstat -tulpn | grep :3000

# 2. Mudar porta no EasyPanel
# Definir PORT=3003 no ambiente
```

---

## 📋 Checklist de Deploy

### ✅ **Antes do Deploy**
- [ ] `npm run check` passa sem erros
- [ ] Todos os arquivos críticos existem
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas

### ✅ **Durante o Deploy**
- [ ] Logs mostram inicialização correta
- [ ] Health check passa
- [ ] Endpoints respondem

### ✅ **Após o Deploy**
- [ ] `/health` retorna 200
- [ ] `/api-docs` acessível
- [ ] `/dashboard` carrega
- [ ] Autenticação funciona

---

## 🔍 Logs Detalhados

### **Logs de Inicialização Esperados:**
```
🚀 ==========================================
🚀 INICIANDO WEBHOOK GONNECT CRM
🚀 ==========================================
📦 Versão: 1.5.0
🌍 Ambiente: production
🔧 Porta: 3000
📅 Data/Hora: 2025-01-04T10:30:00.000Z
==========================================

🔍 Verificando variáveis de ambiente...
   • NODE_ENV: production
   • PORT: 3000
   • EXTERNAL_BASE_URL: não definido
   • MONGODB_URI: definido

📦 Verificando dependências...
   ✅ Todas as dependências carregadas com sucesso

🗄️  Conectando ao banco de dados...
   ✅ Conexão com banco de dados estabelecida

📝 Configurando sistema de logs...
   ✅ Sistema de logs configurado

📁 Verificando arquivos críticos...
   ✅ public/dashboard/index.html
   ✅ middleware/auth.js
   ✅ routes/auth.js
   ✅ models/AdminUser.js

👑 Verificando usuário administrador...
   ✅ Usuário admin verificado/criado

🌐 Criando servidor HTTP...
⚡ Inicializando sistema realtime...
   ✅ Sistema realtime inicializado

🎯 Iniciando servidor na porta 3000
🎉 ==========================================
🎉 SERVIDOR INICIADO COM SUCESSO!
🎉 ==========================================
🌐 URL Local: http://localhost:3000
🔗 Webhook: http://localhost:3000/webhook
📊 Dashboard: http://localhost:3000/dashboard
📚 Swagger: http://localhost:3000/api-docs
==========================================
```

### **Logs de Erro Comuns:**

**1. Erro de Dependência:**
```
❌ Erro ao carregar dependência: Cannot find module 'express'
```
**Solução:** `npm install`

**2. Erro de Arquivo:**
```
❌ middleware/auth.js - NÃO ENCONTRADO
```
**Solução:** Verificar se todos os arquivos foram copiados

**3. Erro de Banco:**
```
❌ Erro ao conectar banco: MongoNetworkError
```
**Solução:** Verificar MONGODB_URI

---

## 🛠️ Comandos de Debug

### **Verificar Status:**
```bash
# Health check
curl http://localhost:3000/health

# Verificar logs
docker logs <container_id> --tail 50

# Entrar no container
docker exec -it <container_id> sh
```

### **Testar Endpoints:**
```bash
# Health
curl -i http://localhost:3000/health

# Swagger
curl -i http://localhost:3000/api-docs

# Dashboard
curl -i http://localhost:3000/dashboard

# Login
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📞 Suporte

### **Se o problema persistir:**

1. **Coletar logs completos:**
```bash
docker logs <container_id> > logs.txt
```

2. **Verificar configuração do EasyPanel:**
- Variáveis de ambiente
- Porta configurada
- Recursos alocados

3. **Testar localmente:**
```bash
npm run check
npm start
```

4. **Verificar arquivos críticos:**
```bash
ls -la
ls -la middleware/
ls -la routes/
ls -la models/
```

---

## 🎯 **Solução Rápida**

Se o serviço não subir:

1. **Reiniciar com logs detalhados:**
```bash
# No EasyPanel, definir variável de ambiente:
DEBUG=true
```

2. **Verificar se todos os arquivos estão presentes**
3. **Executar verificação manual**
4. **Testar conexão com banco**

**A API está configurada com logs detalhados para facilitar o debug!** 🔍 