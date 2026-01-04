import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types/product';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateEcoPoints: (points: number) => void;
  convertPointsToCredit: (points: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.user;
      setUser({
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        memberSince: userData.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        ecoPoints: userData.ecoPoints || 0,
        storeCredit: userData.storeCredit || 0,
        lifetimePoints: userData.lifetimePoints || 0,
      });
    } catch (error) {
      // User is not logged in
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      const userData = response.data.user;
      setUser({
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        memberSince: userData.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        ecoPoints: userData.ecoPoints || 0,
        storeCredit: userData.storeCredit || 0,
        lifetimePoints: userData.lifetimePoints || 0,
      });
      toast.success('Welcome back!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register(name, email, password);
      const userData = response.data.user;
      setUser({
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        memberSince: new Date().toISOString().split('T')[0],
        ecoPoints: 100, // Welcome bonus
        storeCredit: 0,
        lifetimePoints: 100,
      });
      toast.success('Welcome to Peedika! You earned 100 welcome points!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors, still logout locally
    }
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateEcoPoints = useCallback((points: number) => {
    setUser(prev => prev ? { ...prev, ecoPoints: prev.ecoPoints + points, lifetimePoints: prev.lifetimePoints + Math.max(0, points) } : null);
  }, []);

  const convertPointsToCredit = useCallback((points: number) => {
    if (!user || user.ecoPoints < points) return;
    const creditAmount = Math.floor(points / 500) * 100;
    setUser(prev => prev ? {
      ...prev,
      ecoPoints: prev.ecoPoints - points,
      storeCredit: prev.storeCredit + creditAmount,
    } : null);
    toast.success(`Converted ${points} points to ₹${creditAmount} store credit!`);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateEcoPoints,
        convertPointsToCredit,
        refreshUser,
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
