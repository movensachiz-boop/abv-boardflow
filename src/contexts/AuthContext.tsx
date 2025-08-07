import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/pos';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: User['role']) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: User['role']) => Promise<boolean>;
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
        name: 'User',
        email,
        role,
      };
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: User['role']): Promise<boolean> => {
    // Mock signup - in real app this would call an API
    if (name && email && password) {
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role,
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
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};