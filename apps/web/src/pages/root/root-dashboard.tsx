import { Card } from "../../components/ui/card";
import { SectionHeader } from "../../components/root/section-header";

export const RootDashboardPage = () => (
  <div>
    <SectionHeader
      title="Root command"
      subtitle="Control onboarding, compliance, and patient operations from one hub."
    />
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
