"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

export type Role = "chris" | "caitlyn";

export type Auth = {
  role: Role;
  displayName: string;
};

type AuthContextValue = {
  auth: Auth | null;
  loading: boolean;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "rummy_auth";

function applyTheme(auth: Auth | null) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  if (!auth) {
    html.removeAttribute("data-theme");
  } else {
    html.setAttribute("data-theme", auth.role === "chris" ? "matrix" : "pink");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Auth;
        setAuth(parsed);
        applyTheme(parsed);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (password: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        return { ok: false, error: "Wrong password" };
      }
      const data = (await res.json()) as Auth;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setAuth(data);
      applyTheme(data);
      return { ok: true };
    } catch {
      return { ok: false, error: "Login failed" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
    applyTheme(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
