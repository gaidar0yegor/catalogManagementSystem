import { writable } from 'svelte/store';
import axios from 'axios';
import { config } from '../config';

interface AuthState {
  token: string | null;
  loading: boolean;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

interface LoginError {
  message: string;
  response?: {
    data?: {
      detail?: string;
    };
  };
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    token: localStorage.getItem('token'),
    loading: true
  });

  // Set up axios interceptors for token
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor to handle token refresh
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried refreshing token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post<TokenResponse>(config.endpoints.refresh, {
            refresh: refreshToken
          });

          const { access: newToken } = response.data;
          localStorage.setItem('token', newToken);
          update(state => ({ ...state, token: newToken }));

          // Update the failed request's authorization header
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          update(state => ({ ...state, token: null, loading: false }));
          throw refreshError;
        }
      }

      return Promise.reject(error);
    }
  );

  return {
    subscribe,
    login: async (username: string, password: string): Promise<void> => {
      try {
        const response = await axios.post<TokenResponse>(config.endpoints.login, { username, password });
        const { access, refresh } = response.data;
        localStorage.setItem('token', access);
        localStorage.setItem('refresh_token', refresh);
        update(state => ({ ...state, token: access, loading: false }));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        const err = error as LoginError;
        throw new Error(err.response?.data?.detail || 'Invalid username or password');
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      update(state => ({ ...state, token: null, loading: false }));
    },
    checkAuth: async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!token || !refreshToken) {
        update(state => ({ ...state, loading: false }));
        return;
      }

      try {
        const response = await axios.post<TokenResponse>(config.endpoints.refresh, { refresh: refreshToken });
        const { access: newToken } = response.data;
        localStorage.setItem('token', newToken);
        update(state => ({ ...state, token: newToken, loading: false }));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        update(state => ({ ...state, token: null, loading: false }));
      }
    }
  };
}

export const authStore = createAuthStore();
