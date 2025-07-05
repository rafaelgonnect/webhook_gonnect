# 🚀 Configuração EasyPanel - Porta 3003

## 🔧 Variáveis de Ambiente

Configure as seguintes variáveis no EasyPanel:

```bash
NODE_ENV=production
PORT=3003
EXTERNAL_BASE_URL=http://109.199.117.251:3003
```

## 📡 Endpoints Corretos

Com a porta 3003 configurada, os endpoints serão:

- **API Base:** `http://109.199.117.251:3003`
- **Health Check:** `http://109.199.117.251:3003/health`
- **Ready Check:** `http://109.199.117.251:3003/ready`
- **Swagger:** `http://109.199.117.251:3003/api-docs`
- **Dashboard:** `http://109.199.117.251:3003/dashboard`
- **Webhook:** `http://109.199.117.251:3003/webhook`

## 🐳 Docker

O Dockerfile está configurado para:
- **EXPOSE 3003** - Porta correta
- **Health Check na porta 3003**
- **Proteção contra SIGTERM prematuro**

## 🛡️ Proteção SIGTERM

O servidor agora tem proteção contra SIGTERM nos primeiros 20 segundos:
- Ignora SIGTERM durante inicialização
- Permite estabilização completa
- Evita quedas prematuras do EasyPanel

## ✅ Logs Esperados

```
🚀 Iniciando servidor para EasyPanel...
📦 Node.js: v18.x.x
🌍 NODE_ENV: production
🔧 PORT: 3003
🎯 Carregando servidor principal...
🚀 INICIANDO WEBHOOK GONNECT CRM
📦 Versão: 1.5.0
🌍 Ambiente: production
🔧 Porta: 3003
🎉 SERVIDOR INICIADO COM SUCESSO!
🌐 URL Local: http://localhost:3003
🛡️ Proteção SIGTERM desativada - servidor estabilizado
```

## 🔍 Troubleshooting

Se o servidor ainda cair:

1. **Verificar porta no EasyPanel:**
   - Deve estar mapeada para 3003
   
2. **Verificar health check:**
   - Deve acessar porta 3003
   
3. **Verificar logs:**
   - Deve mostrar "PORT: 3003"
   
4. **Testar manualmente:**
   ```bash
   curl http://localhost:3003/health
   ``` 