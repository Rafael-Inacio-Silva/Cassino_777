const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = Router();

// ─── Cadastro e-mail/senha ────────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('cpf').notEmpty().withMessage('CPF é obrigatório.'),
  body('birthDate').isDate({ format: 'YYYY-MM-DD' }).withMessage('Data de nascimento inválida.'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
], authController.register);

// ─── Login e-mail/senha ───────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password').notEmpty().withMessage('Senha é obrigatória.'),
], authController.login);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.post('/google', authController.googleAuth);

// ─── Verificação de e-mail ────────────────────────────────────────────────────
router.get('/verify-email/:token', authController.verifyEmail);

// ─── Rotas autenticadas ───────────────────────────────────────────────────────
router.get('/me', authMiddleware, authController.me);
router.post('/resend-verification', authMiddleware, authController.resendVerification);
router.post('/complete-profile', authMiddleware, authController.completeProfile);

module.exports = router;
