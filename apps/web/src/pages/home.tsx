import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-glow backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400 font-semibold">
            Clinical Operations Platform v1.0
          </p>
        </div>
        <h2 className="mt-4 font-display text-4xl text-ink font-bold">
          Cure-All Control Room
        </h2>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Manage clinics, pharmacies, laboratories, and patient care workflows from a unified,
          secure operational cockpit. Coordinate electronic prescriptions, dispense validation,
          and diagnostic laboratory reporting seamlessly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}>
            {isAuthenticated ? "Enter Dashboard &rarr;" : "Sign In to Control Room"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(isAuthenticated ? "/root/checklist" : "/login")}
          >
            Launch Checklist
          </Button>
          <Link
            to="/invite/accept"
            className="rounded-full border border-sky-200 bg-sky-50 px-5 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition"
          >
            Accept Staff Invite
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Card title="Mission Control" eyebrow="Realtime">
            Track prescriptions, lab results, and dispensing events with live
            audit trails across clinical units.
          </Card>
          <Card title="Zero-Trust" eyebrow="Security">
            HTTP-Only cookies + cryptographic refresh rotation + immutable audit logging ensure HIPAA-grade isolation.
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card title="Quick Workflows" eyebrow="Onboarding">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-ember shrink-0" />
              <span>
                <strong>Root Administration:</strong> Register hospitals, pharmacies & labs, then dispatch invitation tokens.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-tide shrink-0" />
              <span>
                <strong>Clinical Prescribing:</strong> Look up patient NICs, review health records, and sign multi-item prescriptions.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-moss shrink-0" />
              <span>
                <strong>Pharmacy Dispensing:</strong> Verify prescription items against tamper-proof records and track partial fulfills.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
              <span>
                <strong>Diagnostic Laboratory:</strong> Record standardized panels with normal reference ranges and attachments.
              </span>
            </li>
          </ul>
        </Card>

        <Card title="Live Session Status" eyebrow="Environment">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Backend API</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 font-semibold">
                Port 3000 Ready
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Authentication</span>
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  isAuthenticated
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isAuthenticated ? `Logged in (${user?.email})` : "Awaiting login"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Platform Mode</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 font-semibold">
                PostgreSQL Operational
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
