const Message = require('../models/Message');

/**
 * GET /messages
 * Lista mensagens com filtros por contato, ticket e intervalo de datas
 */
exports.listMessages = async (req, res) => {
  try {
    const {
      ticketId,
      sender,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const filter = {};

    if (ticketId) filter.ticketId = Number(ticketId);
    if (sender) filter.sender = sender;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize
      }
    });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};

module.exports = exports; 