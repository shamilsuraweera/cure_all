import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "../auth/auth-context";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>{children}</AuthProvider>
  </QueryClientProvider>
);
