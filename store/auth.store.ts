import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'staff';
  name: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rmb_token', token);
          localStorage.setItem('rmb_refresh', refreshToken);
          // Set cookie for middleware
          document.cookie = `rmb_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({ token, refreshToken, user });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rmb_token');
          localStorage.removeItem('rmb_refresh');
          document.cookie = 'rmb_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        set({ token: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'rmb-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
