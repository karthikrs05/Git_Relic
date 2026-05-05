import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMe, login as loginApi, register as registerApi } from '../services/auth';

const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const TOKEN_KEY = 'gr_token';
const SESSION_START_KEY = 'gr_session_start';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const logoutTimer = useRef(null);

  function startLogoutTimer() {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      logout();
    }, SESSION_DURATION_MS);
  }

  function clearLogoutTimer() {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
  }

  useEffect(() => {
    let active = true;
    async function loadUser() {
      const storedToken = sessionStorage.getItem(TOKEN_KEY);
      const sessionStart = sessionStorage.getItem(SESSION_START_KEY);

      if (!storedToken) {
        setLoading(false);
        setUser(null);
        return;
      }

      if (sessionStart && Date.now() - parseInt(sessionStart, 10) >= SESSION_DURATION_MS) {
        logout();
        setLoading(false);
        return;
      }

      try {
        const me = await fetchMe(storedToken);
        if (active) {
          setToken(storedToken);
          setUser(me);
          startLogoutTimer();
        }
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(SESSION_START_KEY);
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
      clearLogoutTimer();
    };
  }, [token]);

  async function register(payload) {
    const data = await registerApi(payload);
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
    setToken(data.token);
    setUser(data.user);
    startLogoutTimer();
    return data;
  }

  async function login(payload) {
    const data = await loginApi(payload);
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
    setToken(data.token);
    setUser(data.user);
    startLogoutTimer();
    return data;
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_START_KEY);
    clearLogoutTimer();
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
