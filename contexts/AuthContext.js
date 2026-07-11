"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken, setAuthFailureHandler } from "@/lib/apiClient";
import { disconnectSocket } from "@/lib/socketClient";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

const ROLE_HOME = {
  admin: "/admin",
  store_manager: "/store",
  customer: "/customer",
};

const STORAGE_KEY = "oms-auth-user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessTokenState, setAccessTokenState] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // On mount, try to restore a session via the refresh cookie (if any),
  // and cache the last-known user for a snappier first paint.
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        // ignore corrupt cache
      }
    }

    setAuthFailureHandler(() => {
      setUser(null);
      setAccessTokenState(null);
      localStorage.removeItem(STORAGE_KEY);
      router.push("/login");
    });

    api
      .post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setAccessTokenState(data.accessToken);
        setUser(data.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAuth = useCallback((nextUser, token) => {
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/auth/login", { email, password });
      applyAuth(data.user, data.accessToken);
      showToast(`Welcome back, ${data.user.name.split(" ")[0]}`, "success");
      router.push(ROLE_HOME[data.user.role] || "/");
    },
    [applyAuth, router, showToast]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/auth/register", payload);
      applyAuth(data.user, data.accessToken);
      showToast("Account created", "success");
      router.push(ROLE_HOME[data.user.role] || "/");
    },
    [applyAuth, router, showToast]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    }
    disconnectSocket();
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, accessToken: accessTokenState, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
