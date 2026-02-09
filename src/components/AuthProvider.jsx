import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getMe(token);
        if (!cancelled) {
          setUser(data.user);
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('crm_token');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      setToken: (newToken) => {
        setToken(newToken);
        if (newToken) {
          localStorage.setItem('crm_token', newToken);
        } else {
          localStorage.removeItem('crm_token');
        }
      },
      setUser,
      logout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('crm_token');
      },
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
