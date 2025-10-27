'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import type { User, AuthContextType } from '../lib/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      apiClient.setToken(storedToken);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    setToken(response.token);
    setUser(response.user);
    apiClient.setToken(response.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    apiClient.setToken(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
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

