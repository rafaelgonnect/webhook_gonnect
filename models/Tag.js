const mongoose = require('mongoose');

/**
 * Schema para relacionamento ticket-tag
 */
const TicketTagSchema = new mongoose.Schema({
  ticketId: { type: Number, required: true },
  tagId: { type: Number, required: true },
  appliedAt: { type: Date, default: Date.now },
  appliedBy: { type: String } // Usuário que aplicou a tag
}, { _id: false });

/**
 * Schema principal da tag
 */
const TagSchema = new mongoose.Schema({
  // ID original do Whaticket
  whaticketId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  // Nome da tag
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // Cor da tag
  color: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Cor deve estar no formato hexadecimal (#RRGGBB ou #RGB)'
    }
  },
  
  // Configurações kanban
  kanban: {
    type: Number,
    default: 0
  },
  
  // Prioridade da tag
  prioridade: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Tipo de conversão
  conversao: {
    type: String,
    enum: ['quote', 'lead', 'customer', 'opportunity', 'none'],
    default: 'none'
  },
  
  // ID da empresa
  companyId: {
    type: Number,
    required: true,
    index: true
  },
  
  // Metadados do CRM
  crmData: {
    // Categoria da tag
    category: {
      type: String,
      enum: ['status', 'prioridade', 'departamento', 'produto', 'origem', 'personalizada'],
      default: 'personalizada',
      index: true
    },
    
    // Se a tag é automática ou manual
    isAutomatic: {
      type: Boolean,
      default: false
    },
    
    // Regras para aplicação automática
    automaticRules: {
      keywords: [String],
      conditions: [{
        field: String,
        operator: { type: String, enum: ['equals', 'contains', 'starts_with', 'ends_with', 'regex'] },
        value: String
      }]
    },
    
    // Ações a serem executadas quando a tag é aplicada
    actions: {
      changeStatus: String,
      assignToUser: String,
      sendMessage: String,
      createTask: Boolean
    },
    
    // Estatísticas de uso
    usage: {
      totalApplications: { type: Number, default: 0 },
      lastUsed: Date,
      activeTickets: { type: Number, default: 0 }
    },
    
    // Configurações de notificação
    notifications: {
      notifyOnApply: { type: Boolean, default: false },
      notifyUsers: [String]
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
  }
}, {
  timestamps: true,
  collection: 'tags'
});

// Índices compostos para performance
TagSchema.index({ companyId: 1, name: 1 });
TagSchema.index({ 'crmData.category': 1, companyId: 1 });
TagSchema.index({ prioridade: -1, companyId: 1 });
TagSchema.index({ 'crmData.isAutomatic': 1, companyId: 1 });

// Middleware para atualizar estatísticas
TagSchema.pre('save', function(next) {
  if (this.isNew) {
    this.crmData.usage.totalApplications = 0;
  }
  next();
});

// Métodos de instância
TagSchema.methods.incrementUsage = function() {
  this.crmData.usage.totalApplications += 1;
  this.crmData.usage.lastUsed = new Date();
  return this.save();
};

TagSchema.methods.updateActiveTickets = async function() {
  try {
    const TicketTag = mongoose.model('TicketTag');
    const activeCount = await TicketTag.countDocuments({
      'tags.id': this.whaticketId,
      'status': { $in: ['pending', 'open'] }
    });
    
    this.crmData.usage.activeTickets = activeCount;
    return this.save();
  } catch (error) {
    console.error('Erro ao atualizar contagem de tickets ativos:', error);
  }
};

TagSchema.methods.checkAutomaticRules = function(content, ticketData) {
  if (!this.crmData.isAutomatic) {
    return false;
  }
  
  // Verificar palavras-chave
  if (this.crmData.automaticRules.keywords.length > 0) {
    const contentLower = content.toLowerCase();
    const hasKeyword = this.crmData.automaticRules.keywords.some(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      return true;
    }
  }
  
  // Verificar condições
  if (this.crmData.automaticRules.conditions.length > 0) {
    return this.crmData.automaticRules.conditions.every(condition => {
      const fieldValue = this.getNestedValue(ticketData, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'contains':
          return String(fieldValue).includes(condition.value);
        case 'starts_with':
          return String(fieldValue).startsWith(condition.value);
        case 'ends_with':
          return String(fieldValue).endsWith(condition.value);
        case 'regex':
          return new RegExp(condition.value).test(String(fieldValue));
        default:
          return false;
      }
    });
  }
  
  return false;
};

TagSchema.methods.getNestedValue = function(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

// Métodos estáticos
TagSchema.statics.findByCompany = function(companyId) {
  return this.find({ companyId }).sort({ prioridade: -1, name: 1 });
};

TagSchema.statics.findByCategory = function(category, companyId) {
  return this.find({ 'crmData.category': category, companyId });
};

TagSchema.statics.findAutomatic = function(companyId) {
  return this.find({ 'crmData.isAutomatic': true, companyId });
};

TagSchema.statics.getMostUsed = function(companyId, limit = 10) {
  return this.find({ companyId })
    .sort({ 'crmData.usage.totalApplications': -1 })
    .limit(limit);
};

/**
 * Schema para eventos de aplicação de tags
 */
const TagEventSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['tag_applied', 'tag_removed', 'tag_sync'],
    required: true,
    index: true
  },
  
  ticketId: {
    type: Number,
    required: true,
    index: true
  },
  
  tags: [{
    whaticketId: Number,
    name: String,
    color: String,
    appliedAt: Date,
    removedAt: Date
  }],
  
  // Dados do contato no momento do evento
  contact: {
    whaticketId: Number,
    name: String,
    number: String,
    email: String
  },
  
  // Metadados do evento
  metadata: {
    triggeredBy: { type: String, enum: ['manual', 'automatic', 'webhook'] },
    userId: String,
    reason: String
  },
  
  // Payload original
  rawPayload: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'tag_events'
});

// Índices para eventos de tags
TagEventSchema.index({ ticketId: 1, createdAt: -1 });
TagEventSchema.index({ action: 1, createdAt: -1 });
TagEventSchema.index({ 'contact.number': 1, createdAt: -1 });

module.exports = {
  Tag: mongoose.model('Tag', TagSchema),
  TagEvent: mongoose.model('TagEvent', TagEventSchema)
}; 