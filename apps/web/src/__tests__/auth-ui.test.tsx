import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "../auth/auth-context";
import App from "../app";

const renderApp = (
  initialAuth?: Parameters<typeof AuthProvider>[0]["initialState"],
  initialEntries: string[] = ["/"],
) => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider initialState={initialAuth}>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("auth ui", () => {
  it("shows login form fields", () => {
    renderApp({ isReady: true, isAuthenticated: false, user: null }, ["/login"]);

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows root admin nav when authenticated", () => {
    renderApp(
      {
      isReady: true,
      isAuthenticated: true,
      user: { id: "1", email: "root@example.com", globalRole: "ROOT_ADMIN" },
      },
      ["/"],
    );

    expect(screen.getByRole("link", { name: /Root Admin/i })).toBeInTheDocument();
  });
});
