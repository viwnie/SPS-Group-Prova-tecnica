import request from 'supertest';
import express from 'express';
import { User } from '../models/User.js';

jest.mock('../models/User.js');
jest.mock('../middlewares/authMiddleware.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, type: 'admin', email: 'admin@test.com' };
    next();
  }
}));

const app = express();
app.use(express.json());

import usersRouter from '../routes/users.js';
app.use('/users', usersRouter);

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  type: 'user'
};

describe('Users Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockReturnValue(mockUser);
    User.getAll.mockReturnValue([mockUser]);
    User.create.mockResolvedValue(mockUser);
    User.update.mockResolvedValue(mockUser);
    User.delete.mockReturnValue(true);
    User.emailExists.mockReturnValue(false);
    User.getAdminCount.mockReturnValue(2);
  });

  describe('GET /users/me', () => {
    it('should return user profile', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for non-existent user', async () => {
      User.findById.mockReturnValue(null);

      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado');
    });
  });

  describe('GET /users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /users', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
        type: 'user'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer token')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Usuário criado com sucesso');
      expect(User.create).toHaveBeenCalledWith({
        email: 'newuser@test.com',
        name: 'New User',
        password: 'password123',
        type: 'user'
      });
    });

    it('should return 409 for duplicate email', async () => {
      User.emailExists.mockReturnValue(true);

      const userData = {
        name: 'New User',
        email: 'existing@test.com',
        password: 'password123',
        type: 'user'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer token')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email já cadastrado');
    });

    it('should validate required fields', async () => {
      const userData = {
        name: '',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer token')
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com'
      };

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', 'Bearer token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(User.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 404 for non-existent user', async () => {
      User.findById.mockReturnValue(null);

      const response = await request(app)
        .put('/users/999')
        .set('Authorization', 'Bearer token')
        .send({
          name: 'Updated',
          email: 'updated@test.com'
        });

      expect(response.status).toBe(404);
    });

    it('should prevent removing last admin', async () => {
      User.getAdminCount.mockReturnValue(1);
      const adminUser = { ...mockUser, type: 'admin' };
      User.findById.mockReturnValue(adminUser);

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', 'Bearer token')
        .send({
          name: 'Admin User',
          email: 'admin@test.com',
          type: 'user'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Não é possível remover o último administrador do sistema.');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      const response = await request(app)
        .delete('/users/1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuário deletado com sucesso');
      expect(User.delete).toHaveBeenCalledWith(1);
    });

    it('should prevent admin from deleting own account if last admin', async () => {
      User.getAdminCount.mockReturnValue(1);
      const adminUser = { ...mockUser, type: 'admin' };
      User.findById.mockReturnValue(adminUser);

      const response = await request(app)
        .delete('/users/1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Não é possível deletar sua conta. Você é o último administrador do sistema.');
    });

    it('should return 404 for non-existent user', async () => {
      User.delete.mockReturnValue(false);

      const response = await request(app)
        .delete('/users/999')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });
  });
});
