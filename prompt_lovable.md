# Prompt para Lovable: Front-end do CRM Gonnect

## Objetivo
Desenvolver o front-end do CRM Gonnect, integrando autenticação JWT, gestão de contatos, tickets, mensagens (WhatsApp), tags, estatísticas e pipeline de vendas. O sistema já possui API REST documentada via Swagger.

## Instruções Gerais
- O front-end deve ser moderno, responsivo e fácil de usar.
- Use React (ou framework de sua preferência) e siga boas práticas de UX.
- Toda comunicação com a API deve ser autenticada via JWT (exceto login).
- Utilize o Swagger em [http://109.199.117.251:3003/api-docs](http://109.199.117.251:3003/api-docs) para referência dos endpoints.
- Se precisar de um novo endpoint ou ajuste, solicite à equipe backend.

## Funcionalidades Principais

### 1. Autenticação
- Tela de login (usuário/senha) → POST `/auth/login` (retorna JWT)
- Guardar token JWT no front-end (localStorage ou cookie seguro)
- Todas as requisições subsequentes devem enviar `Authorization: Bearer <token>`
- Tela de perfil: GET `/auth/me` (dados do usuário autenticado)

### 2. Gestão de Contatos
- Listar contatos: GET `/contacts`
- Visualizar detalhes: GET `/contacts/{id}`
- Criar/editar contato: POST `/contacts`, PUT `/contacts/{id}`
- Buscar, filtrar, paginação

### 3. Tickets (Atendimentos)
- Listar tickets: GET `/tickets`
- Detalhar ticket: GET `/tickets/{id}` (inclui mensagens)
- Alterar status: PUT `/tickets/{id}/status`
- Enviar mensagem manual: POST `/tickets/{id}/message`
- Enviar mídia manual: POST `/tickets/{id}/media`
- Gerenciar tags: POST `/tickets/{id}/tags`

### 4. Mensagens (WhatsApp)
- Listar mensagens: GET `/messages` (filtros por ticket, contato, data)
- Exibir histórico de conversas por ticket/contato
- Interface para envio manual de mensagens e mídias

### 5. Tags
- Listar tags: GET `/tags`
- Gerenciar tags de tickets

### 6. Estatísticas e Dashboard
- Painel com métricas: GET `/stats` e `/dashboard-api/metrics`
- Gráficos de tickets por status, volume diário, tempo médio de resposta
- Feed de atividades: GET `/dashboard/activity`

### 7. Pipeline de Vendas (Kanban)
- Visualização Kanban dos tickets por etapa/status
- Arrastar e soltar tickets entre etapas
- Atualizar status do ticket ao mover

### 8. Integração WhatsApp
- Exibir conversas em tempo real (WebSocket ou polling)
- Interface de chat semelhante ao WhatsApp Web
- Indicar mensagens enviadas/recebidas, status de entrega

### 9. Outros
- Logout (remover JWT)
- Tratamento de erros e feedbacks claros ao usuário
- Loading states e UX amigável

## Observações
- A API está protegida por JWT. Sempre faça login antes de consumir os endpoints.
- O Swagger está sempre atualizado: [http://109.199.117.251:3003/api-docs](http://109.199.117.251:3003/api-docs)
- Se precisar de endpoints adicionais, ajuste de payloads ou qualquer integração, solicite à equipe backend.
- O backend já está preparado para WebSocket (real-time) e pipeline de vendas.

## Exemplo de Fluxo de Autenticação
```http
POST /auth/login
Content-Type: application/json
{
  "username": "admin",
  "password": "SENHA"
}

// Resposta:
{
  "success": true,
  "token": "<JWT>"
}

// Usar o token nas próximas requisições:
GET /contacts
Authorization: Bearer <JWT>
```

---

**IMPORTANTE:**
Sempre que precisar de um novo endpoint, ajuste de dados ou integração, comunique a equipe backend para evoluirmos juntos! 