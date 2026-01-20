import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export const HomePage = () => (
  <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
    <div className="rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-glow">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
        Version 0.1
      </p>
      <h2 className="mt-4 font-display text-4xl text-ink">
        Cure-All Control Room
      </h2>
      <p className="mt-4 text-base text-slate-600">
        Manage clinics, pharmacies, labs, and patient care workflows from a single
        operational cockpit. This web app is the secure hub for root admin and
        clinical teams.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button>Open Dashboard</Button>
        <Button variant="outline">View API Docs</Button>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card title="Mission Control" eyebrow="Realtime">
          Track prescriptions, lab results, and dispensing events with live
          audit trails.
        </Card>
        <Card title="Zero-Trust" eyebrow="Security">
          Cookies + refresh rotation + audit logging keep access locked down.
        </Card>
      </div>
    </div>
    <div className="flex flex-col gap-4">
      <Card title="Next Actions" eyebrow="Setup">
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-ember" />
            Invite org admins and verify pharmacy membership.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-tide" />
            Configure lab test catalogs before running lab uploads.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-moss" />
            Connect the mobile app with secure cookie support.
          </li>
        </ul>
      </Card>
      <Card title="Status" eyebrow="Environment">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>API</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
              Ready
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Auth</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
              Awaiting login
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Lab uploads</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              Standby
            </span>
          </div>
        </div>
      </Card>
    </div>
  </div>
);
