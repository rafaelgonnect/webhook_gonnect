const axios = require('axios');

// Função para verificar configuração do Whaticket
function checkWhaticketConfig() {
  const BASE_URL = process.env.WHATICKET_BACKEND_URL;
  const TOKEN = process.env.WHATICKET_TOKEN;
  
  if (!BASE_URL || !TOKEN) {
    console.warn('⚠️ WHATICKET_BACKEND_URL ou WHATICKET_TOKEN não configurados - envio externo desabilitado');
    return { BASE_URL: null, TOKEN: null, enabled: false };
  }
  
  return { BASE_URL, TOKEN, enabled: true };
}

// Configuração inicial
const config = checkWhaticketConfig();

/**
 * Enviar mensagem de texto padrão (abre ou não ticket)
 * @param {Object} options
 * @param {string} options.number - Telefone em formato WhatsApp (ex: 5511999990000)
 * @param {string} options.body - Conteúdo da mensagem
 * @param {number} [options.openTicket=0] - 1 abre ticket, 0 não abre
 * @param {number} [options.queueId=0] - fila (se abrir ticket)
 * @returns {Promise<Object>} resposta da API Whaticket
 */
async function sendText({ number, body, openTicket = 0, queueId = 0 }) {
  if (!config.enabled) return { disabled: true };
  try {
    const resp = await axios.post(
      `${config.BASE_URL}/api/messages/send`,
      {
        number,
        body,
        openticket: openTicket,
        queueid: queueId
      },
      {
        headers: {
          Authorization: `Bearer ${config.TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    return resp.data;
  } catch (error) {
    console.error('Erro ao enviar texto via Whaticket:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Enviar texto simples (endpoint sendsimple)
 */
async function sendTextSimple({ number, body, cc = '55' }) {
  if (!config.enabled) return { disabled: true };
  try {
    const resp = await axios.post(
      `${config.BASE_URL}/api/messages/sendsimple?cc=${cc}`,
      { number, body },
      {
        headers: {
          Authorization: `Bearer ${config.TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    return resp.data;
  } catch (error) {
    console.error('Erro ao enviar texto simples Whaticket:', error.response?.data || error.message);
    throw error;
  }
}

async function sendMedia({ number, fileUrl, filename, caption = '', openTicket = 0, queueId = 0 }) {
  if (!config.enabled) return { disabled: true };
  try {
    const resp = await axios.post(
      `${config.BASE_URL}/api/messages/send-media`,
      { number, fileUrl, filename, caption, openticket: openTicket, queueid: queueId },
      {
        headers: {
          Authorization: `Bearer ${config.TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );
    return resp.data;
  } catch (error) {
    console.error('Erro ao enviar mídia Whaticket:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendText, sendTextSimple, sendMedia }; 