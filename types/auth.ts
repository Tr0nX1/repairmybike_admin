export interface User {
  id: number;
  email: string;
  role: 'admin' | 'staff';
  name: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
}

export interface LoginRequest {
  email?: string;
  password?: string;
  method?: 'email' | 'sms';
  identifier?: string;
  otp_code?: string;
}

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  user: User;
}

export interface TokenRefreshResponse {
  token: string;
}
