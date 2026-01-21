import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiClient } from "../lib/api-client";
import { tokenStorage } from "../lib/token-storage";

type AuthState = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: UserSummary | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

type UserSummary = {
  id: string;
  email: string;
  globalRole: string;
  orgRoles: string[];
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isReady: false,
    isAuthenticated: false,
    user: null,
  });

  const hydrateUser = useCallback(async () => {
    const profile = await apiClient.get<{
      user: UserSummary & { orgMemberships?: { role: string }[] };
    }>("/auth/me");

    if (profile.ok) {
      const orgRoles =
        profile.data?.user?.orgMemberships?.map((membership) => membership.role) ?? [];
      const user = profile.data?.user
        ? { ...profile.data.user, orgRoles }
        : null;
      setState({ isReady: true, isAuthenticated: true, user });
      return true;
    }

    setState({ isReady: true, isAuthenticated: false, user: null });
    return false;
  }, []);

  const refresh = useCallback(async () => {
    const result = await apiClient.post<{
      message: string;
      accessToken?: string;
      refreshToken?: string;
    }>("/auth/refresh");

    if (result.ok) {
      if (result.data?.accessToken) {
        await tokenStorage.setAccessToken(result.data.accessToken);
      }
      if (result.data?.refreshToken) {
        await tokenStorage.setRefreshToken(result.data.refreshToken);
      }
      await hydrateUser();
      return;
    }

    await tokenStorage.clear();
    setState({ isReady: true, isAuthenticated: false, user: null });
  }, [hydrateUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiClient.post<
      { message: string; accessToken?: string; refreshToken?: string },
      { email: string; password: string }
    >("/auth/login", { email, password });

    if (!result.ok) {
      setState({ isReady: true, isAuthenticated: false, user: null });
      return false;
    }

    if (result.data?.accessToken) {
      await tokenStorage.setAccessToken(result.data.accessToken);
    }
    if (result.data?.refreshToken) {
      await tokenStorage.setRefreshToken(result.data.refreshToken);
    }

    await hydrateUser();
    return true;
  }, [hydrateUser]);

  const logout = useCallback(async () => {
    await apiClient.post<{ message: string }>("/auth/logout");
    await tokenStorage.clear();
    setState({ isReady: true, isAuthenticated: false, user: null });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      refresh,
    }),
    [state, login, logout, refresh],
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
