const Contact = require('../models/Contact');

/**
 * GET /contacts
 * Lista contatos com filtros, busca e paginação
 */
exports.listContacts = async (req, res) => {
  try {
    const {
      search = '',
      active = 'true',
      page = 1,
      limit = 20
    } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const filter = {};
    if (active !== 'all') {
      filter.active = active === 'true';
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { number: regex },
        { email: regex }
      ];
    }

    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ updatedAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize
      }
    });
  } catch (error) {
    console.error('Erro ao listar contatos:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};

/**
 * GET /contacts/:id
 */
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) return res.status(404).json({ success: false, error: 'Contato não encontrado' });

    // Carregar tickets vinculados
    const Ticket = require('../models/Ticket');
    const tickets = await Ticket.find({ contactId: contact.whaticketId }).select('-rawPayload');

    res.json({ success: true, data: { contact, tickets } });
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

/**
 * POST /contacts
 * Cria ou atualiza contato manualmente
 */
exports.createOrUpdateContact = async (req, res) => {
  try {
    const { whaticketId, name, number, email } = req.body;
    if (!whaticketId || !name || !number) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: whaticketId, name, number' });
    }

    const contact = await Contact.findOneAndUpdate(
      { whaticketId },
      { whaticketId, name, number, email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Erro ao criar/atualizar contato:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

/**
 * PUT /contacts/:id
 */
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const contact = await Contact.findByIdAndUpdate(id, updates, { new: true });
    if (!contact) return res.status(404).json({ success: false, error: 'Contato não encontrado' });

    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Erro ao atualizar contato:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

module.exports = exports; 