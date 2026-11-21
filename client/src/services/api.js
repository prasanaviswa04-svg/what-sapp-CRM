import axios from 'axios';

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
    return 'http://10.1.40.73:5000/api';
  }

  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
