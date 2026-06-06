// src/lib/api.ts
import { apiClient } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const api = apiClient;
export const setAccessToken = (token: string) => {
  useAuthStore.getState().setAccessToken(token);
};