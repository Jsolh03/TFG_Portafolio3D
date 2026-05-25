import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../config';

const TOKEN_KEY = 'tfg_auth_token';
const AuthContext = createContext(null);

/* Persistencia ligera del JWT en localStorage. Si el token es inválido o
   ha caducado, `/api/auth/me` devuelve 401 y limpiamos automáticamente. */

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
  });
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(!!token);

  const persistToken = useCallback((value) => {
    setToken(value);
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch { /* localStorage bloqueado */ }
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
    setRole(null);
  }, [persistToken]);

  // Al montar (o cambiar token), pide /me para hidratar user
  useEffect(() => {
    if (!token) { setUser(null); setRole(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async r => {
        if (!r.ok) throw new Error('unauthorized');
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        setUser(data.user || null);
        setRole(data.role || null);
      })
      .catch(() => {
        if (cancelled) return;
        // Token inválido o caducado → limpiar
        logout();
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, logout]);

  const login = useCallback(async (id, password) => {
    const resp = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data?.error || 'Login fallido');
    persistToken(data.token);
    setUser(data.user || null);
    setRole('user');
    return data.user;
  }, [persistToken]);

  const adoptToken = useCallback((newToken, newUser = null, newRole = null) => {
    persistToken(newToken);
    if (newUser) setUser(newUser);
    if (newRole) setRole(newRole);
  }, [persistToken]);

  const value = {
    token,
    user,
    role,
    loading,
    isAuthenticated: !!token && !!user,
    isStaff: role === 'admin' || role === 'admin-impersonation',
    login,
    logout,
    adoptToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
