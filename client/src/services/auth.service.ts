import api from './api';
import { User } from '@/types/user.types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'consumer' | 'producer';
  phone?: string;
  area?: string;
  business_name?: string;
  bio?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<User> => {
  const res = await api.post('/auth/register', data);
  return res.data.data.user;
};

export const login = async (data: LoginData): Promise<User> => {
  const res = await api.post('/auth/login', data);
  return res.data.data.user;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getMe = async (): Promise<User> => {
  const res = await api.get('/auth/me');
  return res.data.data.user;
};
