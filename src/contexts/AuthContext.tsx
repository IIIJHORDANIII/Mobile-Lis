import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { login as apiLogin, register as apiRegister, createAdmin as apiCreateAdmin } from '../services/api';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  createAdmin: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@LisMobile:user');
      const storedToken = await AsyncStorage.getItem('@LisMobile:token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await apiLogin(email, password);
      await AsyncStorage.setItem('@LisMobile:user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@LisMobile:token');
      await AsyncStorage.removeItem('@LisMobile:user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await apiRegister({ name, email, password });
    } catch (error) {
      throw error;
    }
  };

  const createAdmin = async (name: string, email: string, password: string) => {
    try {
      await apiCreateAdmin({ name, email, password });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        signIn,
        signOut,
        register,
        createAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Adicione esta linha para exportar o contexto diretamente
export { AuthContext };
export default AuthContext;