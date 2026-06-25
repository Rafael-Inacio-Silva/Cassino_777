const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const GameRound = require('../models/GameRound');
const { validateBets, drawNumber, settle } = require('../services/rouletteEngine');

const router = Router();
router.use(authMiddleware);

// ─── Rodada de roleta (server-authoritative) ─────────────────────────────────
// O cliente envia apenas as apostas; sorteio, débito, prêmio e registro
// acontecem aqui, em uma única transação.
router.post('/spin', async (req, res) => {
  let validated;
  try {
    validated = validateBets(req.body?.bets);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  const { bets, totalBetCents } = validated;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Trava a linha do usuário — impede duas rodadas concorrentes sobre o mesmo saldo
    const { rows } = await client.query(
      'SELECT balance, email_verified, cpf FROM users WHERE id = $1 FOR UPDATE',
      [req.user.id]
    );
    const user = rows[0];
    if (!user) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    if (!user.email_verified || !user.cpf) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Confirme seu e-mail e complete o perfil para jogar.' });
    }

    const balanceBeforeCents = Math.round(parseFloat(user.balance) * 100);
    if (balanceBeforeCents < totalBetCents) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Saldo insuficiente.' });
    }

    const result = drawNumber();
    const totalWinCents = settle(bets, result);
    const balanceAfterCents = balanceBeforeCents - totalBetCents + totalWinCents;

    const totalBet = totalBetCents / 100;
    const totalWin = totalWinCents / 100;
    const balanceBefore = balanceBeforeCents / 100;
    const balanceAfter = balanceAfterCents / 100;

    await client.query(
      'UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2',
      [balanceAfter.toFixed(2), req.user.id]
    );

    const round = await GameRound.create(
      {
        userId: req.user.id,
        gameType: 'roulette',
        result,
        bets,            // valores em centavos, como validados
        totalBet,
        totalWin,
        balanceBefore,
        balanceAfter,
      },
      client
    );

    await client.query('COMMIT');

    res.json({
      roundId: round.id,
      result,
      totalBet,
      totalWin,
      balance: balanceAfter,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('roulette/spin:', err);
    res.status(500).json({ message: 'Erro ao processar a rodada.' });
  } finally {
    client.release();
  }
});

// ─── Histórico de rodadas do jogador ─────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;
    const rounds = await GameRound.findByUser(req.user.id, limit, offset);
    res.json({ rounds });
  } catch (err) {
    console.error('roulette/history:', err);
    res.status(500).json({ message: 'Erro ao buscar histórico.' });
  }
});

module.exports = router;
