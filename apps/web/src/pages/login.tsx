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
    if (user?.orgRoles?.includes("LAB_TECH")) {
      navigate("/lab");
      return;
    }
    navigate("/dashboard");
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Login failed. Check your credentials.");
      return;
    }

    // Redirect handled by auth effect once user profile is loaded.
  };

  const fillAdmin = () => {
    setEmail("admin@example.com");
    setPassword("ChangeMe@123");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card title="Access Portal" eyebrow="Secure login">
        <p>
          Sign in with your Root Admin or clinical credentials. This application uses
          secure HTTP cookies with automated token rotation and audit telemetry.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
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
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          ) : null}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Button type="button" variant="outline" onClick={fillAdmin}>
              Fill Root Admin
            </Button>
          </div>
        </form>
      </Card>
      <Card title="Quick access" eyebrow="Environment">
        <div className="space-y-4 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Local Dev Credentials</p>
            <p className="mt-1 font-mono text-xs text-slate-600">admin@example.com / ChangeMe@123</p>
            <p className="mt-2 text-xs text-slate-400">
              Org members (Doctor, Pharmacist, Lab Tech) are invited by Root Admin and accept invitations with their custom password.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              API Service running on port 3000
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Cross-origin credential sharing enabled
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Immutable audit logging for all authentication events
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
