import { Link } from "react-router-dom";

import { Card } from "../../components/ui/card";
import { SectionHeader } from "../../components/root/section-header";

export const RootDashboardPage = () => (
  <div>
    <SectionHeader
      title="Root command"
      subtitle="Control onboarding, compliance, and patient operations from one hub."
    />
    <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/root/orgs"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Org registry
      </Link>
      <Link
        to="/root/medicines"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Medicines catalog
      </Link>
      <Link
        to="/root/lab-tests"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Lab test types
      </Link>
      <Link
        to="/root/orgs/create"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Create org
      </Link>
      <Link
        to="/root/medicines/create"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Create medicine
      </Link>
      <Link
        to="/root/lab-tests/create"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Create lab test
      </Link>
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Org pipeline" eyebrow="This week">
        Track new orgs, invitations, and activation requests.
      </Card>
      <Card title="Patient intake" eyebrow="Visibility">
        Review newly created patient profiles and guardian links.
      </Card>
      <Card title="Security posture" eyebrow="Audit">
        Monitor login activity and dispense audit events.
      </Card>
    </div>
  </div>
);
