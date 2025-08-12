import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { body } from 'express-validator';
import { runValidation } from '../utils/validators.js';
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
    await register({ email: 'admin@sps.com', name: 'Admin', type: 'admin', password: 'admin123' });
    console.log('Usuário admin pré-cadastrado!');
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
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, type: user.type } });
  }
)

export default router;
export { usersDB, register };
