import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { apiClient } from "../lib/api-client";

type AuthState = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: UserSummary | null;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type UserSummary = {
  id: string;
  email: string;
  globalRole: string;
};

type AuthProviderProps = {
  children: React.ReactNode;
  initialState?: Partial<AuthState>;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialState,
}) => {
  const [state, setState] = useState<AuthState>({
    isReady: initialState?.isReady ?? false,
    isAuthenticated: initialState?.isAuthenticated ?? false,
    user: initialState?.user ?? null,
  });

  const hydrateUser = useCallback(async () => {
    const profile = await apiClient.get<{ user: UserSummary }>("/auth/me");
    if (profile.ok) {
      setState((prev) => ({
        ...prev,
        isReady: true,
        isAuthenticated: true,
        user: profile.data?.user ?? null,
      }));
      return true;
    }

    setState((prev) => ({ ...prev, isReady: true, isAuthenticated: false, user: null }));
    return false;
  }, []);

  const refresh = useCallback(async () => {
    const result = await apiClient.post<{ message: string }>("/auth/refresh");
    if (!result.ok) {
      setState((prev) => ({ ...prev, isReady: true, isAuthenticated: false, user: null }));
      return;
    }
    await hydrateUser();
  }, [hydrateUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiClient.post<
      { message: string },
      { email: string; password: string }
    >("/auth/login", { email, password });

    if (!result.ok) {
      setState((prev) => ({ ...prev, isReady: true, isAuthenticated: false, user: null }));
      return false;
    }

    await hydrateUser();
    return true;
  }, [hydrateUser]);

  const logout = useCallback(async () => {
    await apiClient.post<{ message: string }>("/auth/logout");
    setState((prev) => ({ ...prev, isReady: true, isAuthenticated: false, user: null }));
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
