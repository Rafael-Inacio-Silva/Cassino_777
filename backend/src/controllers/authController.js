const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const { validateCPF } = require('../services/cpfService');
const { sendVerificationEmail } = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const generateVerifyToken = () => crypto.randomBytes(32).toString('hex');

function calcAge(birthDate) {
  const today = new Date();
  const born = new Date(birthDate);
  let age = today.getFullYear() - born.getFullYear();
  const m = today.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
  return age;
}

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    balance: u.balance,
    emailVerified: u.email_verified,
    profileComplete: !!(u.cpf && u.birth_date),
    isAdmin: !!u.is_admin,
  };
}

// ─── Registro com e-mail / senha ────────────────────────────────────────────

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { name, email, cpf, password, birthDate } = req.body;

  // Validar CPF (dígitos verificadores)
  const cleanCpf = cpf.replace(/\D/g, '');
  if (!validateCPF(cleanCpf))
    return res.status(400).json({ message: 'CPF inválido. Verifique os números digitados.' });

  // Verificar maioridade (18+)
  if (!birthDate || calcAge(birthDate) < 18)
    return res.status(400).json({ message: 'É necessário ter 18 anos ou mais para se cadastrar.' });

  try {
    if (await User.emailExists(email))
      return res.status(400).json({ message: 'E-mail já cadastrado.' });

    if (await User.cpfExists(cleanCpf))
      return res.status(400).json({ message: 'CPF já cadastrado.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      cpf: cleanCpf,
      password: passwordHash,
      birthDate,
      emailVerified: false,
    });

    // Gera token de verificação de e-mail (expira em 24h)
    const verifyToken = generateVerifyToken();
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await User.setVerificationToken(user.id, verifyToken, expires);

    // Envia e-mail de verificação (em background — não bloqueia a resposta)
    sendVerificationEmail(email, name, verifyToken).catch((err) =>
      console.error('Erro ao enviar e-mail de verificação:', err.message)
    );

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Conta criada! Verifique seu e-mail para ativar o acesso.',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// ─── Login com e-mail / senha ────────────────────────────────────────────────

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user || !user.password_hash)
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });

    const token = generateToken(user.id);

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// ─── Login / Cadastro com Google ─────────────────────────────────────────────

exports.googleAuth = async (req, res) => {
  const { credential } = req.body;
  if (!credential)
    return res.status(400).json({ message: 'Token Google ausente.' });

  if (!process.env.GOOGLE_CLIENT_ID)
    return res.status(503).json({ message: 'Login com Google não configurado.' });

  try {
    // Verifica o token JWT do Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, email_verified } = payload;

    // Procura usuário existente pelo google_id ou e-mail
    let user = await User.findByGoogleId(googleId);

    if (!user) {
      // Pode ser que o usuário já exista por e-mail (cadastro manual anterior)
      const existing = await User.findByEmail(email);
      if (existing) {
        // Vincula google_id à conta existente
        await require('../config/database').query(
          'UPDATE users SET google_id = $1, email_verified = true, updated_at = NOW() WHERE id = $2',
          [googleId, existing.id]
        );
        user = await User.findById(existing.id);
      } else {
        // Cria novo usuário (sem CPF/birth_date — precisará completar)
        user = await User.create({
          name,
          email,
          googleId,
          emailVerified: !!email_verified,
        });
      }
    }

    const token = generateToken(user.id);
    const pub = publicUser(user);

    res.json({
      message: 'Login com Google realizado!',
      token,
      user: pub,
      needsCompletion: !pub.profileComplete,
    });
  } catch (error) {
    console.error('Erro no Google Auth:', error);
    res.status(401).json({ message: 'Token Google inválido ou expirado.' });
  }
};

// ─── Verificação de e-mail ────────────────────────────────────────────────────

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findByVerificationToken(token);
    if (!user)
      return res.status(400).json({ message: 'Link inválido ou expirado. Solicite um novo.' });

    await User.setEmailVerified(user.id);

    res.json({ message: 'E-mail confirmado com sucesso! Você já pode jogar.' });
  } catch (error) {
    console.error('Erro na verificação de e-mail:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// ─── Reenviar verificação ─────────────────────────────────────────────────────

exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    if (user.email_verified)
      return res.status(400).json({ message: 'E-mail já verificado.' });

    const verifyToken = generateVerifyToken();
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await User.setVerificationToken(user.id, verifyToken, expires);

    sendVerificationEmail(user.email, user.name, verifyToken).catch((err) =>
      console.error('Erro ao reenviar e-mail:', err.message)
    );

    res.json({ message: 'E-mail de verificação reenviado.' });
  } catch (error) {
    console.error('Erro ao reenviar verificação:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// ─── Completar perfil (Google users) ─────────────────────────────────────────

exports.completeProfile = async (req, res) => {
  const { cpf, birthDate } = req.body;

  if (!cpf || !birthDate)
    return res.status(400).json({ message: 'CPF e data de nascimento são obrigatórios.' });

  const cleanCpf = cpf.replace(/\D/g, '');
  if (!validateCPF(cleanCpf))
    return res.status(400).json({ message: 'CPF inválido.' });

  if (calcAge(birthDate) < 18)
    return res.status(400).json({ message: 'É necessário ter 18 anos ou mais.' });

  try {
    if (await User.cpfExists(cleanCpf)) {
      // Verifica se o CPF pertence ao próprio usuário (caso de re-submit)
      const existing = await require('../config/database').query(
        'SELECT id FROM users WHERE cpf = $1', [cleanCpf]
      );
      if (existing.rows[0]?.id !== req.user.id)
        return res.status(400).json({ message: 'CPF já cadastrado.' });
    }

    const user = await User.completeProfile(req.user.id, {
      cpf: cleanCpf,
      birthDate,
    });

    res.json({
      message: 'Perfil completado com sucesso!',
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Erro ao completar perfil:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// ─── /me ─────────────────────────────────────────────────────────────────────

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Erro em /me:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
};
