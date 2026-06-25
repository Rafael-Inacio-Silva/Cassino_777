const pool = require('../config/database');

exports.stats = async (req, res) => {
  try {
    const [txStats, ggrStats, playerStats, recentActivity] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_deposits,
          COUNT(CASE WHEN type = 'deposit' AND status = 'completed' THEN 1 END) AS deposit_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count
        FROM transactions
      `),
      pool.query(`
        SELECT
          COALESCE(SUM(total_bet - total_win), 0) AS ggr,
          COALESCE(SUM(total_bet), 0)             AS total_wagered,
          COALESCE(SUM(total_win), 0)             AS total_paid_out,
          COUNT(*)                                AS total_rounds
        FROM game_rounds
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE is_admin = false)                                          AS total_players,
          COUNT(*) FILTER (WHERE is_admin = false AND is_active = true)                     AS active_players,
          COUNT(*) FILTER (WHERE is_admin = false AND created_at >= NOW() - INTERVAL '7d')  AS new_this_week,
          COUNT(*) FILTER (WHERE is_admin = false AND created_at >= NOW() - INTERVAL '24h') AS new_today
        FROM users
      `),
      pool.query(`
        SELECT DATE_TRUNC('day', created_at)::date AS day,
               SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) AS deposits
        FROM transactions
        WHERE created_at >= NOW() - INTERVAL '30d'
        GROUP BY 1 ORDER BY 1
      `),
    ]);

    res.json({
      transactions: txStats.rows[0],
      ggr:          ggrStats.rows[0],
      players:      playerStats.rows[0],
      dailyActivity: recentActivity.rows,
    });
  } catch (err) {
    console.error('admin stats:', err);
    res.status(500).json({ message: 'Erro ao buscar estatísticas.' });
  }
};

exports.transactions = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const type   = req.query.type || null;
    const status = req.query.status || null;

    let where = 'WHERE 1=1';
    const params = [];
    if (type)   { params.push(type);   where += ` AND t.type = $${params.length}`; }
    if (status) { params.push(status); where += ` AND t.status = $${params.length}`; }
    params.push(limit, offset);

    const { rows } = await pool.query(`
      SELECT t.id, t.type, t.amount, t.status,
             t.description, t.created_at, t.updated_at,
             u.id AS user_id, u.name AS user_name, u.email AS user_email
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      ${where}
      ORDER BY t.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const total = await pool.query(`
      SELECT COUNT(*) FROM transactions t ${where.replace(/LIMIT.*/,'')}
    `, params.slice(0, -2));

    res.json({ transactions: rows, total: parseInt(total.rows[0].count) });
  } catch (err) {
    console.error('admin transactions:', err);
    res.status(500).json({ message: 'Erro ao buscar transações.' });
  }
};

exports.players = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || null;

    const params = [];
    let where = 'WHERE is_admin = false';
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR cpf ILIKE $${params.length})`;
    }
    params.push(limit, offset);

    const { rows } = await pool.query(`
      SELECT id, name, email, cpf, balance, is_active, email_verified, created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const total = await pool.query(
      `SELECT COUNT(*) FROM users ${where}`,
      params.slice(0, -2)
    );

    res.json({ players: rows, total: parseInt(total.rows[0].count) });
  } catch (err) {
    console.error('admin players:', err);
    res.status(500).json({ message: 'Erro ao buscar jogadores.' });
  }
};
