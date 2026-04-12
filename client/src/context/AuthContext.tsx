import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user.types';
import { getMe, login as loginService, logout as logoutService, register as registerService } from '@/services/auth.service';
import type { LoginData, RegisterData } from '@/services/auth.service';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on first load while we check the cookie

  // On mount, try to restore session from the HTTP-only cookie
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (data: LoginData) => {
    const loggedInUser = await loginService(data);
    setUser(loggedInUser);
  };

  const register = async (data: RegisterData) => {
    const newUser = await registerService(data);
    setUser(newUser);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — access auth state from any component.
 * Throws if used outside of AuthProvider.
 */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
