const { Tag } = require('../models/Tag');
const Ticket = require('../models/Ticket');

/**
 * GET /tags
 */
exports.listTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ prioridade: -1, name: 1 });
    // retorna contagem de uso a partir do campo usage
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('Erro ao listar tags:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

/**
 * POST /tickets/:id/tags
 * Body: { add: [whaticketId], remove: [whaticketId] }
 */
exports.manageTicketTags = async (req, res) => {
  try {
    const { id } = req.params; // Mongo _id
    const { add = [], remove = [] } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket não encontrado' });

    // garantir ticket.tags array
    ticket.tags = ticket.tags || [];

    // adicionar
    add.forEach(tid => {
      if (!ticket.tags.includes(tid)) ticket.tags.push(tid);
    });
    // remover
    ticket.tags = ticket.tags.filter(tid => !remove.includes(tid));

    await ticket.save();

    res.json({ success: true, data: ticket.tags });
  } catch (error) {
    console.error('Erro ao gerenciar tags do ticket:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

module.exports = exports; 