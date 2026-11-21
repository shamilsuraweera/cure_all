import React from "react";
import { Navigate } from "react-router-dom";

import { PageLoader } from "../components/ui/skeleton";
import { useAuth } from "./auth-context";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return <PageLoader label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
