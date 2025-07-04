const mongoose = require('mongoose');

/**
 * Schema para dados da fila
 */
const QueueSchema = new mongoose.Schema({
  whaticketId: { type: Number, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true }
}, { _id: false });

/**
 * Schema para dados do usuário
 */
const UserSchema = new mongoose.Schema({
  whaticketId: { type: Number, required: true },
  name: { type: String, required: true }
}, { _id: false });

/**
 * Schema para dados do WhatsApp
 */
const WhatsAppSchema = new mongoose.Schema({
  whaticketId: { type: Number, required: true },
  name: { type: String, required: true },
  webhook: { type: String }
}, { _id: false });

/**
 * Schema para dados da empresa
 */
const CompanySchema = new mongoose.Schema({
  whaticketId: { type: Number },
  name: { type: String, required: true }
}, { _id: false });

/**
 * Schema principal do ticket
 */
const TicketSchema = new mongoose.Schema({
  // ID original do Whaticket
  whaticketId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  // UUID único do ticket
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Status do ticket
  status: {
    type: String,
    enum: ['pending', 'open', 'closed'],
    required: true,
    index: true
  },
  
  // Mensagens não lidas
  unreadMessages: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Última mensagem
  lastMessage: {
    type: String,
    required: true
  },
  
  // Se é um grupo
  isGroup: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // IDs relacionados
  contactId: {
    type: Number,
    required: true,
    index: true
  },
  
  userId: {
    type: Number,
    index: true
  },
  
  whatsappId: {
    type: Number,
    required: true,
    index: true
  },
  
  queueId: {
    type: Number,
    index: true
  },
  
  queueOptionId: {
    type: Number
  },
  
  companyId: {
    type: Number,
    required: true,
    index: true
  },
  
  // Configurações
  chatbot: {
    type: Boolean,
    default: false
  },
  
  channel: {
    type: String,
    default: 'whatsapp',
    index: true
  },
  
  // Dados relacionados
  queue: QueueSchema,
  user: UserSchema,
  whatsapp: WhatsAppSchema,
  company: CompanySchema,
  
  // Metadados do CRM
  crmData: {
    // Prioridade do ticket
    priority: {
      type: String,
      enum: ['baixa', 'normal', 'alta', 'critica'],
      default: 'normal',
      index: true
    },
    
    // Categoria do atendimento
    category: {
      type: String,
      enum: ['suporte', 'vendas', 'financeiro', 'geral'],
      default: 'geral',
      index: true
    },
    
    // Tempo de primeira resposta
    firstResponseTime: {
      type: Date
    },
    
    // Tempo de resolução
    resolutionTime: {
      type: Date
    },
    
    // Avaliação do atendimento
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      ratedAt: Date
    },
    
    // Motivo do fechamento
    closeReason: {
      type: String,
      enum: ['resolvido', 'nao_resolvido', 'spam', 'abandonado', 'transferido']
    },
    
    // SLA
    slaStatus: {
      type: String,
      enum: ['dentro_prazo', 'proximo_vencimento', 'vencido'],
      default: 'dentro_prazo'
    },
    
    // Estimativa de resolução
    estimatedResolution: {
      type: Date
    }
  },
  
  // Timestamps originais do Whaticket
  whaticketCreatedAt: {
    type: Date,
    required: true
  },
  
  whaticketUpdatedAt: {
    type: Date,
    required: true
  },

  tags: {
    type: [Number],
    default: [],
    index: true
  },
}, {
  timestamps: true,
  collection: 'tickets'
});

// Índices compostos para performance
TicketSchema.index({ status: 1, companyId: 1 });
TicketSchema.index({ contactId: 1, status: 1 });
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ queueId: 1, status: 1 });
TicketSchema.index({ 'crmData.priority': 1, status: 1 });
TicketSchema.index({ 'crmData.category': 1, status: 1 });
TicketSchema.index({ createdAt: -1 });

// Middleware para calcular SLA
TicketSchema.pre('save', function(next) {
  if (this.isModified('status') || this.isNew) {
    this.calculateSLA();
  }
  next();
});

// Métodos de instância
TicketSchema.methods.calculateSLA = function() {
  const now = new Date();
  const created = this.createdAt || this.whaticketCreatedAt;
  const hoursElapsed = (now - created) / (1000 * 60 * 60);
  
  // SLA padrão: 24 horas para primeira resposta
  const slaHours = this.crmData.priority === 'critica' ? 2 : 
                   this.crmData.priority === 'alta' ? 4 : 
                   this.crmData.priority === 'normal' ? 12 : 24;
  
  if (hoursElapsed >= slaHours) {
    this.crmData.slaStatus = 'vencido';
  } else if (hoursElapsed >= slaHours * 0.8) {
    this.crmData.slaStatus = 'proximo_vencimento';
  } else {
    this.crmData.slaStatus = 'dentro_prazo';
  }
};

TicketSchema.methods.setFirstResponse = function() {
  if (!this.crmData.firstResponseTime) {
    this.crmData.firstResponseTime = new Date();
  }
  return this.save();
};

TicketSchema.methods.closeTicket = function(reason, rating = null) {
  this.status = 'closed';
  this.crmData.closeReason = reason;
  this.crmData.resolutionTime = new Date();
  
  if (rating) {
    this.crmData.rating = {
      score: rating.score,
      comment: rating.comment,
      ratedAt: new Date()
    };
  }
  
  return this.save();
};

// Métodos estáticos
TicketSchema.statics.findByContact = function(contactId) {
  return this.find({ contactId }).sort({ createdAt: -1 });
};

TicketSchema.statics.findActiveTickets = function() {
  return this.find({ status: { $in: ['pending', 'open'] } });
};

TicketSchema.statics.findOverdueSLA = function() {
  return this.find({ 'crmData.slaStatus': 'vencido', status: { $in: ['pending', 'open'] } });
};

module.exports = mongoose.model('Ticket', TicketSchema); 