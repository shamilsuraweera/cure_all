import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/auth-context";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.globalRole === "ROOT_ADMIN") {
      navigate("/root");
      return;
    }
    if (user?.orgRoles?.includes("DOCTOR")) {
      navigate("/doctor");
      return;
    }
    if (user?.orgRoles?.includes("PHARMACIST")) {
      navigate("/pharmacy");
      return;
    }
    navigate("/dashboard");
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await login(email, password);
    setLoading(false);

    if (!ok) {
      setError("Login failed. Check your credentials.");
      return;
    }

    // Redirect handled by auth effect once user profile is loaded.
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card title="Access Portal" eyebrow="Secure login">
        <p>
          Sign in with your root admin credentials. This app uses secure cookies
          and refresh rotation.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@cureall.app"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
          {error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}
            </div>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
      <Card title="Support" eyebrow="Need help?">
        <ul className="space-y-3">
          <li>Make sure the API server is running on port 3000.</li>
          <li>Use the ROOT_ADMIN credentials from your `.env` file.</li>
          <li>Refresh tokens are stored as secure cookies.</li>
        </ul>
      </Card>
    </div>
  );
};
