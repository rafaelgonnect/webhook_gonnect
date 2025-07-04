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