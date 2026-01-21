import { Link } from "react-router-dom";

import { Card } from "../../components/ui/card";
import { SectionHeader } from "../../components/root/section-header";

export const PharmacyDashboardPage = () => (
  <div>
    <SectionHeader
      title="Pharmacy console"
      subtitle="Verify prescriptions, dispense safely, and track history."
    />
    <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/pharmacy/prescriptions"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 hover:text-ink"
      >
        Open prescription
      </Link>
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Verify" eyebrow="Workflow">
        Enter a prescription ID to confirm status and remaining quantities.
      </Card>
      <Card title="Dispense" eyebrow="Safety">
        Dispense line items with automatic over-dispense protection.
      </Card>
      <Card title="History" eyebrow="Audit">
        Review dispense records for each prescription and pharmacy org.
      </Card>
    </div>
  </div>
);
