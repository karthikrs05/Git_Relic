import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, login as loginApi, register as registerApi } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('gr_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;
    async function loadUser() {
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }
      try {
        const me = await fetchMe(token);
        if (active) setUser(me);
      } catch {
        localStorage.removeItem('gr_token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadUser();
    return () => {
      active = false;
    };
  }, [token]);

  async function register(payload) {
    const data = await registerApi(payload);
    localStorage.setItem('gr_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login(payload) {
    const data = await loginApi(payload);
    localStorage.setItem('gr_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('gr_token');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, loading, register, login, logout, isAuthenticated: Boolean(token) }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
