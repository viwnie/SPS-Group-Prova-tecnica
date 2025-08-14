import { User } from '../models/User.js';

export async function initializeAdmin() {
  try {
    const adminExists = User.findByEmail('admin@sps.com');
    if (!adminExists) {
      await User.create({
        email: 'admin@sps.com',
        name: 'Admin',
        type: 'admin',
        password: 'admin123'
      });
      console.log('✅ Usuário admin pré-cadastrado!');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}
