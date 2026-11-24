import axios from 'axios';
import { handleOfflineRequest, OFFLINE_ADMIN_USER } from './offlineStorage';

export const isMobileNative = () => {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.Capacitor !== undefined) return true;
  if (window.location.protocol === 'capacitor:') return true;
  if (
    window.location.hostname === 'localhost' &&
    window.location.port !== '5000' &&
    window.location.port !== '5173'
  ) {
    return true;
  }
  if (window.location.protocol === 'file:') return true;
  return false;
};

export const getApiBaseUrl = () => {
  if (isMobileNative()) {
    try {
      const customUrl = localStorage.getItem('estateflow_api_host');
      if (customUrl) return customUrl.replace(/\/$/, '') + '/api';
    } catch (e) {}
    return 'http://10.1.40.60:5000/api';
  }

  if (typeof window !== 'undefined') {
    try {
      const customUrl = localStorage.getItem('estateflow_api_host');
      if (customUrl) return customUrl.replace(/\/$/, '') + '/api';
    } catch (e) {}

    // When deployed on Netlify or external web hosting
    if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app')) {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://10.1.40.60:5000';
      return backendUrl.replace(/\/$/, '') + '/api';
    }
  }

  return import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/api' : '/api';
};

export const setCustomApiHost = (hostUrl) => {
  if (!hostUrl) {
    localStorage.removeItem('estateflow_api_host');
    localStorage.removeItem('estateflow_server_host');
    api.defaults.baseURL = getApiBaseUrl();
    return;
  }
  let cleanUrl = hostUrl.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'http://' + cleanUrl;
  }
  localStorage.setItem('estateflow_api_host', cleanUrl);
  localStorage.setItem('estateflow_server_host', cleanUrl);
  api.defaults.baseURL = cleanUrl + '/api';
};

export const enableOfflineMode = () => {
  try {
    localStorage.setItem('estateflow_offline_active', 'true');
    localStorage.setItem('estateflow_token', 'offline_token_session_2026');
    localStorage.setItem('estateflow_user', JSON.stringify(OFFLINE_ADMIN_USER));
  } catch (e) {}
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach dynamic base URL & JWT token
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    try {
      const token = localStorage.getItem('estateflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch network errors (e.g. PC is off) & handle via Standalone Offline Engine
api.interceptors.response.use(
  (response) => {
    // If live server responds, clear offline active indicator
    try {
      if (!response.data?.isOfflineMode) {
        localStorage.removeItem('estateflow_offline_active');
      }
    } catch (e) {}
    return response;
  },
  (error) => {
    const isNetworkError =
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      error.message?.includes('timeout') ||
      !error.response;

    if (isNetworkError) {
      const offlineRes = handleOfflineRequest(error.config);
      if (offlineRes) {
        console.warn('📴 PC is off / offline - Request handled via Standalone Offline Engine:', error.config?.url);
        try {
          localStorage.setItem('estateflow_offline_active', 'true');
        } catch (e) {}
        return Promise.resolve(offlineRes);
      }
    }

    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login page or public marketplace pages, clear token and redirect
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        !window.location.pathname.includes('/marketplace')
      ) {
        try {
          localStorage.removeItem('estateflow_token');
          localStorage.removeItem('estateflow_user');
        } catch (e) {}
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
