const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints de login
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Login do administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT gerado
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'username e password são obrigatórios' });
    }

    const user = await AdminUser.findOne({ username, active: true });
    if (!user) return res.status(401).json({ success: false, error: 'Credenciais inválidas' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, error: 'Credenciais inválidas' });

    const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

module.exports = exports; 