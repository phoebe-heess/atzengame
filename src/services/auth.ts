import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_GOOGLE_CLIENT_ID?: string;
    readonly VITE_APPLE_CLIENT_ID?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export interface RegisterData {
  email: string;
  password: string;
  atzencoins: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    atzencoins: number;
  };
}

export const authService = {
  async registerWithEmail(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async registerWithGoogle(token: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/google`, { token });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async registerWithApple(token: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/apple`, { token });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
}; 