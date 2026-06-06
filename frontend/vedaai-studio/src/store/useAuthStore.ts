// src/store/useAuthStore.ts
import { create } from 'zustand';
import { apiClient } from '../services/api';
import { IUser } from '../types/api.types';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  bootstrapSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<IUser>;
  signup: (name: string, email: string, password: string) => Promise<IUser>;
  onboard: (data: {
    profile: {
      title: 'Mr.' | 'Ms.' | 'Dr.' | 'Mrs.';
      role: 'Teacher' | 'Head of Department' | 'Administrator';
    };
    institution: {
      name: string;
      location?: string;
    };
    targetGrades: string[];
    primarySubjects: string[];
  }) => Promise<IUser>;
  logout: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isInitialized: false,

  bootstrapSession: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      const refreshRes = await apiClient.post('/auth/refresh');
      const accessToken = refreshRes.data.accessToken;
      
      set({ accessToken });
      
      const userRes = await apiClient.get('/auth/me');
      const user = userRes.data.user;
      
      set({ user, isInitialized: true });
    } catch (error) {
      set({ user: null, accessToken: null, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;
      set({ user, accessToken, isInitialized: true });
      return user;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/register', { name, email, password });
      
      const loginRes = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = loginRes.data;
      
      set({ user, accessToken, isInitialized: true });
      return user;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  onboard: async (onboardingData) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/onboard', onboardingData);
      const user = res.data.user;
      set({ user });
      return user;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      get().clearAuth();
      set({ isLoading: false });
    }
  },

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  clearAuth: () => {
    set({ user: null, accessToken: null });
  },
}));
