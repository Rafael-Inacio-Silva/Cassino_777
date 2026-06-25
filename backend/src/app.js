require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes     = require('./routes/auth');
const walletRoutes   = require('./routes/wallet');
const adminRoutes    = require('./routes/admin');
const rouletteRoutes = require('./routes/roulette');
const blackjackRoutes = require('./routes/blackjack');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/wallet',   walletRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/roulette', rouletteRoutes);
app.use('/api/blackjack', blackjackRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'inacios777-api', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor inacios777 rodando na porta ${PORT}`);
  console.log('ℹ️  Build de demonstração (portfólio) — saldo fictício, sem pagamentos reais.');
});

module.exports = app;
