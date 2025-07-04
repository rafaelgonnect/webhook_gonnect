const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/', ticketController.listTickets);
router.get('/:id', ticketController.getTicketById);
router.put('/:id/status', ticketController.updateTicketStatus);

module.exports = router; 