import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { body, param } from 'express-validator';
import { runValidation } from '../utils/validators.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { usersDB } from './authController.js';

const router = express.Router();
dotenv.config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

function findUserById(id) {
  return usersDB.find(user => user.id === id);
}

function authorizeAdmin(req, res, next) {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem executar esta ação.' });
  }
  next();
}

router.get('/', authenticate, authorizeAdmin, (req, res) => {
  const users = usersDB.map(({ passHash, ...rest }) => rest);
  res.json(users);
});


router.put('/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID inválido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
  ],
  runValidation,
  async (req, res) => {
    const id = parseInt(req.params.id);
    const user = findUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (req.user.type !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Você só pode editar seu próprio perfil.' });
    }

    const { email, name, password, type } = req.body;

    if (email && usersDB.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id)) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    if (email) user.email = email;
    if (name) user.name = name;

    if (req.user.type === 'admin' && type) {
      user.type = type;
    }

    if (password) {
      user.passHash = await bcrypt.hash(password, saltRounds);
    }

    res.json({ user: { id: user.id, email: user.email, name: user.name, type: user.type } });
  }
);


router.delete('/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID inválido')
  ],
  runValidation,
  async (req, res) => {
    const id = parseInt(req.params.id);
    const index = usersDB.findIndex(user => user.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (req.user.type !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Você só pode deletar sua própria conta.' });
    }

    usersDB.splice(index, 1);
    res.json({ message: 'Usuário deletado com sucesso' });
  }
);

export default router;
