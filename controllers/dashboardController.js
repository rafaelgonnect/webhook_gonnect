const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const Contact = require('../models/Contact');

function formatDate(dt) {
  return dt.toISOString().split('T')[0];
}

exports.getMetrics = async (req, res) => {
  try {
    const end = new Date();
    const start7 = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Tickets by status
    const ticketsByStatus = await Ticket.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } }
    ]);
    const ticketsStatusObj = ticketsByStatus.reduce((acc, cur) => { acc[cur._id] = cur.total; return acc; }, {});

    // Tickets por dia (últimos 7 dias)
    const ticketsPerDay = await Ticket.aggregate([
      { $match: { createdAt: { $gte: start7, $lte: end } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);

    // Mensagens por dia (últimos 7 dias)
    const messagesPerDay = await Message.aggregate([
      { $match: { createdAt: { $gte: start7, $lte: end } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);

    // Novos contatos por dia
    const contactsPerDay = await Contact.aggregate([
      { $match: { createdAt: { $gte: start7, $lte: end } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        ticketsStatus: ticketsStatusObj,
        ticketsPerDay,
        messagesPerDay,
        contactsPerDay
      }
    });
  } catch (error) {
    console.error('Erro metrics:', error);
    res.status(500).json({ success:false, error:'erro interno'});
  }
};

module.exports = exports; 