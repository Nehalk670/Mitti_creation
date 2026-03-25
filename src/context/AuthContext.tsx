import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('mitti_token');
      const savedUser = localStorage.getItem('mitti_user');

      if (token && savedUser) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.data.user);
        } catch (error) {
          // Token is invalid, clear local storage
          localStorage.removeItem('mitti_token');
          localStorage.removeItem('mitti_user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await authAPI.register({ name, email, password });

      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
        localStorage.setItem('mitti_token', token);
        localStorage.setItem('mitti_user', JSON.stringify(user));
        setUser(user);
        return { error: null };
      }

      return { error: { message: 'Registration failed' } };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Registration failed'
        }
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
        localStorage.setItem('mitti_token', token);
        localStorage.setItem('mitti_user', JSON.stringify(user));
        setUser(user);
        return { error: null };
      }

      return { error: { message: 'Login failed' } };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Login failed'
        }
      };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('mitti_token');
    localStorage.removeItem('mitti_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
