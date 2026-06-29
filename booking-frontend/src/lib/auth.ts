import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  isActive: boolean;
}

// Save tokens and user
export const saveAuth = (accessToken: string, refreshToken: string, user: User) => {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1 / 24 }); // 1 hour
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 }); // 7 days
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get access token
export const getToken = (): string | null => Cookies.get(ACCESS_TOKEN_KEY) ?? null;

// Get refresh token
export const getRefreshToken = (): string | null => Cookies.get(REFRESH_TOKEN_KEY) ?? null;

// Get current user
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Clear auth
export const clearAuth = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if authenticated
export const isAuthenticated = (): boolean => !!getToken();

// Check user role
export const hasRole = (role: string | string[]): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  if (Array.isArray(role)) return role.includes(user.role);
  return user.role === role;
};

// Logout from server
export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  clearAuth();
};