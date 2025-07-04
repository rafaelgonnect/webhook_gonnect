const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ success: false, error: 'Token ausente' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
}; 