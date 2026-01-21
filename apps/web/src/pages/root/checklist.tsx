import { SectionHeader } from "../../components/root/section-header";
import { Card } from "../../components/ui/card";

const checklist = [
  "Create your first organization and set the domain.",
  "Invite at least one org admin.",
  "Verify pharmacy membership before dispensing.",
  "Create patient profiles and link guardians.",
  "Ensure lab test catalogs are complete.",
  "Review audit logs after first login cycle.",
];

export const RootChecklistPage = () => (
  <div>
    <SectionHeader
      title="Root flow checklist"
      subtitle="Follow this list before onboarding production orgs."
    />
    <Card title="Launch checklist" eyebrow="Operations">
      <ul className="space-y-3">
        {checklist.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  </div>
);
