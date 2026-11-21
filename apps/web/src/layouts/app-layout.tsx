import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/auth-context";

const NavItem = ({
  to,
  label,
  end,
  onNavigate,
}: {
  to: string;
  label: string;
  end?: boolean;
  onNavigate?: () => void;
}) => (
  <NavLink
    to={to}
    end={end}
    onClick={onNavigate}
    className={({ isActive }) =>
      `rounded-full px-4 py-2 text-sm font-medium no-underline transition ${
        isActive
          ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-soft"
          : "text-teal-900 hover:bg-teal-100"
      }`
    }
  >
    {label}
  </NavLink>
);

export const AppLayout = () => {
  const { isReady, refresh, logout, isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isReady && import.meta.env.MODE !== "test") {
      void refresh();
    }
  }, [isReady, refresh]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isRoot = user?.globalRole === "ROOT_ADMIN";
  const hasRole = (role: string) =>
    isRoot || Boolean(user?.orgRoles?.includes(role));
  const close = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_#ccfbf1,_#f0fdfa_40%,_#ecfeff_75%,_#fff1f2_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-teal-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <NavLink to="/" className="no-underline" aria-label="Cure-All home">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-coral-500">
              Cure-All
            </p>
            <h1 className="font-display text-xl text-ink sm:text-2xl">
              Clinical Control Room
            </h1>
          </NavLink>
          <button
            type="button"
            className="rounded-full border border-teal-200 px-4 py-2 text-sm font-medium text-teal-800 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav
            id="main-nav"
            aria-label="Main"
            className={`${
              menuOpen ? "flex" : "hidden"
            } absolute left-0 right-0 top-full flex-col gap-1 border-b border-teal-100 bg-white/95 px-6 py-4 shadow-soft lg:static lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
          >
            <NavItem to="/" label="Overview" end onNavigate={close} />
            <NavItem to="/dashboard" label="Dashboard" onNavigate={close} />
            {isRoot ? (
              <NavItem to="/root" label="Root Admin" onNavigate={close} />
            ) : null}
            {hasRole("DOCTOR") ? (
              <NavItem to="/doctor" label="Doctor" onNavigate={close} />
            ) : null}
            {hasRole("PHARMACIST") ? (
              <NavItem to="/pharmacy" label="Pharmacy" onNavigate={close} />
            ) : null}
            {hasRole("LAB_TECH") ? (
              <NavItem to="/lab" label="Lab" onNavigate={close} />
            ) : null}
            {!isAuthenticated ? (
              <NavItem to="/login" label="Login" onNavigate={close} />
            ) : null}
            {isAuthenticated ? (
              <>
                <NavItem to="/login" label="Account" onNavigate={close} />
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-full border border-coral-400 px-4 py-2 text-sm font-medium text-coral-600 hover:bg-coral-50"
                >
                  Logout
                </button>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-8">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-teal-100 py-6 text-center text-xs text-slate-500">
        Cure-All &middot; Secure clinical workflows
      </footer>
    </div>
  );
};
