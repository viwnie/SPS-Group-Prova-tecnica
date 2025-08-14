import express from 'express';
import { body, param } from 'express-validator';
import { runValidation } from '../utils/validators.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { User } from '../models/User.js';

const router = express.Router();

function authorizeAdmin(req, res, next) {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem executar esta ação.' });
  }
  next();
}

router.get('/me', authenticate, (req, res) => {
  const user = User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  const { passHash, ...userData } = user;
  res.json(userData);
});

router.get('/', authenticate, authorizeAdmin, (req, res) => {
  const users = User.getAll();
  res.json(users);
});

router.post('/',
  authenticate,
  authorizeAdmin,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('type').isIn(['user', 'admin']).withMessage('Tipo deve ser "user" ou "admin"')
  ],
  runValidation,
  async (req, res) => {
    const { email, name, password, type } = req.body;

    if (User.emailExists(email)) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    try {
      const newUser = await User.create({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        password,
        type: type || 'user'
      });

      const { passHash: _, ...userData } = newUser;
      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: userData
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor ao criar usuário' });
    }
  }
);

router.put('/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID inválido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('type').optional().isIn(['user', 'admin']).withMessage('Tipo deve ser "user" ou "admin"')
  ],
  runValidation,
  async (req, res) => {
    const id = parseInt(req.params.id);
    const user = User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (req.user.type !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Você só pode editar seu próprio perfil.' });
    }

    const { email, name, password, type } = req.body;

    if (email && User.emailExists(email, id)) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const updates = {};
    if (email) updates.email = email;
    if (name) updates.name = name;
    if (password) updates.password = password;

    if (type !== undefined) {
      if (req.user.type !== 'admin') {
        return res.status(403).json({
          message: 'Apenas administradores podem alterar o tipo de usuário.'
        });
      }

      if (type !== 'admin' && user.type === 'admin') {
        const adminCount = User.getAdminCount();
        if (adminCount <= 1) {
          return res.status(403).json({
            message: 'Não é possível remover o último administrador do sistema.'
          });
        }
      }

      if (req.user.id === id && type !== 'admin' && user.type === 'admin') {
        updates.type = type;

        try {
          const updatedUser = await User.update(id, updates);

          return res.status(200).json({
            message: 'Privilégios de administrador removidos com sucesso. Faça login novamente para continuar.',
            tokenInvalidated: true,
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              name: updatedUser.name,
              type: updatedUser.type
            }
          });
        } catch (error) {
          return res.status(500).json({ message: 'Erro ao atualizar usuário' });
        }
      }

      updates.type = type;
    }

    try {
      const updatedUser = await User.update(id, updates);
      res.json({ user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, type: updatedUser.type } });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
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

    if (req.user.id === id) {
      if (req.user.type === 'admin') {
        const adminCount = User.getAdminCount();
        if (adminCount <= 1) {
          return res.status(403).json({
            message: 'Não é possível deletar sua conta. Você é o último administrador do sistema.'
          });
        }
      }
    } else {
      if (req.user.type !== 'admin') {
        return res.status(403).json({ message: 'Você só pode deletar sua própria conta.' });
      }
    }

    const success = User.delete(id);
    if (!success) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  }
);

export default router;
