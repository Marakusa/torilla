import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/torillaBackend";
import type { SessionLoginProps } from "../props/SessionLoginProps";
import Cookies from 'universal-cookie';

interface AuthContextValue {
  user: SessionLoginProps | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cookies = new Cookies(null, { path: '/' });
  const [user, setUser] = useState<SessionLoginProps | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const account = await api.getAccount();
      setUser(account ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      console.error("Terminating session failed. Removing session only locally.")
    }
    cookies.remove("X-Session-Token");
    setUser(null);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
