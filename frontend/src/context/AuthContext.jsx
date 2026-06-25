import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const _store = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    _store(data.token, data.user);
    return data;
  }, [_store]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    _store(data.token, data.user);
    return data;
  }, [_store]);

  const googleLogin = useCallback(async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    _store(data.token, data.user);
    return data; // inclui needsCompletion
  }, [_store]);

  const completeProfile = useCallback(async (payload) => {
    const { data } = await api.post('/auth/complete-profile', payload);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }, []);

  const resendVerification = useCallback(async () => {
    const { data } = await api.post('/auth/resend-verification');
    return data;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateBalance = useCallback((newBalance) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, balance: newBalance };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, googleLogin, completeProfile, resendVerification,
      logout, updateBalance, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
