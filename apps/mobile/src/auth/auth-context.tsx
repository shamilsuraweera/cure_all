import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiClient } from "../lib/api-client";
import { tokenStorage } from "../lib/token-storage";

type AuthState = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: UserSummary | null;
};

type AuthContextValue = AuthState & {
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export type Membership = {
  role: string;
  org: { id: string; type: string; name: string };
};

type UserSummary = {
  id: string;
  email: string;
  globalRole: string;
  orgRoles: string[];
  memberships: Membership[];
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
      user: Omit<UserSummary, "orgRoles" | "memberships"> & {
        orgMemberships?: Membership[];
      };
    }>("/auth/me");

    if (profile.ok) {
      const orgRoles =
        profile.data?.user?.orgMemberships?.map(
          (membership) => membership.role,
        ) ?? [];
      const user = profile.data?.user
        ? {
            ...profile.data.user,
            orgRoles,
            memberships: profile.data.user.orgMemberships ?? [],
          }
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

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiClient.post<
        { message: string; accessToken?: string; refreshToken?: string },
        { email: string; password: string }
      >("/auth/login", { email, password });

      if (!result.ok) {
        setState({ isReady: true, isAuthenticated: false, user: null });
        return {
          ok: false,
          error:
            result.status === 401
              ? "Invalid email or password."
              : result.status === 400
                ? "Enter a valid email and password."
                : (result.error?.message ?? "Login failed."),
        };
      }

      if (result.data?.accessToken) {
        await tokenStorage.setAccessToken(result.data.accessToken);
      }
      if (result.data?.refreshToken) {
        await tokenStorage.setRefreshToken(result.data.refreshToken);
      }

      const hydrated = await hydrateUser();
      return hydrated
        ? { ok: true }
        : { ok: false, error: "Signed in, but could not load your profile." };
    },
    [hydrateUser],
  );

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
