const mongoose = require('mongoose');

/**
 * Schema para dados de mídia
 */
const MediaSchema = new mongoose.Schema({
  folder: { type: String },
  filename: { type: String },
  backendUrl: { type: String },
  mediaType: { 
    type: String, 
    enum: ['image', 'audio', 'video', 'document', 'sticker', 'contact', 'location'],
    default: 'document'
  },
  fileSize: { type: Number },
  mimeType: { type: String }
}, { _id: false });

/**
 * Schema principal da mensagem
 */
const MessageSchema = new mongoose.Schema({
  // Dados básicos da mensagem
  sender: {
    type: String,
    required: true,
    index: true
  },
  
  ticketId: {
    type: Number,
    required: true,
    index: true
  },
  
  action: {
    type: String,
    required: true,
    enum: ['start', 'message', 'media', 'status_change', 'queue_change', 'user_assignment'],
    index: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  // Metadados da origem
  companyId: {
    type: Number,
    required: true,
    index: true
  },
  
  whatsappId: {
    type: Number,
    required: true,
    index: true
  },
  
  fromMe: {
    type: Boolean,
    default: false,
    index: true
  },
  
  queueId: {
    type: Number,
    index: true
  },
  
  isGroup: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Dados de mídia (quando aplicável)
  media: MediaSchema,
  
  // Dados do ticket associado (snapshot no momento da mensagem)
  ticketSnapshot: {
    status: String,
    contactName: String,
    contactNumber: String,
    queueName: String,
    userName: String
  },
  
  // Metadados do CRM
  crmData: {
    // Sentimento da mensagem (análise futura)
    sentiment: {
      type: String,
      enum: ['positivo', 'neutro', 'negativo'],
      default: 'neutro'
    },
    
    // Score de urgência (0-100)
    urgencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // Intenção detectada
    intent: {
      type: String,
      enum: ['duvida', 'reclamacao', 'elogio', 'solicitacao', 'informacao', 'vendas', 'suporte'],
      index: true
    },
    
    // Palavras-chave extraídas
    keywords: [String],
    
    // Resposta automática enviada
    autoResponseSent: {
      type: Boolean,
      default: false
    },
    
    // Tempo de resposta (em segundos)
    responseTime: {
      type: Number
    },
    
    // Categoria da mensagem
    category: {
      type: String,
      enum: ['entrada', 'resposta', 'followup', 'encerramento']
    }
  },
  
  // Dados originais do payload
  rawPayload: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'messages'
});

// Índices compostos para performance
MessageSchema.index({ ticketId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ companyId: 1, createdAt: -1 });
MessageSchema.index({ action: 1, createdAt: -1 });
MessageSchema.index({ fromMe: 1, createdAt: -1 });
MessageSchema.index({ 'crmData.intent': 1, createdAt: -1 });

// Middleware para calcular tempo de resposta
MessageSchema.pre('save', function(next) {
  if (this.fromMe && this.action === 'message') {
    this.calculateResponseTime();
  }
  next();
});

// Métodos de instância
MessageSchema.methods.calculateResponseTime = async function() {
  try {
    // Buscar a última mensagem do cliente no mesmo ticket
    const lastCustomerMessage = await this.constructor.findOne({
      ticketId: this.ticketId,
      fromMe: false,
      action: 'message',
      createdAt: { $lt: this.createdAt }
    }).sort({ createdAt: -1 });
    
    if (lastCustomerMessage) {
      const responseTimeMs = this.createdAt - lastCustomerMessage.createdAt;
      this.crmData.responseTime = Math.round(responseTimeMs / 1000); // Converter para segundos
    }
  } catch (error) {
    console.error('Erro ao calcular tempo de resposta:', error);
  }
};

MessageSchema.methods.extractKeywords = function() {
  // Extração simples de palavras-chave
  const commonWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'numa', 'pelos', 'pelas', 'esse', 'eles', 'essas', 'esses', 'pelas', 'esta', 'estão', 'você', 'teve', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'del'];
  
  const words = this.content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));
  
  this.crmData.keywords = [...new Set(words)].slice(0, 10); // Máximo 10 palavras-chave únicas
  return this.save();
};

MessageSchema.methods.detectIntent = function() {
  const content = this.content.toLowerCase();
  
  // Palavras-chave para detecção de intenção
  const intentKeywords = {
    'reclamacao': ['problema', 'erro', 'ruim', 'péssimo', 'horrível', 'reclamar', 'insatisfeito'],
    'elogio': ['excelente', 'ótimo', 'bom', 'perfeito', 'parabéns', 'obrigado', 'gostei'],
    'duvida': ['como', 'quando', 'onde', 'porque', 'dúvida', 'não entendi', 'explica'],
    'solicitacao': ['preciso', 'quero', 'gostaria', 'solicito', 'pedido', 'requisito'],
    'vendas': ['preço', 'valor', 'comprar', 'vender', 'produto', 'serviço', 'orçamento'],
    'suporte': ['ajuda', 'suporte', 'técnico', 'configurar', 'instalar', 'funciona']
  };
  
  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      this.crmData.intent = intent;
      break;
    }
  }
  
  if (!this.crmData.intent) {
    this.crmData.intent = 'informacao';
  }
  
  return this.save();
};

// Métodos estáticos
MessageSchema.statics.findByTicket = function(ticketId) {
  return this.find({ ticketId }).sort({ createdAt: 1 });
};

MessageSchema.statics.findBySender = function(sender) {
  return this.find({ sender }).sort({ createdAt: -1 });
};

MessageSchema.statics.findByIntent = function(intent) {
  return this.find({ 'crmData.intent': intent }).sort({ createdAt: -1 });
};

MessageSchema.statics.getAverageResponseTime = function(companyId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        companyId: companyId,
        fromMe: true,
        'crmData.responseTime': { $exists: true },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        averageResponseTime: { $avg: '$crmData.responseTime' },
        totalMessages: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Message', MessageSchema); 