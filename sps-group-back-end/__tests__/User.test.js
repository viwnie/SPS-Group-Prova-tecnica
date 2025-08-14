import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import { usersDB } from '../config/database.js';

jest.mock('bcrypt');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bcrypt.hash.mockResolvedValue('hashedPassword123');

    usersDB.length = 0;
    usersDB.push({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      type: 'user',
      passHash: 'hashedPassword123'
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        type: 'user'
      };

      const result = await User.create(userData);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('newuser@example.com');
      expect(result.name).toBe('New User');
      expect(result.type).toBe('user');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should create admin user successfully', async () => {
      const userData = {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin123',
        type: 'admin'
      };

      const result = await User.create(userData);

      expect(result.type).toBe('admin');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', () => {
      const user = User.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should return undefined for non-existent email', () => {
      const user = User.findByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find user by id', () => {
      const user = User.findById(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('should return undefined for non-existent id', () => {
      const user = User.findById(999);
      expect(user).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all users without password hash', () => {
      const users = User.getAll();
      expect(Array.isArray(users)).toBe(true);
      users.forEach(user => {
        expect(user).not.toHaveProperty('passHash');
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const result = await User.update(1, updates);
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
    });

    it('should update password with hash', async () => {
      const updates = {
        password: 'newpassword123'
      };

      await User.update(1, updates);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', () => {
      const result = User.delete(1);
      expect(result).toBe(true);
      expect(usersDB.length).toBe(0);
    });

    it('should return false for non-existent user', () => {
      const result = User.delete(999);
      expect(result).toBe(false);
    });
  });

  describe('emailExists', () => {
    it('should return true for existing email', () => {
      const exists = User.emailExists('test@example.com');
      expect(exists).toBe(true);
    });

    it('should return false for non-existing email', () => {
      const exists = User.emailExists('nonexistent@example.com');
      expect(exists).toBe(false);
    });

    it('should exclude current user when checking email', () => {
      const exists = User.emailExists('test@example.com', 1);
      expect(exists).toBe(false);
    });
  });

  describe('getAdminCount', () => {
    it('should return correct admin count', () => {
      const count = User.getAdminCount();
      expect(typeof count).toBe('number');
      expect(count).toBe(0);
    });

    it('should count admin users correctly', async () => {
      await User.create({
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin123',
        type: 'admin'
      });

      const count = User.getAdminCount();
      expect(count).toBe(1);
    });
  });

  describe('verifyPassword', () => {
    it('should verify password correctly', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const user = { passHash: 'hashedPassword123' };

      const result = await User.verifyPassword(user, 'password123');
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
    });

    it('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const user = { passHash: 'hashedPassword123' };

      const result = await User.verifyPassword(user, 'wrongpassword');
      expect(result).toBe(false);
    });
  });
});
