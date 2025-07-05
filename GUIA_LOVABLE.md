# 🚀 Guia de Integração - API CRM WhatsApp

## 📋 Informações da API

**URL Base:** `http://109.199.117.251:3003`  
**Documentação Swagger:** `http://109.199.117.251:3003/api-docs`  
**Dashboard Técnico:** `http://109.199.117.251:3003/dashboard`

---

## 🔐 Autenticação JWT

### 1. Login para obter token
```javascript
// Exemplo de login
const loginResponse = await fetch('http://109.199.117.251:3003/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token; // Guarde este token!
```

### 2. Usar token em requisições
```javascript
// Exemplo de requisição autenticada
const response = await fetch('http://109.199.117.251:3003/contacts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📡 Endpoints Principais

### 🔓 Endpoints Públicos (sem autenticação)
- `GET /health` - Status da API
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário logado
- `POST /webhook` - Webhook do WhatsApp
- `GET /dashboard` - Dashboard técnico

### 🔒 Endpoints Protegidos (requer JWT)
- `GET /contacts` - Lista de contatos
- `GET /tickets` - Lista de tickets
- `GET /messages` - Lista de mensagens
- `GET /tags` - Lista de tags
- `GET /stats` - Estatísticas

---

## 💻 Exemplos Práticos

### 1. Função de Login
```javascript
async function login(username, password) {
  try {
    const response = await fetch('http://109.199.117.251:3003/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('jwt_token', data.token);
      return data.token;
    } else {
      throw new Error(data.error || 'Erro no login');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}
```

### 2. Função para Buscar Contatos
```javascript
async function getContacts() {
  const token = localStorage.getItem('jwt_token');
  
  if (!token) {
    throw new Error('Token não encontrado. Faça login primeiro.');
  }

  try {
    const response = await fetch('http://109.199.117.251:3003/contacts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data; // Array de contatos
    } else {
      throw new Error(data.error || 'Erro ao buscar contatos');
    }
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    throw error;
  }
}
```

### 3. Função para Buscar Estatísticas
```javascript
async function getStats() {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch('http://109.199.117.251:3003/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data.data; // Estatísticas do CRM
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
}
```

---

## 🔄 Fluxo de Integração Completo

### 1. Inicialização da Aplicação
```javascript
// Ao carregar a aplicação
async function initializeApp() {
  try {
    // Verificar se já tem token
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
      // Validar token
      const userData = await fetch('http://109.199.117.251:3003/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userData.ok) {
        // Token válido, carregar dados
        await loadDashboardData();
      } else {
        // Token inválido, fazer login
        showLoginForm();
      }
    } else {
      // Sem token, mostrar login
      showLoginForm();
    }
  } catch (error) {
    console.error('Erro na inicialização:', error);
    showLoginForm();
  }
}
```

### 2. Carregar Dados do Dashboard
```javascript
async function loadDashboardData() {
  try {
    // Carregar dados em paralelo
    const [contacts, tickets, stats] = await Promise.all([
      getContacts(),
      getTickets(),
      getStats()
    ]);

    // Atualizar interface
    updateContactsList(contacts);
    updateTicketsList(tickets);
    updateStatsDisplay(stats);
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showErrorMessage('Erro ao carregar dados do CRM');
  }
}
```

---

## 🛠️ Estrutura de Dados

### Contato
```javascript
{
  "_id": "6867f4c0276433a6f8ed0aa5",
  "whatsappId": "5511999999999",
  "name": "João Silva",
  "crmData": {
    "leadStatus": "novo",
    "leadScore": 0,
    "lastInteraction": "2025-07-04T19:15:00.149Z",
    "source": "whaticket",
    "notes": [],
    "customTags": []
  }
}
```

### Ticket
```javascript
{
  "_id": "ticket_id",
  "contactId": "contact_id",
  "status": "open",
  "subject": "Dúvida sobre produto",
  "createdAt": "2025-07-04T19:15:00.149Z",
  "updatedAt": "2025-07-04T19:15:00.149Z"
}
```

### Estatísticas
```javascript
{
  "totalContacts": 150,
  "totalTickets": 45,
  "openTickets": 12,
  "closedTickets": 33,
  "messagesToday": 25,
  "newLeads": 8
}
```

---

## ⚠️ Tratamento de Erros

### 1. Token Expirado
```javascript
// Interceptar erro 401
if (response.status === 401) {
  localStorage.removeItem('jwt_token');
  showLoginForm();
  return;
}
```

### 2. Erro de Rede
```javascript
try {
  const response = await fetch(url, options);
  // ... processar resposta
} catch (error) {
  if (error.name === 'TypeError') {
    showErrorMessage('Erro de conexão. Verifique sua internet.');
  } else {
    showErrorMessage('Erro inesperado. Tente novamente.');
  }
}
```

---

## 🔧 Troubleshooting

### Problema: "Failed to fetch"
**Solução:** A API está configurada com CORS liberado. Verifique:
- URL correta: `http://109.199.117.251:3003`
- Método HTTP correto (GET, POST, etc.)
- Headers corretos

### Problema: "Token inválido"
**Solução:** 
- Faça login novamente
- Verifique se o token não expirou (validade: 12 horas)
- Limpe localStorage e faça novo login

### Problema: "Token ausente"
**Solução:** 
- Adicione header `Authorization: Bearer <token>`
- Verifique se o token está sendo enviado corretamente

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o dashboard técnico: `http://109.199.117.251:3003/dashboard`
2. Teste no Swagger: `http://109.199.117.251:3003/api-docs`
3. Verifique logs do console do navegador
4. Teste endpoints individualmente

---

## 🚀 Próximos Passos

1. **Implementar login** na interface
2. **Criar dashboard** com dados do CRM
3. **Implementar listas** de contatos e tickets
4. **Adicionar filtros** e busca
5. **Implementar ações** (responder, criar ticket, etc.)

**API está 100% funcional e pronta para uso!** 🎉 