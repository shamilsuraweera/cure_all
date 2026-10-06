import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { fetchOrgs, inviteOrgMember, type OrgInvite } from "../../lib/root-admin";

const roles = [
  { value: "DOCTOR", label: "Doctor (Clinical Prescriber)" },
  { value: "PHARMACIST", label: "Pharmacist (Dispenser)" },
  { value: "LAB_TECH", label: "Lab Technician (Diagnostics)" },
  { value: "ORG_ADMIN", label: "Organization Admin" },
  { value: "STAFF", label: "Support Staff" },
];

export const OrgInvitePage = () => {
  const [searchParams] = useSearchParams();
  const [orgId, setOrgId] = useState(searchParams.get("orgId") ?? "");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0].value);
  const [status, setStatus] = useState<string | null>(null);
  const [createdInvite, setCreatedInvite] = useState<OrgInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const orgsQuery = useQuery({
    queryKey: ["orgs-for-invite"],
    queryFn: () => fetchOrgs(1, 100),
  });

  const orgList = orgsQuery.data?.data?.items ?? [];

  useEffect(() => {
    const paramOrgId = searchParams.get("orgId");
    if (paramOrgId) {
      setOrgId(paramOrgId);
    } else if (orgList.length > 0 && !orgId) {
      setOrgId(orgList[0].id);
    }
  }, [searchParams, orgList, orgId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!orgId) {
      setStatus("Please select an organization.");
      return;
    }

    setLoading(true);
    setStatus(null);
    setCreatedInvite(null);
    const result = await inviteOrgMember(orgId, { email, role });
    setLoading(false);

    if (result.ok && result.data?.invite) {
      setCreatedInvite(result.data.invite);
      setStatus("Invitation generated successfully!");
      setEmail("");
      return;
    }

    setStatus(result.error?.message ?? "Invite generation failed");
  };

  const inviteLink = createdInvite
    ? `${window.location.origin}/invite/accept?token=${createdInvite.token}`
    : "";

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-xl">
      <SectionHeader
        title="Invite organization member"
        subtitle="Onboard clinicians, pharmacists, and staff with secure single-use tokens."
      />

      <Card title="Member details" eyebrow="Access control">
        <form className="space-y-4" onSubmit={submit}>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Organization</span>
            {orgsQuery.isLoading ? (
              <span className="text-xs text-slate-400">Loading organizations...</span>
            ) : orgList.length > 0 ? (
              <select
                className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-base text-slate-900 focus:border-tide focus:outline-none"
                value={orgId}
                onChange={(event) => setOrgId(event.target.value)}
                required
              >
                {orgList.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.type}) {org.domain ? `· @${org.domain}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={orgId}
                onChange={(event) => setOrgId(event.target.value)}
                placeholder="Enter organization ID"
                required
              />
            )}
          </label>

          <Input
            label="Invitee email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="colleague@clinic.org"
            helperText="If the organization has a domain restriction, the email must match that domain."
            required
          />

          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Role & Responsibilities</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-base text-slate-900 focus:border-tide focus:outline-none"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {roles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" disabled={loading}>
            {loading ? "Generating invite..." : "Send & Generate Invite"}
          </Button>

          {status && !createdInvite ? (
            <p className="text-sm font-medium text-rose-600">{status}</p>
          ) : null}
        </form>

        {createdInvite ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
                Invite Generated!
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                Expires in 7 days
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-700">
              Share this invite link with <strong>{createdInvite.email}</strong> to set up their password and join the workspace.
            </p>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-2">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 bg-transparent font-mono text-xs text-slate-700 outline-none"
              />
              <Button variant="outline" className="text-xs py-1 px-3" onClick={copyLink}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Token: <code className="font-mono text-emerald-900">{createdInvite.token.slice(0, 13)}...</code></span>
              <Link
                to={`/invite/accept?token=${createdInvite.token}`}
                className="font-semibold text-emerald-800 underline hover:text-emerald-900"
              >
                Open accept form &rarr;
              </Link>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
};
