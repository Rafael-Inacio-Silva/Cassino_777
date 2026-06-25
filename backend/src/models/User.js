const pool = require('../config/database');

class User {
  static async create({ name, email, cpf, password, birthDate, googleId, emailVerified = false }) {
    const result = await pool.query(
      `INSERT INTO users
         (name, email, cpf, password_hash, birth_date, google_id, email_verified, balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0.00)
       RETURNING id, name, email, cpf, birth_date, balance, email_verified, google_id, created_at`,
      [name, email, cpf || null, password || null, birthDate || null, googleId || null, emailVerified]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT id, name, email, cpf, birth_date, balance, email_verified, google_id, is_admin, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByGoogleId(googleId) {
    const result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return result.rows[0];
  }

  static async emailExists(email) {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
  }

  static async cpfExists(cpf) {
    const result = await pool.query(
      'SELECT id FROM users WHERE cpf = $1',
      [cpf]
    );
    return result.rows.length > 0;
  }

  static async setEmailVerified(id) {
    await pool.query(
      `UPDATE users
       SET email_verified = true, email_verify_token = NULL, email_verify_expires = NULL, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  static async setVerificationToken(id, token, expires) {
    await pool.query(
      `UPDATE users
       SET email_verify_token = $1, email_verify_expires = $2, updated_at = NOW()
       WHERE id = $3`,
      [token, expires, id]
    );
  }

  static async findByVerificationToken(token) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email_verify_token = $1 AND email_verify_expires > NOW()`,
      [token]
    );
    return result.rows[0];
  }

  static async completeProfile(id, { cpf, birthDate }) {
    const result = await pool.query(
      `UPDATE users
       SET cpf = $1, birth_date = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, cpf, birth_date, balance, email_verified, google_id`,
      [cpf, birthDate, id]
    );
    return result.rows[0];
  }

  // delta positivo = crédito, negativo = débito. Retorna o novo saldo.
  static async updateBalance(id, delta, client = pool) {
    const result = await client.query(
      `UPDATE users SET balance = balance + $1, updated_at = NOW()
       WHERE id = $2 AND (balance + $1) >= 0
       RETURNING id, name, email, balance`,
      [delta, id]
    );
    return result.rows[0] || null; // null = saldo insuficiente
  }
}

module.exports = User;
