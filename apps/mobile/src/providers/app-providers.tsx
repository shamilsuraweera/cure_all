import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "../auth/auth-context";
import { ToastProvider } from "../components/ui/toast";
import { PatientContextProvider } from "../hooks/use-patient-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 15_000, refetchOnReconnect: true },
  },
});

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PatientContextProvider>
        <ToastProvider>{children}</ToastProvider>
      </PatientContextProvider>
    </AuthProvider>
  </QueryClientProvider>
);
