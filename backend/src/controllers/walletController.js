const pool = require('../config/database');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Projeto de portfólio/demonstração: não há integração bancária nem dinheiro
// real. O "depósito" apenas credita um saldo fictício para testar os jogos.
const MIN_DEPOSIT = 1;
const MAX_DEPOSIT = 10000;

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (err) {
    console.error('getBalance:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// Crédito de saldo de demonstração — instantâneo, sem pagamento real.
exports.deposit = async (req, res) => {
  const amount = parseFloat(req.body.amount);
  if (!amount || amount < MIN_DEPOSIT || amount > MAX_DEPOSIT) {
    return res.status(400).json({ message: `Valor entre R$${MIN_DEPOSIT} e R$${MAX_DEPOSIT}.` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ref = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
    const tx = await Transaction.create({
      userId:      req.user.id,
      type:        'deposit',
      amount,
      description: `Crédito de demonstração #${ref}`,
    });
    await Transaction.complete(tx.id, client);

    const user = await User.updateBalance(req.user.id, amount, client);
    if (!user) throw new Error('Falha ao atualizar saldo.');

    await client.query('COMMIT');
    res.json({ message: 'Saldo de demonstração adicionado!', balance: user.balance, amount });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('deposit:', err);
    res.status(500).json({ message: 'Erro ao adicionar saldo.' });
  } finally {
    client.release();
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 20, 50);
    const offset = parseInt(req.query.offset) || 0;
    const txs = await Transaction.findByUser(req.user.id, limit, offset);
    res.json({ transactions: txs });
  } catch (err) {
    console.error('getTransactions:', err);
    res.status(500).json({ message: 'Erro ao buscar transações.' });
  }
};
