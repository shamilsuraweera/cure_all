import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "../auth/auth-context";
import App from "../app";

const renderApp = () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );
};

describe("web app shell", () => {
  it("renders the landing header", () => {
    renderApp();
    expect(screen.getByText(/Cure-All Control Room/i)).toBeInTheDocument();
  });
});
