import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { apiPost } from "../lib/api";

type AuthState = {
  isReady: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    isReady: false,
    isAuthenticated: false,
  });

  const refresh = useCallback(async () => {
    const result = await apiPost<{ message: string }>("/auth/refresh");
    setState({ isReady: true, isAuthenticated: result.ok });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiPost<{ message: string }, { email: string; password: string }>(
      "/auth/login",
      { email, password },
    );

    setState({ isReady: true, isAuthenticated: result.ok });
    return result.ok;
  }, []);

  const logout = useCallback(async () => {
    await apiPost<{ message: string }>("/auth/logout");
    setState({ isReady: true, isAuthenticated: false });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      refresh,
      login,
      logout,
    }),
    [state, refresh, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
