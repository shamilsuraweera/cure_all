import { Link } from "react-router-dom";

import { Card } from "../../components/ui/card";
import { SectionHeader } from "../../components/root/section-header";

export const LabDashboardPage = () => (
  <div>
    <SectionHeader
      title="Lab command center"
      subtitle="Record lab results, attach reports, and review patient history."
    />
    <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/lab/patients"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Patient lookup
      </Link>
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Create results" eyebrow="Workflow">
        Select a patient, choose lab test types, and capture measure values.
      </Card>
      <Card title="Attachments" eyebrow="Documents">
        Upload PDFs or image reports to keep lab results complete.
      </Card>
      <Card title="History" eyebrow="Timeline">
        Review lab results and attachment logs in one place.
      </Card>
    </div>
  </div>
);
