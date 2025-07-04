# Webhook Gonnect CRM

Sistema webhook para integração com Whaticket e gestão de CRM.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Desenvolvimento com auto-reload
npm run dev
```

## 📡 Endpoints

- **Webhook**: `POST http://localhost:3000/webhook`
- **Teste**: `GET http://localhost:3000/webhook/test`  
- **Health**: `GET http://localhost:3000/health`
- **Stats**: `GET http://localhost:3000/webhook/stats`

## 🗄️ Banco de Dados

**MongoDB**: `mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect`

## 📚 Documentação

Veja [documentacao.md](./documentacao.md) para documentação completa da API.

## 🏗️ Estrutura

```
webhook_gonnect/
├── config/          # Configurações de banco
├── models/          # Modelos Mongoose  
├── routes/          # Rotas da API
├── services/        # Lógica de negócio
├── utils/           # Utilitários
├── Logs/            # Logs estruturados
├── server.js        # Servidor principal
└── documentacao.md  # Documentação da API
```

## ✨ Funcionalidades

- ✅ Processamento de webhooks do Whaticket
- ✅ Gestão de contatos e leads
- ✅ Sistema de tickets
- ✅ Categorização por tags
- ✅ Logs estruturados
- ✅ Métricas e analytics
- ✅ API REST completa

## 🔧 Configuração

O sistema usa as credenciais MongoDB fornecidas e está pronto para receber webhooks do Whaticket.

---

*Desenvolvido para Gonnect CRM - v1.0.0* 