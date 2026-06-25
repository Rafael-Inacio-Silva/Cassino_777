const pool = require('../config/database');

class Transaction {
  static async create({ userId, type, amount, description }) {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, type, amount, description || null]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUser(userId, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async complete(id, client = pool) {
    const result = await client.query(
      `UPDATE transactions SET status = 'completed', updated_at = NOW()
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async fail(id, client = pool) {
    const result = await client.query(
      `UPDATE transactions SET status = 'failed', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Transaction;
