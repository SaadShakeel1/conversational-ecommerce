"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getToken, setToken, clearToken } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Load user on mount if token exists
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then(setUser)
      .catch(() => {
        clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setToken(res.access_token);
      const me = await api.auth.me();
      setUser(me);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await api.auth.register({ email, password });
      // Auto-login after registration
      const res = await api.auth.login(email, password);
      setToken(res.access_token);
      const me = await api.auth.me();
      setUser(me);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Registration failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
  }, []);

  return { user, loading, error, isAuthenticated, login, register, logout };
}
