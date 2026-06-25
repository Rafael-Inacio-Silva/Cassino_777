const { Router } = require('express');
const { body } = require('express-validator');
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);

// Crédito de saldo de demonstração (sem pagamento real).
router.post('/deposit', [
  body('amount').isFloat({ min: 1 }).withMessage('Valor inválido.'),
], walletController.deposit);

module.exports = router;
