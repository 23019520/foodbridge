import api from './api';
import { PublicProfile, UpdateProfileInput, User } from '@/types/user.types';

export const getPublicProfile = async (id: string): Promise<PublicProfile> => {
  const res = await api.get(`/users/${id}`);
  return res.data.data.profile;
};

export const updateProfile = async (data: UpdateProfileInput): Promise<User> => {
  const res = await api.patch('/users/profile', data);
  return res.data.data.user;
};
