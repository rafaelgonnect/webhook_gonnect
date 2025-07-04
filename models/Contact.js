const mongoose = require('mongoose');

/**
 * Schema para informações extras do contato
 */
const ExtraInfoSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

/**
 * Schema principal do contato
 */
const ContactSchema = new mongoose.Schema({
  // ID original do Whaticket
  whaticketId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  // Informações básicas
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  number: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  
  // Foto de perfil
  profilePicUrl: {
    type: String,
    trim: true
  },
  
  // Configurações
  acceptAudioMessage: {
    type: Boolean,
    default: true
  },
  
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  
  disableBot: {
    type: Boolean,
    default: false
  },
  
  // Informações extras dinâmicas
  extraInfo: [ExtraInfoSchema],
  
  // Metadados do CRM
  crmData: {
    // Status do lead no funil de vendas
    leadStatus: {
      type: String,
      enum: ['novo', 'contactado', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido'],
      default: 'novo',
      index: true
    },
    
    // Origem do lead
    source: {
      type: String,
      default: 'whaticket',
      index: true
    },
    
    // Pontuação do lead
    leadScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // Última interação
    lastInteraction: {
      type: Date,
      default: Date.now
    },
    
    // Responsável pelo contato
    assignedTo: {
      type: String,
      index: true
    },
    
    // Notas internas
    notes: [{
      content: String,
      createdBy: String,
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Tags personalizadas
    customTags: [String]
  }
}, {
  timestamps: true,
  collection: 'contacts'
});

// Índices compostos para performance
ContactSchema.index({ number: 1, active: 1 });
ContactSchema.index({ 'crmData.leadStatus': 1, 'crmData.lastInteraction': -1 });
ContactSchema.index({ 'crmData.assignedTo': 1, active: 1 });

// Middleware para atualizar lastInteraction
ContactSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('crmData.lastInteraction')) {
    this.crmData.lastInteraction = new Date();
  }
  next();
});

// Métodos de instância
ContactSchema.methods.updateLeadScore = function(score) {
  this.crmData.leadScore = Math.max(0, Math.min(100, score));
  return this.save();
};

ContactSchema.methods.addNote = function(content, createdBy) {
  this.crmData.notes.push({
    content,
    createdBy,
    createdAt: new Date()
  });
  return this.save();
};

// Métodos estáticos
ContactSchema.statics.findByNumber = function(number) {
  return this.findOne({ number, active: true });
};

ContactSchema.statics.findByLeadStatus = function(status) {
  return this.find({ 'crmData.leadStatus': status, active: true });
};

module.exports = mongoose.model('Contact', ContactSchema); 