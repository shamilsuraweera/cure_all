import { useState } from "react";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { acceptOrgInvite } from "../../lib/root-admin";

export const InviteAcceptPage = () => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await acceptOrgInvite({ token, password });
    if (result.ok) {
      setStatus("Invite accepted.");
      return;
    }
    setStatus(result.error?.message ?? "Invite acceptance failed");
  };

  return (
    <div>
      <SectionHeader
        title="Accept invite"
        subtitle="Finalize new org member accounts from an invite token."
      />
      <Card title="Accept" eyebrow="Onboarding">
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Invite token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <Input
            label="Set password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <Button type="submit">Accept invite</Button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </form>
      </Card>
    </div>
  );
};
