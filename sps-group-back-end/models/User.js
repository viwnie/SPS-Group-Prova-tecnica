import bcrypt from 'bcrypt';
import { usersDB, findUserByEmail, findUserById, generateUserId } from '../config/database.js';

export class User {
  static async create({ email, name, type, password }) {
    const passHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));
    const id = generateUserId();
    const user = { id, email, name, type, passHash };
    usersDB.push(user);
    return user;
  }

  static findByEmail(email) {
    return findUserByEmail(email);
  }

  static findById(id) {
    return findUserById(id);
  }

  static getAll() {
    return usersDB.map(({ passHash, ...rest }) => rest);
  }

  static async update(id, updates) {
    const user = findUserById(id);
    if (!user) return null;

    if (updates.email) user.email = updates.email;
    if (updates.name) user.name = updates.name;
    if (updates.type) user.type = updates.type;
    if (updates.password) {
      user.passHash = await bcrypt.hash(updates.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));
    }

    return user;
  }

  static delete(id) {
    const index = usersDB.findIndex(user => user.id === id);
    if (index === -1) return false;
    usersDB.splice(index, 1);
    return true;
  }

  static emailExists(email, excludeId = null) {
    return usersDB.some(user =>
      user.email.toLowerCase() === email.toLowerCase() &&
      (!excludeId || user.id !== excludeId)
    );
  }

  static getAdminCount() {
    return usersDB.filter(user => user.type === 'admin').length;
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.passHash);
  }
}
