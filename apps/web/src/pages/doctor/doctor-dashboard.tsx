import { Link } from "react-router-dom";

import { Card } from "../../components/ui/card";
import { SectionHeader } from "../../components/root/section-header";

export const DoctorDashboardPage = () => (
  <div>
    <SectionHeader
      title="Doctor workspace"
      subtitle="Find patients, review history, and issue prescriptions."
    />
    <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/doctor/patients"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Patient lookup
      </Link>
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Patient lookup" eyebrow="Quick access">
        Search by NIC or email to open a patient profile.
      </Card>
      <Card title="Active prescriptions" eyebrow="Workflow">
        Review recent prescriptions and their dispensing status.
      </Card>
      <Card title="Lab results" eyebrow="Diagnostics">
        Check lab results linked to your patients.
      </Card>
    </div>
  </div>
);
