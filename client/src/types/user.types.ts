export type UserRole = 'consumer' | 'producer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  area: string | null;
  bio: string | null;
  business_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  business_name: string | null;
  bio: string | null;
  area: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  area?: string;
  bio?: string;
  business_name?: string;
  avatar_url?: string;
}
