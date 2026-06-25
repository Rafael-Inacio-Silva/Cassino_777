const pool = require('../config/database');

class GameRound {
  static async create(
    { userId, gameType, result, bets, totalBet, totalWin, balanceBefore, balanceAfter },
    client = pool
  ) {
    const res = await client.query(
      `INSERT INTO game_rounds
         (user_id, game_type, result, bets, total_bet, total_win, balance_before, balance_after)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, gameType, result, JSON.stringify(bets), totalBet, totalWin, balanceBefore, balanceAfter]
    );
    return res.rows[0];
  }

  static async findByUser(userId, limit = 20, offset = 0) {
    const res = await pool.query(
      `SELECT id, game_type, result, bets, total_bet, total_win,
              balance_before, balance_after, created_at
       FROM game_rounds
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return res.rows;
  }
}

module.exports = GameRound;
