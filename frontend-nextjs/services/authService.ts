import { apiRequest } from '@/lib/api';
import { LoginResponse } from '@/types';

export const authService = {
  // 1. Login Konvensional
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // 2. URL untuk Redirect ke Google (Laravel Backend Endpoint)
  getGoogleAuthUrl: () => {
    return `${process.env.NEXT_PUBLIC_API_URL}/auth/google/redirect`;
  }


  
};