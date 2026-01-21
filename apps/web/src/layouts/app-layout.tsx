import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/auth-context";

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `rounded-full px-4 py-2 text-sm transition ${
        isActive
          ? "bg-ink text-white"
          : "bg-white/70 text-slate-700 hover:bg-white"
      }`
    }
  >
    {label}
  </NavLink>
);

export const AppLayout = () => {
  const { isReady, refresh, logout, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isReady && import.meta.env.MODE !== "test") {
      void refresh();
    }
  }, [isReady, refresh]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e2e8f0,_#f8fafc_45%,_#e2e8f0_100%)] text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 pt-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Cure-All
          </p>
          <h1 className="font-display text-2xl text-ink">
            Clinical Control Room
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <NavItem to="/" label="Overview" />
          <NavItem to="/dashboard" label="Dashboard" />
          {user?.globalRole === "ROOT_ADMIN" ? (
            <NavItem to="/root" label="Root Admin" />
          ) : null}
          {user?.orgRoles?.includes("DOCTOR") ? (
            <NavItem to="/doctor" label="Doctor" />
          ) : null}
          <NavItem to="/login" label={isAuthenticated ? "Account" : "Login"} />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <Outlet />
      </main>
    </div>
  );
};
