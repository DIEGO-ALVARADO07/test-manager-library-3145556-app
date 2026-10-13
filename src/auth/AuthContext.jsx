import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, configureClient } from '../api/client.js';

const STORAGE_KEY = 'library.session';
const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable: the session simply lives in memory
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  // The client reads the token from here and asks us to sign out on a 401.
  configureClient({ getToken: () => session?.token ?? null, onUnauthorized: logout });

  // The token lasts 8 hours: sign out when it expires.
  useEffect(() => {
    if (!session) return undefined;
    const timer = setTimeout(logout, Math.max(session.expiresAt - Date.now(), 0));
    return () => clearTimeout(timer);
  }, [session, logout]);

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    const next = { token: data.access_token, role: data.role, expiresAt: Date.now() + data.expires_in * 1000 };
    writeSession(next);
    setSession(next);
  }, []);

  const value = useMemo(() => ({ session, role: session?.role ?? null, login, logout }), [session, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
