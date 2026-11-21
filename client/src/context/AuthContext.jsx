import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { enableOfflineMode } from '../services/api';
import { OFFLINE_ADMIN_USER } from '../services/offlineStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('estateflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('estateflow_token');
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            try {
              localStorage.setItem('estateflow_user', JSON.stringify(res.data.user));
            } catch (e) {}
          }
        } catch (err) {
          console.warn('Profile check notice:', err.message);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            logout();
          } else {
            // If PC is off / network error, retain cached user session
            try {
              const cached = localStorage.getItem('estateflow_user');
              if (cached) setUser(JSON.parse(cached));
            } catch (e) {}
          }
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const loginOffline = () => {
    enableOfflineMode();
    setToken('offline_token_session_2026');
    setUser(OFFLINE_ADMIN_USER);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      try {
        localStorage.setItem('estateflow_token', res.data.token);
        localStorage.setItem('estateflow_user', JSON.stringify(res.data.user));
      } catch (e) {}
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      try {
        localStorage.setItem('estateflow_token', res.data.token);
        localStorage.setItem('estateflow_user', JSON.stringify(res.data.user));
      } catch (e) {}
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('estateflow_token');
      localStorage.removeItem('estateflow_user');
    } catch (e) {}
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      try {
        localStorage.setItem('estateflow_user', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginOffline, register, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
