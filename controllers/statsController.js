const Ticket = require('../models/Ticket');
const Message = require('../models/Message');

/**
 * GET /stats
 * Retorna métricas gerais do sistema (tickets e mensagens)
 */
exports.getStats = async (req, res) => {
  try {
    const [ticketsByStatus, messageCountAgg] = await Promise.all([
      Ticket.aggregate([
        { $group: { _id: '$status', total: { $sum: 1 } } }
      ]),
      Message.countDocuments()
    ]);

    // Converter array para objeto {status: total}
    const tickets = ticketsByStatus.reduce((acc, cur) => {
      acc[cur._id] = cur.total;
      return acc;
    }, {});

    // Tempo médio de resposta (em segundos)
    const avgResp = await Message.aggregate([
      { $match: { fromMe: true, 'crmData.responseTime': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$crmData.responseTime' } } }
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        totalMessages: messageCountAgg,
        averageResponseTimeSeconds: avgResp[0]?.avg || 0
      }
    });
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};

module.exports = exports; 