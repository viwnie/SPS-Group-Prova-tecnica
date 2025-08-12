import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { body } from 'express-validator';
import { runValidation } from '../utils/validators.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();
dotenv.config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

const usersDB = [];

function findUserByEmail(email) {
  return usersDB.find(user => user.email.toLowerCase() === email.toLowerCase());
}

async function register({ email, name, type, password }) {
  const passHash = await bcrypt.hash(password, saltRounds);
  const id = usersDB.length ? usersDB[usersDB.length - 1].id + 1 : 1;
  const user = { id, email, name, type, passHash };
  usersDB.push(user);
  return user;
}

(async () => {
  if (!findUserByEmail('admin@sps.com')) {
    await register({
      email: 'admin@sps.com',
      name: 'Admin',
      type: 'admin',
      password: 'admin123'
    });
    console.log('✅ Usuário admin pré-cadastrado!');
  }
})();

router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
  ],
  runValidation,
  async (req, res) => {
    const { email, password } = req.body;

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(password, user.passHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const tokenPayload = { id: user.id, email: user.email, type: user.type };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, type: user.type }
    });
  }
);

router.post('/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
  ],
  runValidation,
  async (req, res) => {
    const { email, name, password } = req.body;

    if (usersDB.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    try {
      const user = await register({ email, name, type: 'user', password });
      res.status(201).json({
        user: { id: user.id, email: user.email, name: user.name, type: 'user' }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar usuário' });
    }
  }
);

router.post('/admin/register',
  authenticate,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('type').isIn(['user', 'admin']).withMessage('Tipo inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
  ],
  runValidation,
  async (req, res) => {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem criar usuários admin.' });
    }

    const { email, name, type, password } = req.body;

    if (usersDB.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    try {
      const user = await register({ email, name, type, password });
      res.status(201).json({
        user: { id: user.id, email: user.email, name: user.name, type: user.type }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar usuário' });
    }
  }
);

export default router;
export { usersDB, register };
