'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, DriverInfo, RiderInfo } from '@/types/auth';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  driverInfo: DriverInfo | null;
  riderInfo: RiderInfo | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [riderInfo, setRiderInfo] = useState<RiderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    const driverData = localStorage.getItem('driver_data');
    const riderData = localStorage.getItem('rider_data');
    const token = localStorage.getItem('auth_token');
    
    if (userData && token) {
      try {
        setUser(JSON.parse(userData));
        if (driverData) setDriverInfo(JSON.parse(driverData));
        if (riderData) setRiderInfo(JSON.parse(riderData));
      } catch (error) {
        console.error('Error parsing stored data:', error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, session, profile, driverInfo: dInfo, riderInfo: rInfo } = response.data;
      
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token);
      }
      
      const userToStore = {
        ...userData,
        role: profile.role,
        fullName: profile.fullName,
        phone: profile.phone,
        isEmailVerified: !!userData.email_confirmed_at
      };
      
      localStorage.setItem('user_data', JSON.stringify(userToStore));
      setUser(userToStore);

      if (dInfo) {
        localStorage.setItem('driver_data', JSON.stringify(dInfo));
        setDriverInfo(dInfo);
      }

      if (rInfo) {
        localStorage.setItem('rider_data', JSON.stringify(rInfo));
        setRiderInfo(rInfo);
      }

    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.post('/auth/register', data);
      const { user: userData, profile } = response.data;
      
      const userToStore = {
        ...userData,
        role: profile.role,
        fullName: profile.fullName,
        phone: profile.phone,
        isEmailVerified: false
      };
      
      localStorage.setItem('user_data', JSON.stringify(userToStore));
      setUser(userToStore);

    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setDriverInfo(null);
    setRiderInfo(null);
  };

  const value = {
    user,
    driverInfo,
    riderInfo,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
