import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./auth-context";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return <div className="px-6 py-10 text-slate-600">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
