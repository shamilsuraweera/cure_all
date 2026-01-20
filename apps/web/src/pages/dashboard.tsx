import { Card } from "../components/ui/card";

export const DashboardPage = () => (
  <div className="grid gap-6 lg:grid-cols-3">
    <Card title="Org Pulse" eyebrow="Root admin">
      Track active orgs, pending invites, and suspended accounts in one view.
    </Card>
    <Card title="Prescriptions" eyebrow="Clinical">
      Monitor dispensing status, over-dispense warnings, and audit trail events.
    </Card>
    <Card title="Lab Queue" eyebrow="Diagnostics">
      Review uploaded lab results, attach reports, and sync patient notifications.
    </Card>
    <Card title="Next Steps" eyebrow="Setup">
      Add more UI flows in Phase 11+ (auth, root admin actions, catalogs).
    </Card>
  </div>
);
