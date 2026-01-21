import { useState } from "react";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { inviteOrgMember } from "../../lib/root-admin";

const roles = ["ORG_ADMIN", "DOCTOR", "PHARMACIST", "LAB_TECH", "STAFF"];

export const OrgInvitePage = () => {
  const [orgId, setOrgId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await inviteOrgMember(orgId, { email, role });
    if (result.ok) {
      setStatus("Invite sent.");
      setEmail("");
      return;
    }
    setStatus(result.error?.message ?? "Invite failed");
  };

  return (
    <div>
      <SectionHeader
        title="Invite org member"
        subtitle="Send onboarding invites for org admins, clinicians, and staff."
      />
      <Card title="Invite" eyebrow="Access control">
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label="Organization ID"
            value={orgId}
            onChange={(event) => setOrgId(event.target.value)}
            required
          />
          <Input
            label="Invitee email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Role</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-base text-slate-900"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {roles.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit">Send invite</Button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </form>
      </Card>
    </div>
  );
};
