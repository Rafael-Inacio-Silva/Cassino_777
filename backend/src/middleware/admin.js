const pool = require('../config/database');

module.exports = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]?.is_admin) return res.status(403).json({ message: 'Acesso negado.' });
    next();
  } catch {
    res.status(500).json({ message: 'Erro interno.' });
  }
};
