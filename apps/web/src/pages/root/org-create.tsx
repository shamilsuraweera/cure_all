import { useState } from "react";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createOrg, type OrgType } from "../../lib/root-admin";

const orgTypes: OrgType[] = ["HOSPITAL", "CLINIC", "PHARMACY", "LAB"];

export const OrgCreatePage = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState<OrgType>("HOSPITAL");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await createOrg({
      name,
      type,
      domain: domain.length > 0 ? domain : undefined,
    });

    if (response.ok) {
      setStatus("Organization created.");
      setName("");
      setDomain("");
      return;
    }

    setStatus(response.error?.message ?? "Failed to create org");
  };

  return (
    <div>
      <SectionHeader
        title="Create organization"
        subtitle="Register a new clinic, lab, pharmacy, or hospital."
      />
      <Card title="Org details" eyebrow="Onboarding">
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Organization name" value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Type</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-base text-slate-900"
              value={type}
              onChange={(e) => setType(e.target.value as OrgType)}
            >
              {orgTypes.map((orgType) => (
                <option key={orgType} value={orgType}>
                  {orgType}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Domain (optional)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            helperText="If set, invites must match this email domain."
          />
          <Button type="submit">Create org</Button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </form>
      </Card>
    </div>
  );
};
