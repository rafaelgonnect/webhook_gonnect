const Ticket = require('../models/Ticket');
const Message = require('../models/Message');

exports.listTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const filter = {};
    if (status) filter.status = status;

    const total = await Ticket.countDocuments(filter);
    const tickets = await Ticket.find(filter)
      .sort({ whaticketUpdatedAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.json({ success: true, data: tickets, pagination: { total, page: pageNumber, pages: Math.ceil(total / pageSize), limit: pageSize } });
  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket não encontrado' });

    const messages = await Message.find({ ticketId: ticket.whaticketId }).sort({ createdAt: -1 });

    res.json({ success: true, data: { ticket, messages } });
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'open', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status inválido' });
    }
    const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true });
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket não encontrado' });

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Erro ao atualizar status do ticket:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

exports.createManualMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'content é obrigatório' });

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket não encontrado' });

    // Criar mensagem local (simulação de envio)
    const message = new Message({
      sender: ticket.contactId,
      ticketId: ticket.whaticketId,
      action: 'message',
      content,
      companyId: ticket.companyId,
      whatsappId: ticket.whatsappId,
      fromMe: true,
      queueId: ticket.queueId,
      isGroup: ticket.isGroup,
      ticketSnapshot: {
        status: ticket.status,
        contactName: ticket.contact?.name,
        contactNumber: ticket.contactId,
        queueName: ticket.queue?.name,
        userName: ticket.user?.name
      }
    });
    await message.save();

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Erro ao enviar mensagem manual:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

module.exports = exports; 