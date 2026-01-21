import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { AuthProvider } from "../auth/auth-context";
import App from "../app";

vi.mock("../lib/doctor", () => ({
  searchPatients: vi.fn(async () => ({ data: { patients: [] } })),
  getPatientProfile: vi.fn(async () => ({
    data: { patient: { id: "1", nic: "123", user: { id: "u1", email: "doc@example.com" } } },
  })),
  getPatientPrescriptions: vi.fn(async () => ({ data: { prescriptions: [] } })),
  getPatientLabResults: vi.fn(async () => ({ data: { labResults: [] } })),
  createPrescription: vi.fn(async () => ({ data: { prescription: { id: "p1" } } })),
}));

const renderApp = (initialEntries: string[]) => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider
          initialState={{
            isReady: true,
            isAuthenticated: true,
            user: {
              id: "doc",
              email: "doc@example.com",
              globalRole: "USER",
              orgRoles: ["DOCTOR"],
            },
          }}
        >
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("doctor ui", () => {
  it("renders patient lookup page", () => {
    renderApp(["/doctor/patients"]);

    expect(screen.getByText(/Patient lookup/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/NIC/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it("renders prescription section on patient detail", () => {
    renderApp(["/doctor/patients/1"]);

    expect(
      screen.getByRole("heading", { name: /Create prescription/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Prescriptions/i }),
    ).toBeInTheDocument();
  });
});
