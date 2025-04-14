import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { formatInstagram, formatWhatsApp } from '../utils/socialUtils';
import { atualizarConfigUsuario } from '../services/apiService';

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  company_name?: string;
  company_cnpj?: string;
  company_address?: string;
  role: 'admin' | 'user';
  instagram?: string;
  whatsapp?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

interface UserHistoryEntry {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  changes: Record<string, any>;
}

interface UserContextData {
  userData: User | null;
  userHistory: UserHistoryEntry[];
  updateUserData: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextData | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<UserHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setUserData(null);
        setIsLoading(false);
        return;
      }

      try {
        setUserData({
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          role: user.role,
          instagram: user.instagram,
          whatsapp: user.whatsapp,
          website: user.website,
          facebook: user.facebook,
          twitter: user.twitter,
          youtube: user.youtube,
          company_name: user.company_name,
          company_cnpj: user.company_cnpj,
          company_address: user.company_address,
        });
      } catch (err) {
        setError('Error loading user data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const updateUserData = async (updates: Partial<User>) => {
    if (!userData) return;

    try {
      const formattedUpdates = {
        ...updates,
        instagram: updates.instagram ? formatInstagram(updates.instagram) : updates.instagram,
        whatsapp: updates.whatsapp ? formatWhatsApp(updates.whatsapp) : updates.whatsapp
      };

      const updatedUser = { ...userData, ...formattedUpdates };
      
      setUserData(updatedUser);

      await atualizarConfigUsuario(updatedUser, user);

      setError(null);
    } catch (err) {
      setError('Error updating user data');
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{
      userData,
      userHistory,
      updateUserData,
      isLoading,
      error
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}