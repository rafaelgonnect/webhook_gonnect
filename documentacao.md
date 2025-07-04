# Documentação API Webhook Gonnect CRM

## Visão Geral

O **Gonnect CRM Webhook** é um sistema completo de processamento de webhooks integrado ao Whaticket para gestão de leads, contatos e atendimento. O sistema recebe payloads do Whaticket e os processa em um banco de dados MongoDB estruturado para CRM.

### Funcionalidades Principais

- 📞 **Processamento de Mensagens**: Recebe e processa mensagens do WhatsApp via Whaticket
- 👤 **Gestão de Contatos**: Criação e atualização automática de contatos
- 🎫 **Sistema de Tickets**: Gestão completa de tickets de atendimento
- 🏷️ **Categorização por Tags**: Processamento automático e manual de tags
- 📊 **Analytics e Relatórios**: Métricas e análises de atendimento
- 📝 **Sistema de Logs**: Logs estruturados para análise e debugging
- 🚀 **API REST**: Endpoints para consulta e gestão de dados

---

## Configuração e Instalação

### Pré-requisitos

- Node.js 16+ 
- MongoDB 4.4+
- NPM ou Yarn

### Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd webhook-gonnect-crm

# Instalar dependências
npm install

# Configurar variáveis de ambiente (ver seção Configuração)

# Iniciar o servidor
npm start

# Para desenvolvimento com auto-reload
npm run dev
```

### Configuração

O sistema utiliza as seguintes configurações (podem ser definidas via variáveis de ambiente):

```bash
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://mongo:L3afarodnil@109.199.117.251:27017/webhook_gonnect?tls=false

# Logs
LOG_LEVEL=info
LOG_DIRECTORY=./Logs

# Segurança
API_SECRET=webhook_gonnect_secret_2024

# Webhook
WEBHOOK_TIMEOUT=30000
```

---

## Estrutura da API

### Base URL
```
http://localhost:3000
```

### Autenticação
O sistema atualmente não requer autenticação, mas recomenda-se implementar tokens para produção.

---

## Endpoints Principais

### 1. Informações da API

**GET /** 
```
GET /
```

**Resposta:**
```json
{
  "success": true,
  "service": "Gonnect CRM Webhook API",
  "version": "1.0.0",
  "description": "Sistema webhook para integração com Whaticket e CRM",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "endpoints": {
    "webhook": "POST /webhook",
    "test": "GET /webhook/test",
    "health": "GET /webhook/health",
    "stats": "GET /webhook/stats"
  },
  "features": [
    "Processamento de mensagens do Whaticket",
    "Gestão de contatos e leads",
    "Sistema de tickets e atendimento",
    "Análise de tags e categorização",
    "Logs estruturados para análise",
    "Métricas e estatísticas em tempo real"
  ]
}
```

### 2. Webhook Principal

**POST /webhook**

Endpoint principal para receber payloads do Whaticket.

**Headers:**
```
Content-Type: application/json
```

**Body (Exemplo - Mensagem):**
```json
{
  "filaescolhida": "geral",
  "filaescolhidaid": 1,
  "mensagem": "Olá, preciso de ajuda",
  "sender": "5511989091838",
  "chamadoid": 357,
  "acao": "start",
  "name": "João Silva",
  "companyid": 1,
  "defaultwhatsappid": 2,
  "fromme": false,
  "queueid": 1,
  "isgroup": false,
  "ticketdata": {
    "id": 357,
    "status": "pending",
    "unreadmessages": 1,
    "lastmessage": "Olá, preciso de ajuda",
    "isgroup": false,
    "userid": null,
    "contactid": 4192,
    "whatsappid": 2,
    "queueid": 1,
    "chatbot": false,
    "channel": "whatsapp",
    "queueoptionid": null,
    "companyid": 1,
    "uuid": "cabd8ddd-f5e1-43ab-8661-7b0385ca4e1b",
    "createdat": "2023-08-30T02:27:15.376Z",
    "updatedat": "2023-10-12T14:07:44.618Z",
    "contact": {
      "id": 4192,
      "name": "João Silva",
      "number": "5511989091838",
      "email": "joao@email.com",
      "profilepicurl": "https://example.com/profile.jpg",
      "acceptaudiomessage": true,
      "active": true,
      "disablebot": false,
      "extrainfo": []
    },
    "queue": {
      "id": 1,
      "name": "geral",
      "color": "#008b02"
    },
    "whatsapp": {
      "name": "suporte",
      "webhook": "https://webhook.example.com/",
      "id": 2
    },
    "company": {
      "name": "Empresa Exemplo"
    }
  }
}
```

**Resposta (Sucesso):**
```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  "data": {
    "action": "start",
    "processed": "message",
    "logFile": "2024-01-15_start_103045-123.json",
    "processingTime": "150ms"
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

**Resposta (Erro):**
```json
{
  "success": false,
  "error": "Payload inválido",
  "message": "Corpo da requisição deve ser um objeto JSON válido",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### 3. Teste do Webhook

**GET /webhook/test**

Verifica se o endpoint webhook está funcionando.

**Resposta:**
```json
{
  "success": true,
  "message": "Webhook endpoint funcionando",
  "service": "Gonnect CRM Webhook",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "supportedActions": [
    "start",
    "message",
    "tag_sync",
    "status_change",
    "file"
  ],
  "endpoints": {
    "webhook": "POST /webhook",
    "test": "GET /webhook/test",
    "health": "GET /webhook/health"
  }
}
```

### 4. Health Check

**GET /webhook/health**

Verifica a saúde do sistema e suas dependências.

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 45678592,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1835008
  },
  "database": {
    "status": "connected",
    "host": "configured"
  },
  "logging": {
    "directory": "exists",
    "path": "./Logs"
  },
  "version": "1.0.0"
}
```

### 5. Estatísticas

**GET /webhook/stats**

Retorna estatísticas de uso do sistema.

**Resposta:**
```json
{
  "totals": {
    "contacts": 1523,
    "tickets": 2847,
    "messages": 15632
  },
  "last7Days": {
    "contacts": 89,
    "tickets": 156,
    "messages": 892
  },
  "analysis": {
    "date": "2024-01-15",
    "totalEvents": 45,
    "eventTypes": {
      "message": 32,
      "start": 8,
      "tag_sync": 3,
      "file": 2
    },
    "hourlyDistribution": {
      "09": 8,
      "10": 12,
      "11": 15,
      "12": 10
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Health Check Global

**GET /health**

Health check simplificado do sistema.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 15,
    "total": 20,
    "unit": "MB"
  },
  "database": {
    "status": "connected",
    "readyState": 1
  },
  "version": "1.0.0",
  "environment": "development"
}
```

---

## Tipos de Payloads Suportados

### 1. Mensagens (action: "start" ou "message")

Processamento de mensagens recebidas ou enviadas.

**Campos obrigatórios:**
- `sender`: Número do remetente
- `mensagem`: Conteúdo da mensagem
- `ticketdata`: Dados do ticket

### 2. Sincronização de Tags (action: "tag sync")

Processamento de aplicação/remoção de tags.

**Estrutura:**
```json
{
  "action": "tag sync",
  "tags": {
    "ticketid": 383,
    "tags": [
      {
        "id": 27,
        "name": "nome da tag",
        "color": "#dd821a",
        "kanban": 1,
        "prioridade": 0,
        "conversao": "quote",
        "companyid": 1
      }
    ]
  },
  "contact": {
    "id": 4300,
    "name": "nome do cliente",
    "number": "5511989091838"
  }
}
```

### 3. Arquivos (acao: "fila data" com mediafolder)

Processamento de arquivos enviados.

**Campos específicos:**
- `mediafolder`: Pasta do arquivo
- `medianame`: Nome do arquivo
- `backendurl`: URL do backend

### 4. Mudança de Status (acao: "open" ou "closed")

Processamento de mudanças no status do ticket.

---

## Estrutura do Banco de Dados

### Collections

#### 1. contacts
Armazena informações dos contatos.

**Campos principais:**
- `whaticketId`: ID original do Whaticket
- `name`: Nome do contato
- `number`: Número do WhatsApp
- `email`: Email (opcional)
- `crmData`: Dados específicos do CRM (lead status, score, etc.)

#### 2. tickets
Armazena informações dos tickets de atendimento.

**Campos principais:**
- `whaticketId`: ID original do Whaticket
- `uuid`: UUID único do ticket
- `status`: Status atual (pending, open, closed)
- `contactId`: ID do contato
- `crmData`: Dados de SLA, prioridade, categoria

#### 3. messages
Armazena todas as mensagens trocadas.

**Campos principais:**
- `sender`: Remetente da mensagem
- `ticketId`: ID do ticket
- `content`: Conteúdo da mensagem
- `action`: Tipo de ação
- `crmData`: Análise de sentimento, intenção, palavras-chave

#### 4. tags
Armazena informações das tags.

**Campos principais:**
- `whaticketId`: ID original do Whaticket
- `name`: Nome da tag
- `color`: Cor da tag
- `crmData`: Regras automáticas, estatísticas de uso

#### 5. tag_events
Histórico de aplicação de tags.

---

## Sistema de Logs

### Estrutura de Diretórios

```
Logs/
├── raw-payloads/     # Payloads brutos recebidos
├── processed/        # Dados após processamento
├── errors/          # Logs de erro
└── analysis-report-YYYY-MM-DD.json  # Relatórios de análise
```

### Formato dos Logs

#### Payload Bruto
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "action": "message",
  "payload": { /* payload original */ },
  "metadata": {
    "source": "whaticket-webhook",
    "version": "1.0.0",
    "receivedAt": "2024-01-15T10:30:45.123Z"
  }
}
```

#### Dados Processados
```json
{
  "timestamp": "2024-01-15T10:30:45.456Z",
  "action": "message",
  "originalFile": "2024-01-15_message_103045-123.json",
  "processedData": { /* dados processados */ },
  "processingInfo": {
    "processedAt": "2024-01-15T10:30:45.456Z",
    "success": true
  }
}
```

#### Log de Erro
```json
{
  "timestamp": "2024-01-15T10:30:45.789Z",
  "action": "message",
  "error": {
    "message": "Dados de contato não encontrados",
    "stack": "Error: ...",
    "name": "ValidationError"
  },
  "payload": { /* payload que causou erro */ },
  "errorInfo": {
    "occurredAt": "2024-01-15T10:30:45.789Z",
    "severity": "high"
  }
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Payload inválido ou malformado |
| 404 | Endpoint não encontrado |
| 413 | Payload muito grande |
| 500 | Erro interno do servidor |

---

## Monitoramento e Métricas

### Métricas Disponíveis

- **Contatos**: Total e novos por período
- **Tickets**: Total, ativos, fechados por período  
- **Mensagens**: Total, por tipo, tempo de resposta
- **Tags**: Aplicações, mais usadas
- **Performance**: Tempo de processamento, uptime, memória

### Alertas Recomendados

- Taxa de erro > 5%
- Tempo de resposta > 5 segundos
- Uso de memória > 80%
- Disco de logs > 90%

---

## Desenvolvimento e Customização

### Adicionando Novos Tipos de Webhook

1. Adicionar nova ação em `webhookProcessor.supportedActions`
2. Implementar lógica em `webhookProcessor.processWebhook()`
3. Criar método específico de processamento
4. Atualizar documentação

### Integrações Externas

O sistema é preparado para integrações com:
- APIs de CRM externos
- Sistemas de email marketing
- Ferramentas de analytics
- Sistemas de notificação

### Personalização do CRM

- **Lead Scoring**: Configurável via `crmData.leadScore`
- **Tags Automáticas**: Regras em `crmData.automaticRules`
- **SLA**: Configurável por prioridade
- **Categorização**: Intenções e sentimentos customizáveis

---

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão MongoDB
```bash
# Verificar conectividade
telnet 109.199.117.251 27017

# Verificar logs
tail -f Logs/errors/*.json
```

#### 2. Payload Rejeitado
- Verificar estrutura JSON
- Validar campos obrigatórios
- Checar tamanho do payload (máx 10MB)

#### 3. Performance Lenta
- Verificar índices do MongoDB
- Monitorar uso de memória
- Analisar logs de performance

### Logs de Debug

Para ativar logs detalhados:
```bash
NODE_ENV=development npm start
```

---

## Roadmap

### Versão 1.1
- [ ] Autenticação por token
- [ ] Rate limiting
- [ ] Webhooks de saída
- [ ] Dashboard web

### Versão 1.2
- [ ] Machine learning para lead scoring
- [ ] Integração com WhatsApp Business API
- [ ] Relatórios avançados
- [ ] Multi-tenancy

---

## Suporte

Para suporte técnico ou dúvidas:

- **Email**: suporte@gonnect.com
- **Documentação**: Esta documentação
- **Logs**: Verificar `/Logs/errors/` para detalhes de erros

---

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para detalhes.

---

*Documentação atualizada em: 15 de Janeiro de 2024*
*Versão da API: 1.0.0* 