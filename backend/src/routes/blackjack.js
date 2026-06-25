const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const GameRound = require('../models/GameRound');
const bj = require('../services/blackjackEngine');

const router = Router();
router.use(authMiddleware);

const MIN_BET = parseFloat(process.env.BLACKJACK_MIN_BET || '1');
const MAX_BET = parseFloat(process.env.BLACKJACK_MAX_BET || '5000');
const toCents = (v) => Math.round(v * 100);
const toReais = (c) => c / 100;

// ─── View pública do estado (esconde o shoe e a carta oculta do dealer) ──────
function publicView(round, balance) {
  const st = round.state;
  const over = st.phase === 'over';
  const dealerCards = over ? st.dealer : [st.dealer[0]];

  return {
    roundId: round.id,
    phase: st.phase,
    baseBet: toReais(st.baseBet),
    balance: balance != null ? toReais(balance) : undefined,
    insurance: { offered: !!st.insurance.offered, taken: st.insurance.bet > 0 },
    activeHand: st.active,
    hands: st.hands.map((h, i) => ({
      cards: h.cards,
      total: bj.handTotal(h.cards),
      bet: toReais(h.bet),
      doubled: !!h.doubled,
      busted: bj.isBust(h.cards),
      blackjack: st.hands.length === 1 && !h.fromSplit && bj.isBlackjack(h.cards),
      done: !!h.done,
      active: i === st.active && st.phase === 'player',
    })),
    dealer: {
      cards: dealerCards,
      hole: !over,
      total: over ? bj.handTotal(st.dealer) : bj.cardPoints(st.dealer[0]),
    },
    result: over ? st.outcome : null,
  };
}

async function loadActiveRound(client, userId) {
  const { rows } = await client.query(
    `SELECT * FROM blackjack_rounds WHERE user_id = $1 AND status = 'active' FOR UPDATE`,
    [userId]
  );
  return rows[0] || null;
}

async function getBalanceCents(client, userId) {
  const { rows } = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
  return rows[0] ? toCents(parseFloat(rows[0].balance)) : null;
}

async function setBalanceCents(client, userId, cents) {
  await client.query('UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2',
    [toReais(cents).toFixed(2), userId]);
}

async function saveState(client, roundId, state, extra = {}) {
  const fields = ['state = $2'];
  const params = [roundId, JSON.stringify(state)];
  for (const [k, v] of Object.entries(extra)) {
    params.push(v);
    fields.push(`${k} = $${params.length}`);
  }
  await client.query(`UPDATE blackjack_rounds SET ${fields.join(', ')} WHERE id = $1`, params);
}

// Resolve blackjacks naturais (no deal ou após decisão de seguro)
function resolveNatural(st) {
  const hand = st.hands[0];
  const pBJ = bj.isBlackjack(hand.cards);
  const dBJ = bj.isBlackjack(st.dealer);
  const insBet = st.insurance.bet;
  const insReturn = dBJ && insBet > 0 ? insBet * 3 : 0; // stake + 2:1

  let handReturn = 0;
  let outcome;
  if (pBJ && dBJ)      { handReturn = hand.bet; outcome = 'push'; }
  else if (pBJ)        { handReturn = hand.bet + Math.floor(hand.bet * 1.5); outcome = 'blackjack'; }
  else                 { handReturn = 0; outcome = 'dealer_blackjack'; }

  st.phase = 'over';
  st.outcome = {
    outcome,
    insurance: insReturn > 0 ? 'won' : (insBet > 0 ? 'lost' : null),
    totalReturnCents: handReturn + insReturn,
    hands: [{ total: bj.handTotal(hand.cards), result: outcome }],
  };
  return handReturn + insReturn;
}

// Avança para a próxima mão pendente; se todas concluídas, joga o dealer e liquida.
// Retorna o RETORNO total em centavos a creditar (0 enquanto a rodada não termina).
function advance(st) {
  // procura próxima mão não concluída
  for (let i = st.active + 1; i < st.hands.length; i++) {
    if (!st.hands[i].done) {
      st.active = i;
      const t = bj.handTotal(st.hands[i].cards);
      if (t >= 21) { st.hands[i].done = true; return advance(st); } // auto-stand em 21
      return 0;
    }
  }
  return finish(st);
}

// Joga o dealer (se necessário) e liquida todas as mãos. Retorna retorno total em centavos.
function finish(st) {
  const anyAlive = st.hands.some((h) => !bj.isBust(h.cards));
  if (anyAlive) bj.playDealer(st.dealer, st.shoe);

  let totalReturn = 0;
  const handResults = st.hands.map((h) => {
    const ret = bj.settleHand(h.cards, st.dealer, h.bet, false);
    totalReturn += ret;
    const p = bj.handTotal(h.cards);
    const d = bj.handTotal(st.dealer);
    let result;
    if (p > 21) result = 'bust';
    else if (d > 21) result = 'win';
    else if (p > d) result = 'win';
    else if (p === d) result = 'push';
    else result = 'lose';
    return { total: p, result };
  });

  st.phase = 'over';
  st.outcome = {
    outcome: st.hands.length > 1 ? 'split' : handResults[0].result,
    totalReturnCents: totalReturn,
    hands: handResults,
  };
  return totalReturn;
}

// Persiste o término: credita retorno, marca finished e grava em game_rounds
async function commitFinish(client, round, st, balanceBeforeCents, totalBetCents, returnCents) {
  const balanceAfterCents = balanceBeforeCents + returnCents;
  if (returnCents > 0) await setBalanceCents(client, round.user_id, balanceAfterCents);

  await saveState(client, round.id, st, {
    status: 'finished',
    total_bet: toReais(totalBetCents).toFixed(2),
    total_win: toReais(returnCents).toFixed(2),
    outcome: st.outcome.outcome,
    balance_after: toReais(balanceAfterCents).toFixed(2),
  });

  await GameRound.create({
    userId: round.user_id,
    gameType: 'blackjack',
    result: bj.handTotal(st.dealer),
    bets: { baseBet: st.baseBet, insurance: st.insurance.bet, hands: st.hands.map((h) => ({ bet: h.bet, cards: h.cards })), dealer: st.dealer, outcome: st.outcome },
    totalBet: toReais(totalBetCents),
    totalWin: toReais(returnCents),
    balanceBefore: toReais(round.balance_before != null ? toCents(parseFloat(round.balance_before)) : balanceBeforeCents),
    balanceAfter: toReais(balanceAfterCents),
  }, client);

  return balanceAfterCents;
}

// ─── POST /deal — inicia uma rodada ──────────────────────────────────────────
router.post('/deal', async (req, res) => {
  const amount = parseFloat(req.body?.amount);
  if (!Number.isFinite(amount) || amount < MIN_BET || amount > MAX_BET) {
    return res.status(400).json({ message: `Aposta entre R$${MIN_BET.toFixed(2)} e R$${MAX_BET.toFixed(2)}.` });
  }
  const betCents = toCents(amount);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: urows } = await client.query(
      'SELECT balance, email_verified, cpf FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
    const user = urows[0];
    if (!user) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Usuário não encontrado.' }); }
    if (!user.email_verified || !user.cpf) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Confirme seu e-mail e complete o perfil para jogar.' });
    }
    if (await loadActiveRound(client, req.user.id)) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Você já tem uma rodada em andamento.' });
    }

    const balanceBeforeCents = toCents(parseFloat(user.balance));
    if (balanceBeforeCents < betCents) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Saldo insuficiente.' });
    }

    // Debita a aposta e monta o estado inicial
    const afterBetCents = balanceBeforeCents - betCents;
    await setBalanceCents(client, req.user.id, afterBetCents);

    const shoe = bj.freshShoe();
    const player = [bj.drawCard(shoe), bj.drawCard(shoe)];
    const dealer = [bj.drawCard(shoe), bj.drawCard(shoe)];
    const st = {
      shoe, dealer,
      hands: [{ cards: player, bet: betCents, doubled: false, done: false, fromSplit: false }],
      active: 0,
      insurance: { offered: false, bet: 0 },
      baseBet: betCents,
      phase: 'player',
      outcome: null,
    };

    const pBJ = bj.isBlackjack(player);
    const dealerAce = dealer[0].value === 'A';

    const { rows: ins } = await client.query(
      `INSERT INTO blackjack_rounds (user_id, status, state, base_bet, total_bet, balance_before)
       VALUES ($1,'active',$2,$3,$3,$4) RETURNING *`,
      [req.user.id, JSON.stringify(st), toReais(betCents).toFixed(2), toReais(balanceBeforeCents).toFixed(2)]
    );
    const round = ins[0];

    let totalBetCents = betCents;
    let balanceCents = afterBetCents;

    if (dealerAce && !pBJ) {
      // Oferece seguro antes de qualquer resolução
      st.phase = 'insurance';
      st.insurance.offered = true;
      await saveState(client, round.id, st);
    } else if (pBJ || bj.isBlackjack(dealer)) {
      const ret = resolveNatural(st);
      balanceCents = await commitFinish(client, round, st, afterBetCents, totalBetCents, ret);
    } else {
      await saveState(client, round.id, st);
    }

    await client.query('COMMIT');
    res.status(201).json(publicView({ ...round, state: st }, balanceCents));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('blackjack/deal:', err);
    res.status(500).json({ message: 'Erro ao iniciar a rodada.' });
  } finally {
    client.release();
  }
});

// Wrapper para ações sobre a rodada ativa (hit/stand/double/split/insurance)
function action(handler) {
  return async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const round = await loadActiveRound(client, req.user.id);
      if (!round) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Nenhuma rodada em andamento.' }); }
      const balanceCents = await getBalanceCents(client, req.user.id);
      const out = await handler({ req, client, round, st: round.state, balanceCents });
      await client.query('COMMIT');
      res.json(out);
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.userMessage) return res.status(err.status || 400).json({ message: err.userMessage });
      console.error('blackjack/action:', err);
      res.status(500).json({ message: 'Erro ao processar a jogada.' });
    } finally {
      client.release();
    }
  };
}

const fail = (msg, status = 400) => { const e = new Error(msg); e.userMessage = msg; e.status = status; return e; };

// ─── POST /insurance { accept } ──────────────────────────────────────────────
router.post('/insurance', action(async ({ req, client, round, st, balanceCents }) => {
  if (st.phase !== 'insurance') throw fail('Seguro não disponível agora.');
  let totalBetCents = toCents(parseFloat(round.total_bet));
  let balance = balanceCents;

  if (req.body?.accept) {
    const insCents = Math.floor(st.baseBet / 2);
    if (balance < insCents) throw fail('Saldo insuficiente para o seguro.');
    balance -= insCents;
    await setBalanceCents(client, req.user.id, balance);
    st.insurance.bet = insCents;
    totalBetCents += insCents;
    await client.query('UPDATE blackjack_rounds SET total_bet = $2 WHERE id = $1',
      [round.id, toReais(totalBetCents).toFixed(2)]);
  }
  st.insurance.offered = false;

  const pBJ = bj.isBlackjack(st.hands[0].cards);
  const dBJ = bj.isBlackjack(st.dealer);
  if (pBJ || dBJ) {
    const ret = resolveNatural(st);
    balance = await commitFinish(client, round, st, balance, totalBetCents, ret);
    return publicView({ ...round, state: st }, balance);
  }
  st.phase = 'player';
  await saveState(client, round.id, st);
  return publicView({ ...round, state: st }, balance);
}));

// ─── POST /hit ───────────────────────────────────────────────────────────────
router.post('/hit', action(async ({ client, round, st, balanceCents }) => {
  if (st.phase !== 'player') throw fail('Não é possível pedir carta agora.');
  const hand = st.hands[st.active];
  hand.cards.push(bj.drawCard(st.shoe));

  const t = bj.handTotal(hand.cards);
  if (t >= 21) {
    hand.done = true;
    const totalBetCents = toCents(parseFloat(round.total_bet));
    const ret = advance(st);
    if (st.phase === 'over') {
      const bal = await commitFinish(client, round, st, balanceCents, totalBetCents, ret);
      return publicView({ ...round, state: st }, bal);
    }
  }
  await saveState(client, round.id, st);
  return publicView({ ...round, state: st }, balanceCents);
}));

// ─── POST /stand ─────────────────────────────────────────────────────────────
router.post('/stand', action(async ({ client, round, st, balanceCents }) => {
  if (st.phase !== 'player') throw fail('Não é possível parar agora.');
  st.hands[st.active].done = true;
  const totalBetCents = toCents(parseFloat(round.total_bet));
  const ret = advance(st);
  if (st.phase === 'over') {
    const bal = await commitFinish(client, round, st, balanceCents, totalBetCents, ret);
    return publicView({ ...round, state: st }, bal);
  }
  await saveState(client, round.id, st);
  return publicView({ ...round, state: st }, balanceCents);
}));

// ─── POST /double ────────────────────────────────────────────────────────────
router.post('/double', action(async ({ req, client, round, st, balanceCents }) => {
  if (st.phase !== 'player') throw fail('Não é possível dobrar agora.');
  if (st.hands.length !== 1) throw fail('Dobra indisponível após split.');
  const hand = st.hands[st.active];
  if (hand.cards.length !== 2 || hand.doubled) throw fail('Só é possível dobrar nas duas primeiras cartas.');
  if (balanceCents < hand.bet) throw fail('Saldo insuficiente para dobrar.');

  let balance = balanceCents - hand.bet;
  await setBalanceCents(client, req.user.id, balance);
  const totalBetCents = toCents(parseFloat(round.total_bet)) + hand.bet;
  hand.bet *= 2;
  hand.doubled = true;
  hand.cards.push(bj.drawCard(st.shoe));
  hand.done = true;

  const ret = advance(st);
  if (st.phase === 'over') {
    balance = await commitFinish(client, round, st, balance, totalBetCents, ret);
    return publicView({ ...round, state: st }, balance);
  }
  await client.query('UPDATE blackjack_rounds SET total_bet = $2 WHERE id = $1',
    [round.id, toReais(totalBetCents).toFixed(2)]);
  await saveState(client, round.id, st);
  return publicView({ ...round, state: st }, balance);
}));

// ─── POST /split ─────────────────────────────────────────────────────────────
router.post('/split', action(async ({ req, client, round, st, balanceCents }) => {
  if (st.phase !== 'player') throw fail('Não é possível dividir agora.');
  if (st.hands.length !== 1) throw fail('Você já dividiu esta mão.');
  const hand = st.hands[0];
  if (!bj.canSplitPair(hand.cards)) throw fail('As cartas não permitem split.');
  if (balanceCents < hand.bet) throw fail('Saldo insuficiente para dividir.');

  const balance = balanceCents - hand.bet;
  await setBalanceCents(client, req.user.id, balance);
  const totalBetCents = toCents(parseFloat(round.total_bet)) + hand.bet;
  const betCents = hand.bet;

  const isAces = hand.cards[0].value === 'A';
  const c0 = hand.cards[0];
  const c1 = hand.cards[1];
  const hand1 = { cards: [c0, bj.drawCard(st.shoe)], bet: betCents, doubled: false, done: false, fromSplit: true };
  const hand2 = { cards: [c1, bj.drawCard(st.shoe)], bet: betCents, doubled: false, done: false, fromSplit: true };
  // Split de Ases: uma carta por mão e encerra (regra padrão)
  if (isAces) { hand1.done = true; hand2.done = true; }
  st.hands = [hand1, hand2];
  st.active = 0;

  await client.query('UPDATE blackjack_rounds SET total_bet = $2 WHERE id = $1',
    [round.id, toReais(totalBetCents).toFixed(2)]);

  if (isAces) {
    // ambas concluídas → joga dealer e liquida
    const ret = finish(st);
    const bal = await commitFinish(client, round, st, balance, totalBetCents, ret);
    return publicView({ ...round, state: st }, bal);
  }
  // auto-stand se a primeira mão já fez 21
  if (bj.handTotal(hand1.cards) >= 21) {
    hand1.done = true;
    const ret = advance(st);
    if (st.phase === 'over') {
      const bal = await commitFinish(client, round, st, balance, totalBetCents, ret);
      return publicView({ ...round, state: st }, bal);
    }
  }
  await saveState(client, round.id, st);
  return publicView({ ...round, state: st }, balance);
}));

// ─── GET /active — retoma rodada em andamento (refresh do navegador) ──────────
router.get('/active', async (req, res) => {
  const client = await pool.connect();
  try {
    const round = await loadActiveRound(client, req.user.id);
    const { rows } = await client.query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
    const balanceCents = rows[0] ? toCents(parseFloat(rows[0].balance)) : null;
    res.json({ round: round ? publicView(round, balanceCents) : null, balance: balanceCents != null ? toReais(balanceCents) : null });
  } catch (err) {
    console.error('blackjack/active:', err);
    res.status(500).json({ message: 'Erro ao buscar rodada.' });
  } finally {
    client.release();
  }
});

module.exports = router;
