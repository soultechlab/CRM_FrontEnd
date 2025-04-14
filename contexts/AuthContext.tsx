import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/auth/auth.service';
import { User } from '../services/auth/types';
import { PLAN_LIMITS } from '../utils/planLimits';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      // Set unlimited limits for admin users
      if (savedUser.email === 'admin@fotocrm.com' || savedUser.role === 'admin') {
        savedUser.limits = {
          maxClients: Infinity,
          maxSchedules: Infinity,
          hasFinancialAccess: true
        };
      } else {
        savedUser.limits = PLAN_LIMITS[savedUser.plan];
      }
    }
    return savedUser;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const loggedUser = await authService.signIn(email, password);
      
      if(loggedUser.status != 'active') {
        throw new Error('Usuário não ativo!');
      }

      setUser(loggedUser);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signUp(name, email, password);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut(user);
      setUser(null);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}