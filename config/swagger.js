const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gonnect CRM Webhook API',
      version: '1.2.0',
      description: 'Sistema webhook para integração com Whaticket e gestão de CRM',
      contact: {
        name: 'Gonnect CRM',
        email: 'suporte@gonnect.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operação realizada com sucesso' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Tipo do erro' },
            message: { type: 'string', example: 'Descrição do erro' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        WebhookPayload: {
          type: 'object',
          properties: {
            sender: { type: 'string', example: '5511989091838' },
            mensagem: { type: 'string', example: 'Olá, preciso de ajuda' },
            acao: { type: 'string', example: 'start' },
            ticketdata: { type: 'object' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
  customSiteTitle: 'Gonnect CRM API Docs',
  swaggerOptions: {
    docExpansion: 'none',
    filter: true
  }
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions
};
