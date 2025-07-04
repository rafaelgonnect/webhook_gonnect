const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/metrics', dashboardController.getMetrics);

module.exports = router; 