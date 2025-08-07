import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/pos';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: User['role']) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: User['role']) => Promise<{ success: boolean; needsVerification?: boolean }>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: User['role']): Promise<boolean> => {
    // Mock authentication - in real app this would call an API
    if (email && password) {
      const mockUser: User = {
        id: Date.now().toString(),
        name: 'John Doe',
        email,
        role,
      };
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: User['role']) => {
    // Mock signup - in real app this would call an API
    if (name && email && password) {
      // Simulate email verification requirement
      return { success: true, needsVerification: true };
    }
    return { success: false };
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    // Mock email verification - in real app this would verify the code
    if (code === '123456') {
      const mockUser: User = {
        id: Date.now().toString(),
        name: 'New User',
        email,
        role: 'cashier', // Default role for new signups
      };
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    verifyEmail,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};