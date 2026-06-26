import { useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/src/lib/api';
import {
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordCredentials,
  ResetPasswordCredentials,
  AuthResponse,
  User,
} from '@/src/types/auth.types';
import { useAuthStore } from '@/src/store/authStore';
import { saveAuth, clearAuth, getToken, getRefreshToken } from '@/src/lib/auth';

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setLoading, logout: storeLogout } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (publicRoutes.includes(pathname)) {
      setLoading(false);
      return;
    }

    const initializeAuth = () => {
      const token = getToken();
      const user: any = getCurrentUser();

      if (token && user) {
        setUser(user);
      } else {
        clearAuth();
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [pathname, setUser, setLoading]);

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      try {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        const { user, accessToken, refreshToken } = response.data;

        saveAuth(accessToken, refreshToken, user);
        setUser(user);
        toast.success(`Welcome back, ${user.email}!`);

        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (user.role === 'DOCTOR') {
          router.push('/doctor/profile');
        } else {
          router.push('/');
        }
      } catch (error) {
        // Error handled by axios interceptor
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading]
  );

  // Register
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      setLoading(true);
      try {
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        const { user, accessToken, refreshToken } = response.data;

        saveAuth(accessToken, refreshToken, user);
        setUser(user);
        toast.success('Registration successful!');

        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (user.role === 'DOCTOR') {
          router.push('/doctor/profile');
        } else {
          router.push('/');
        }
      } catch (error) {
        // Error handled by axios interceptor
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading]
  );

  // Logout
  const logout = useCallback(() => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Call logout endpoint if you have one
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    clearAuth();
    storeLogout();
    toast.success('Logged out successfully');
    router.push('/login');
  }, [router, storeLogout]);

  // Forgot password
  const forgotPassword = useCallback(
    async (credentials: ForgotPasswordCredentials) => {
      try {
        await api.post('/auth/forgot-password', credentials);
        toast.success('Password reset link sent to your email');
      } catch (error) {
        // Error handled by axios interceptor
      }
    },
    []
  );

  // Reset password
  const resetPassword = useCallback(
    async (credentials: ResetPasswordCredentials) => {
      try {
        await api.post('/auth/reset-password', credentials);
        toast.success('Password reset successful. Please login.');
        router.push('/login');
      } catch (error) {
        // Error handled by axios interceptor
      }
    },
    [router]
  );

  // Get current user
  const getCurrentUser = useCallback(async () => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (publicRoutes.includes(pathname)) {
      return null;
    }

    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      clearAuth();
      setUser(null);
      return null;
    }
  }, [pathname, setUser]);

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
  };
};