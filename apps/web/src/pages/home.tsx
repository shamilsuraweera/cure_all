import { useAuth } from "../auth/auth-context";
import { LinkButton } from "../components/ui/button";
import { Card } from "../components/ui/card";

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[32px] border border-teal-100 bg-white/80 p-8 shadow-glow backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs uppercase tracking-[0.35em] text-teal-600 font-semibold">
            Clinical Operations Platform v1.0
          </p>
        </div>
        <h2 className="mt-4 font-display text-4xl text-ink font-bold">
          Cure-All Control Room
        </h2>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Manage clinics, pharmacies, laboratories, and patient care workflows
          from a unified, secure operational cockpit. Coordinate electronic
          prescriptions, dispense validation, and diagnostic laboratory
          reporting seamlessly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton to={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated
              ? "Enter Dashboard \u2192"
              : "Sign In to Control Room"}
          </LinkButton>
          {user?.globalRole === "ROOT_ADMIN" ? (
            <LinkButton to="/root/checklist" variant="outline">
              Launch Checklist
            </LinkButton>
          ) : null}
          {!isAuthenticated ? (
            <LinkButton to="/invite/accept" variant="secondary">
              Accept Staff Invite
            </LinkButton>
          ) : null}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Card title="Mission Control" eyebrow="Realtime">
            Track prescriptions, lab results, and dispensing events with live
            audit trails across clinical units.
          </Card>
          <Card title="Zero-Trust" eyebrow="Security">
            HTTP-Only cookies + cryptographic refresh rotation + immutable audit
            logging ensure HIPAA-grade isolation.
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card title="Quick Workflows" eyebrow="Onboarding">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-coral-400 shrink-0" />
              <span>
                <strong>Root Administration:</strong> Register hospitals,
                pharmacies & labs, then dispatch invitation tokens.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-tide shrink-0" />
              <span>
                <strong>Clinical Prescribing:</strong> Look up patient NICs,
                review health records, and sign multi-item prescriptions.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-moss shrink-0" />
              <span>
                <strong>Pharmacy Dispensing:</strong> Verify prescription items
                against tamper-proof records and track partial fulfills.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span>
                <strong>Diagnostic Laboratory:</strong> Record standardized
                panels with normal reference ranges and attachments.
              </span>
            </li>
          </ul>
        </Card>

        <Card title="Session" eyebrow="Status">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Authentication</span>
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  isAuthenticated
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isAuthenticated
                  ? `Logged in (${user?.email})`
                  : "Awaiting login"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
