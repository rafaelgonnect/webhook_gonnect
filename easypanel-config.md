# 🔧 Configuração EasyPanel - Webhook Gonnect CRM

## 📋 Pré-requisitos

- [ ] Conta no EasyPanel ativa
- [ ] Domínio configurado (ex: api.gonnect.com.br)
- [ ] Acesso SSH ao servidor (se necessário)
- [ ] Repositório Git com o código

## 🚀 Passo a Passo - Deploy no EasyPanel

### 1. Acesso ao EasyPanel

1. Acesse o painel do EasyPanel
2. Faça login com suas credenciais
3. Navegue para a seção "Applications" ou "Apps"

### 2. Criar Novo Aplicativo

1. Clique em "New Application" ou "Criar Aplicativo"
2. Selecione "From Git Repository"
3. Configure as seguintes informações:

```
Nome: webhook-gonnect-crm
Descrição: Sistema webhook CRM para integração com Whaticket
Framework: Node.js
Branch: main (ou master)
```

### 3. Configurar Repositório Git

```
URL do Repositório: https://github.com/seu-usuario/webhook_gonnect.git
Branch: main
```

### 4. Configurações de Build

```
Build Command: npm ci --only=production
Start Command: npm start
Port: 3000
```

### 5. Variáveis de Ambiente

Configure as seguintes variáveis:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false&authSource=admin
```

### 6. Configurações de Rede

1. **Domínio**: Configure seu domínio (ex: api.gonnect.com.br)
2. **SSL**: Ative o certificado SSL automático
3. **Proxy**: Configure para redirecionar para porta 3000

### 7. Configurações de Recursos

```
CPU: 0.5 cores
RAM: 512MB
Storage: 1GB
```

### 8. Health Check

```
Path: /health
Interval: 30s
Timeout: 10s
Retries: 3
```

### 9. Volumes (se necessário)

```
Source: ./Logs
Target: /app/Logs
```

## 🔍 Verificação Pós-Deploy

### 1. Verificar Logs

Após o deploy, verifique os logs para garantir que:
- A aplicação iniciou corretamente
- A conexão com MongoDB foi estabelecida
- Não há erros críticos

### 2. Testar Endpoints

```bash
# Health Check
curl -X GET https://api.gonnect.com.br/health

# Endpoint Principal
curl -X GET https://api.gonnect.com.br/

# Documentação
curl -X GET https://api.gonnect.com.br/api-docs

# Teste do Webhook
curl -X POST https://api.gonnect.com.br/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "payload"}'
```

### 3. Verificar SSL

Certifique-se de que o SSL está funcionando:
- Acesse https://api.gonnect.com.br
- Verifique se não há avisos de segurança

## 📊 Monitoramento

### 1. Configurar Alertas

No EasyPanel, configure alertas para:
- Falha na aplicação
- Alto uso de CPU/Memória
- Erros de conexão com banco

### 2. Logs Estruturados

A aplicação já possui sistema de logs estruturados em `/app/Logs/`

### 3. Métricas

Monitore:
- Uptime da aplicação
- Tempo de resposta
- Uso de recursos
- Conexões com banco

## 🔒 Segurança

### 1. Configurações de Segurança

- [ ] HTTPS ativo
- [ ] Headers de segurança configurados
- [ ] Rate limiting (se necessário)
- [ ] Firewall configurado

### 2. Backup

Configure backup automático:
- Banco de dados MongoDB
- Logs da aplicação
- Configurações

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

### Comandos Úteis

```bash
# Ver logs em tempo real
easypanel logs webhook-gonnect-crm -f

# Reiniciar aplicação
easypanel restart webhook-gonnect-crm

# Ver status
easypanel status webhook-gonnect-crm

# Acessar shell do container
easypanel exec webhook-gonnect-crm bash
```

## 📞 Suporte

Para problemas específicos do EasyPanel:
- Documentação oficial: https://easypanel.io/docs
- Comunidade: https://github.com/easypanelio/easypanel
- Suporte técnico: [email do suporte]

---

**Última atualização**: $(date)
**Versão**: 1.0.0 