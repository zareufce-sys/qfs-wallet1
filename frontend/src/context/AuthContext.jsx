import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('qfs_token'));
  const [loading, setLoading] = useState(true);

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Rehydrate user from stored token on page load
  useEffect(() => {
    const stored = localStorage.getItem('qfs_token');
    if (!stored) {
      setLoading(false);
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
    axios
      .get('/api/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('qfs_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('qfs_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('qfs_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await axios.get('/api/auth/me');
    setUser(res.data);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
