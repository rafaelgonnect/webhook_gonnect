const Contact = require('../models/Contact');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const { Tag, TagEvent } = require('../models/Tag');
const { logger } = require('../utils/logger');

/**
 * Serviço de processamento de webhooks do Whaticket
 */
class WebhookProcessor {
  constructor() {
    this.supportedActions = ['start', 'message', 'tag_sync', 'status_change', 'file'];
  }

  /**
   * Processa payload do webhook
   * @param {Object} payload - Payload recebido do webhook
   * @returns {Object} Resultado do processamento
   */
  async processWebhook(payload) {
    try {
      // Determinar tipo de ação baseado no payload
      const action = this.determineAction(payload);
      
      if (!this.supportedActions.includes(action)) {
        throw new Error(`Ação não suportada: ${action}`);
      }

      console.log(`🔄 Processando webhook - Ação: ${action}`);

      // Salvar payload bruto nos logs
      const logFileName = await logger.saveRawPayload(payload, action);

      let result;
      
      // Processar baseado no tipo de ação
      switch (action) {
        case 'start':
        case 'message':
          result = await this.processMessage(payload, action);
          break;
        case 'tag_sync':
          result = await this.processTagSync(payload);
          break;
        case 'status_change':
          result = await this.processStatusChange(payload);
          break;
        case 'file':
          result = await this.processFileMessage(payload);
          break;
        default:
          throw new Error(`Handler não implementado para ação: ${action}`);
      }

      // Salvar dados processados nos logs
      await logger.saveProcessedData(result, action, logFileName);

      return {
        success: true,
        action: action,
        result: result,
        logFile: logFileName
      };

    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      
      // Salvar erro nos logs
      await logger.saveError(error, payload, this.determineAction(payload));
      
      throw error;
    }
  }

  /**
   * Determina o tipo de ação baseado no payload
   * @param {Object} payload - Payload do webhook
   * @returns {string} Tipo de ação
   */
  determineAction(payload) {
    if (payload.action === 'tag sync') {
      return 'tag_sync';
    }
    
    if (payload.acao) {
      const acao = payload.acao.toLowerCase();
      
      if (acao === 'start') return 'start';
      if (acao === 'open' || acao === 'closed') return 'status_change';
      if (acao === 'fila data' && payload.mediafolder) return 'file';
      
      return 'message';
    }
    
    // Fallback para mensagens simples
    if (payload.mensagem || payload.sender) {
      return 'message';
    }
    
    return 'unknown';
  }

  /**
   * Processa mensagens normais e de início de conversa
   * @param {Object} payload - Payload da mensagem
   * @param {string} action - Tipo de ação (start ou message)
   */
  async processMessage(payload, action) {
    try {
      // Processar/criar contato
      const contact = await this.upsertContact(payload);
      
      // Processar/criar ticket
      const ticket = await this.upsertTicket(payload, contact);
      
      // Criar mensagem
      const message = await this.createMessage(payload, action, ticket);
      
      // Processar tags automáticas se existirem
      await this.processAutomaticTags(payload, ticket, message);
      
      return {
        contact: contact._id,
        ticket: ticket._id,
        message: message._id,
        processed: 'message'
      };
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      throw error;
    }
  }

  /**
   * Processa sincronização de tags
   * @param {Object} payload - Payload de tags
   */
  async processTagSync(payload) {
    try {
      const { tags, contact } = payload;
      
      // Atualizar/criar contato
      const contactDoc = await this.upsertContactFromTagEvent(contact);
      
      // Processar tags
      const tagResults = [];
      
      if (tags && tags.tags) {
        for (const tagData of tags.tags) {
          const tag = await this.upsertTag(tagData);
          tagResults.push(tag._id);
        }
      }
      
      // Criar evento de tag
      const tagEvent = await this.createTagEvent(payload);
      
      return {
        contact: contactDoc._id,
        tags: tagResults,
        event: tagEvent._id,
        processed: 'tag_sync'
      };
    } catch (error) {
      console.error('Erro ao processar sincronização de tags:', error);
      throw error;
    }
  }

  /**
   * Processa mudanças de status do ticket
   * @param {Object} payload - Payload de mudança de status
   */
  async processStatusChange(payload) {
    try {
      const ticket = await this.updateTicketStatus(payload);
      
      // Criar mensagem de log da mudança de status
      const statusMessage = await this.createStatusMessage(payload, ticket);
      
      return {
        ticket: ticket._id,
        message: statusMessage._id,
        newStatus: payload.acao,
        processed: 'status_change'
      };
    } catch (error) {
      console.error('Erro ao processar mudança de status:', error);
      throw error;
    }
  }

  /**
   * Processa mensagens com arquivos
   * @param {Object} payload - Payload de arquivo
   */
  async processFileMessage(payload) {
    try {
      // Processar contato e ticket como uma mensagem normal
      const contact = await this.upsertContact(payload);
      const ticket = await this.upsertTicket(payload, contact);
      
      // Criar mensagem com dados de mídia
      const message = await this.createFileMessage(payload, ticket);
      
      return {
        contact: contact._id,
        ticket: ticket._id,
        message: message._id,
        media: {
          folder: payload.mediafolder,
          filename: payload.medianame,
          backendUrl: payload.backendurl
        },
        processed: 'file'
      };
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      throw error;
    }
  }

  /**
   * Cria ou atualiza contato
   * @param {Object} payload - Payload do webhook
   * @returns {Object} Documento do contato
   */
  async upsertContact(payload) {
    try {
      console.log('🔍 Debugando estrutura do payload:');
      console.log('- payload.ticketdata existe?', !!payload.ticketdata);
      console.log('- payload.ticketData existe?', !!payload.ticketData);
      
      if (payload.ticketdata) {
        console.log('- payload.ticketdata.contact existe?', !!payload.ticketdata.contact);
        console.log('- Keys em ticketdata:', Object.keys(payload.ticketdata));
      }
      
      if (payload.ticketData) {
        console.log('- payload.ticketData.contact existe?', !!payload.ticketData.contact);
        console.log('- Keys em ticketData:', Object.keys(payload.ticketData));
      }
      
      console.log('- payload.contact existe?', !!payload.contact);

      let contactData;
      
      // Verificar tanto ticketdata quanto ticketData (case sensitivity)
      if (payload.ticketdata && payload.ticketdata.contact) {
        contactData = payload.ticketdata.contact;
        console.log('✅ Usando payload.ticketdata.contact');
      } else if (payload.ticketData && payload.ticketData.contact) {
        contactData = payload.ticketData.contact;
        console.log('✅ Usando payload.ticketData.contact');
      } else if (payload.contact) {
        contactData = payload.contact;
        console.log('✅ Usando payload.contact');
      } else {
        console.log('❌ Nenhum campo de contato encontrado');
        throw new Error('Dados de contato não encontrados no payload');
      }

      const contact = await Contact.findOneAndUpdate(
        { whaticketId: contactData.id },
        {
          whaticketId: contactData.id,
          name: contactData.name,
          number: contactData.number,
          email: contactData.email || '',
          profilePicUrl: contactData.profilepicurl || '',
          acceptAudioMessage: contactData.acceptaudiomessage !== false,
          active: contactData.active !== false,
          disableBot: contactData.disablebot === true,
          extraInfo: contactData.extrainfo || [],
          'crmData.lastInteraction': new Date()
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      console.log(`📱 Contato processado: ${contact.name} (${contact.number})`);
      return contact;
    } catch (error) {
      console.error('Erro ao processar contato:', error);
      throw error;
    }
  }

  /**
   * Cria ou atualiza ticket
   * @param {Object} payload - Payload do webhook
   * @param {Object} contact - Documento do contato
   * @returns {Object} Documento do ticket
   */
  async upsertTicket(payload, contact) {
    try {
      let ticketData = payload.ticketdata || payload.ticketData;
      if (!ticketData) {
        // Busca case-insensitive por ticketData
        for (const key of Object.keys(payload)) {
          if (key.toLowerCase() === 'ticketdata') {
            ticketData = payload[key];
            console.log(`⚠️ Usando ticketData com chave '${key}' encontrada no payload`);
            break;
          }
        }
      }
      
      if (!ticketData) {
        throw new Error('Dados de ticket não encontrados no payload');
      }

      const ticket = await Ticket.findOneAndUpdate(
        { whaticketId: ticketData.id },
        {
          whaticketId: ticketData.id,
          uuid: ticketData.uuid,
          status: ticketData.status,
          unreadMessages: ticketData.unreadmessages || 0,
          lastMessage: ticketData.lastmessage,
          isGroup: ticketData.isgroup === true,
          contactId: ticketData.contactid,
          userId: ticketData.userid,
          whatsappId: ticketData.whatsappid,
          queueId: ticketData.queueid,
          queueOptionId: ticketData.queueoptionid,
          companyId: ticketData.companyid,
          chatbot: ticketData.chatbot === true,
          channel: ticketData.channel || 'whatsapp',
          queue: ticketData.queue,
          user: ticketData.user,
          whatsapp: ticketData.whatsapp,
          company: ticketData.company,
          whaticketCreatedAt: new Date(ticketData.createdat),
          whaticketUpdatedAt: new Date(ticketData.updatedat)
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      console.log(`🎫 Ticket processado: ${ticket.whaticketId} - Status: ${ticket.status}`);
      return ticket;
    } catch (error) {
      console.error('Erro ao processar ticket:', error);
      throw error;
    }
  }

  /**
   * Cria mensagem
   * @param {Object} payload - Payload do webhook
   * @param {string} action - Ação da mensagem
   * @param {Object} ticket - Documento do ticket
   * @returns {Object} Documento da mensagem
   */
  async createMessage(payload, action, ticket) {
    try {
      const content = payload.mensagem || payload.lastmessage || 'Conversa iniciada';
      
      const message = new Message({
        sender: payload.sender,
        ticketId: payload.chamadoid || ticket.whaticketId,
        action: action,
        content: content,
        companyId: payload.companyid,
        whatsappId: payload.defaultwhatsappid || payload.whatsappId,
        fromMe: payload.fromme === true,
        queueId: payload.queueid,
        isGroup: payload.isgroup === true,
        ticketSnapshot: {
          status: ticket.status,
          contactName: ticket.contact?.name,
          contactNumber: payload.sender,
          queueName: ticket.queue?.name,
          userName: ticket.user?.name
        },
        rawPayload: payload
      });

      await message.save();
      
      // Processar análise de intenção e palavras-chave
      await message.detectIntent();
      await message.extractKeywords();

      console.log(`💬 Mensagem criada: ${message._id} - Conteúdo: ${content.substring(0, 50)}...`);
      return message;
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      throw error;
    }
  }

  /**
   * Cria mensagem de arquivo
   * @param {Object} payload - Payload do webhook
   * @param {Object} ticket - Documento do ticket
   * @returns {Object} Documento da mensagem
   */
  async createFileMessage(payload, ticket) {
    try {
      const td = payload.ticketdata || payload.ticketData || Object.values(payload).find((v, i) => Object.keys(payload)[i].toLowerCase() === 'ticketdata');
      const content = (td?.lastmessage || 'Arquivo enviado');
      
      const message = new Message({
        sender: payload.sender,
        ticketId: payload.chamadoid || ticket.whaticketId,
        action: 'media',
        content: content,
        companyId: payload.companyid,
        whatsappId: payload.defaultwhatsappid,
        fromMe: payload.fromme === true,
        queueId: payload.queueid,
        isGroup: payload.isgroup === true,
        media: {
          folder: payload.mediafolder,
          filename: payload.medianame,
          backendUrl: payload.backendurl,
          mediaType: this.determineMediaType(payload.medianame)
        },
        ticketSnapshot: {
          status: ticket.status,
          contactName: ticket.contact?.name,
          contactNumber: payload.sender,
          queueName: ticket.queue?.name,
          userName: ticket.user?.name
        },
        rawPayload: payload
      });

      await message.save();
      
      console.log(`📎 Mensagem de arquivo criada: ${message._id} - Arquivo: ${payload.medianame}`);
      return message;
    } catch (error) {
      console.error('Erro ao criar mensagem de arquivo:', error);
      throw error;
    }
  }

  /**
   * Determina tipo de mídia baseado no nome do arquivo
   * @param {string} filename - Nome do arquivo
   * @returns {string} Tipo de mídia
   */
  determineMediaType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const mediaTypes = {
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
      'mp3': 'audio', 'ogg': 'audio', 'wav': 'audio', 'aac': 'audio',
      'mp4': 'video', 'avi': 'video', 'mov': 'video', 'wmv': 'video',
      'pdf': 'document', 'doc': 'document', 'docx': 'document', 'xls': 'document'
    };
    
    return mediaTypes[extension] || 'document';
  }

  /**
   * Processa tags automáticas
   * @param {Object} payload - Payload do webhook
   * @param {Object} ticket - Documento do ticket
   * @param {Object} message - Documento da mensagem
   */
  async processAutomaticTags(payload, ticket, message) {
    try {
      const automaticTags = await Tag.findAutomatic(payload.companyid);
      
      for (const tag of automaticTags) {
        if (tag.checkAutomaticRules(message.content, payload)) {
          await tag.incrementUsage();
          console.log(`🏷️ Tag automática aplicada: ${tag.name}`);
        }
      }
    } catch (error) {
      console.error('Erro ao processar tags automáticas:', error);
    }
  }

  /**
   * Cria ou atualiza contato a partir de evento de tag
   * @param {Object} contactData - Dados do contato
   * @returns {Object} Documento do contato
   */
  async upsertContactFromTagEvent(contactData) {
    return await Contact.findOneAndUpdate(
      { whaticketId: contactData.id },
      {
        whaticketId: contactData.id,
        name: contactData.name,
        number: contactData.number,
        email: contactData.email || '',
        profilePicUrl: contactData.profilepicurl || '',
        'crmData.lastInteraction': new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
  }

  /**
   * Cria ou atualiza tag
   * @param {Object} tagData - Dados da tag
   * @returns {Object} Documento da tag
   */
  async upsertTag(tagData) {
    return await Tag.findOneAndUpdate(
      { whaticketId: tagData.id },
      {
        whaticketId: tagData.id,
        name: tagData.name,
        color: tagData.color,
        kanban: tagData.kanban || 0,
        prioridade: tagData.prioridade || 0,
        conversao: tagData.conversao || 'none',
        companyId: tagData.companyid,
        whaticketCreatedAt: new Date(tagData.createdat),
        whaticketUpdatedAt: new Date(tagData.updatedat)
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
  }

  /**
   * Cria evento de tag
   * @param {Object} payload - Payload do evento de tag
   * @returns {Object} Documento do evento
   */
  async createTagEvent(payload) {
    const tagEvent = new TagEvent({
      action: 'tag_sync',
      ticketId: payload.tags.ticketid,
      tags: payload.tags.tags.map(tag => ({
        whaticketId: tag.id,
        name: tag.name,
        color: tag.color,
        appliedAt: new Date()
      })),
      contact: {
        whaticketId: payload.contact.id,
        name: payload.contact.name,
        number: payload.contact.number,
        email: payload.contact.email
      },
      metadata: {
        triggeredBy: 'webhook'
      },
      rawPayload: payload
    });

    await tagEvent.save();
    return tagEvent;
  }

  /**
   * Atualiza status do ticket
   * @param {Object} payload - Payload de mudança de status
   * @returns {Object} Documento do ticket atualizado
   */
  async updateTicketStatus(payload) {
    const ticket = await Ticket.findOneAndUpdate(
      { whaticketId: payload.chamadoid },
      { 
        status: payload.acao,
        whaticketUpdatedAt: new Date()
      },
      { new: true }
    );

    if (!ticket) {
      throw new Error(`Ticket não encontrado: ${payload.chamadoid}`);
    }

    console.log(`🔄 Status do ticket ${ticket.whaticketId} alterado para: ${payload.acao}`);
    return ticket;
  }

  /**
   * Cria mensagem de log para mudança de status
   * @param {Object} payload - Payload de mudança de status
   * @param {Object} ticket - Documento do ticket
   * @returns {Object} Documento da mensagem
   */
  async createStatusMessage(payload, ticket) {
    const message = new Message({
      sender: 'system',
      ticketId: ticket.whaticketId,
      action: 'status_change',
      content: `Status alterado para: ${payload.acao}`,
      companyId: payload.companyid,
      whatsappId: payload.defaultwhatsappid,
      fromMe: false,
      queueId: payload.queueid,
      isGroup: payload.isgroup === true,
      ticketSnapshot: {
        status: ticket.status,
        contactName: ticket.contact?.name,
        contactNumber: payload.sender
      },
      rawPayload: payload
    });

    await message.save();
    return message;
  }
}

module.exports = new WebhookProcessor(); 