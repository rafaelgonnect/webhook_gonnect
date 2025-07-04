# Gonnect CRM Dashboard

## Acesso
1. Abra `/dashboard` no navegador.
2. Caso não esteja logado, insira usuário e senha admin (veja variáveis `ADMIN_USER` / `ADMIN_PASS` ou usuário criado).
3. Após login um token JWT é gravado em `localStorage` e usado nos requests.

## Métricas disponíveis
- Tickets por status (gráfico doughnut)
- Tickets criados por dia (últimos 7 dias, linha)

Endpoints:
- `GET /dashboard-api/metrics` — protegido por JWT.

## Como adicionar novo admin
```bash
npm run seed:admin -- --username=novo --password=senha
```

## Deploy front-end
Arquivos estáticos em `public/dashboard`. Qualquer alteração em `index.html` ou `app.js` exige rebuild do container. 