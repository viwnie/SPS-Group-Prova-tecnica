import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se o usuário ainda existe e se seus privilégios não foram alterados
    const currentUser = User.findById(payload.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o tipo de usuário no token ainda corresponde ao tipo atual no banco
    if (currentUser.type !== payload.type) {
      return res.status(401).json({
        message: 'Token inválido. Seus privilégios foram alterados. Faça login novamente.',
        tokenInvalidated: true
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}