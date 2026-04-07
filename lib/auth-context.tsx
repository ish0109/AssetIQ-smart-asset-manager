'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCurrentUser() {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('auth_user');
        }
      }

      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        });

        if (!response.ok) {
          setUser(null);
          localStorage.removeItem('auth_user');
          return;
        }

        const data = await response.json();
        setUser(data.user ?? null);
        if (data.user) {
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
      } catch {
        if (!storedUser) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return authenticate('/api/auth/login', email, password);
  };

  const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return authenticate('/api/auth/signup', email, password);
  };

  const authenticate = async (
    endpoint: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user ?? null);
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to reach authentication server' };
    }
  };

  const logout = () => {
    void (async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // Best-effort logout; local state is still cleared.
      } finally {
        setUser(null);
        localStorage.removeItem('auth_user');
        router.push('/login');
      }
    })();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
