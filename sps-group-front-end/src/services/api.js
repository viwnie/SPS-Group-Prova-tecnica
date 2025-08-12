import axios from 'axios'
import { obterToken } from './auth'

export const api = axios.create({
  baseURL: 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(async (config) => {
  const token = obterToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao fazer login' };
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao fazer registro' };
  }
}