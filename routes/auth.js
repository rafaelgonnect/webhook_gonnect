const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authJwt = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', authJwt, authController.me);

module.exports = router; 