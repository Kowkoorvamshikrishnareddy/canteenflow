import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, College, Canteen, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  college: College | null;
  canteen: Canteen | null;
  isLoading: boolean;
  demoMode: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMe();
      setUser(data.user);
      setCollege(data.college);
      setCanteen(data.canteen);
      setDemoMode(data.demoMode);
    } catch (err) {
      console.warn('Could not fetch active user, falling back to local demo profile:', err);
      // Local fallback persona if backend was offline
      setUser({
        id: '55555555-5555-5555-5555-555555555555',
        fullName: 'Aarav Sharma',
        email: 'student@apex.edu',
        phone: '+91 98765 43212',
        role: 'student',
        collegeId: '11111111-1111-1111-1111-111111111111',
        canteenId: '22222222-2222-2222-2222-222222222222',
        createdAt: new Date().toISOString(),
      });
      setCollege({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Apex Institute of Technology',
        slug: 'apex-tech',
        timezone: 'Asia/Kolkata',
        settings: {
          currency: 'INR',
          currencySymbol: '₹',
          taxRate: 0.05,
          allowCashOnCounter: true,
          advanceOrderHorizonHours: 24,
          cancellationLeadMinutes: 15,
        },
      });
      setCanteen({
        id: '22222222-2222-2222-2222-222222222222',
        collegeId: '11111111-1111-1111-1111-111111111111',
        name: 'Green Leaf Central Canteen',
        description: 'Main campus dining hall serving fresh meals and quick refreshments.',
        operatingHours: { open: '08:00', close: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
        settings: { pickupSlotDurationMinutes: 15, maxOrdersPerSlot: 15, autoAcceptOrders: false, isCounterOpen: true },
        isActive: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const switchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.demoSwitchRole(role);
      setUser(res.user);
    } catch (e) {
      console.error('Role switch failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('canteenflow_user_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        college,
        canteen,
        isLoading,
        demoMode,
        switchRole,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
