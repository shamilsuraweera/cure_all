import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { acceptOrgInvite, verifyOrgInvite, type OrgInviteDetails } from "../../lib/root-admin";

export const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<OrgInviteDetails | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken && urlToken !== token) {
      setToken(urlToken);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!token.trim()) {
      setInviteDetails(null);
      return;
    }

    let isMounted = true;
    setVerifying(true);
    verifyOrgInvite(token.trim())
      .then((res) => {
        if (!isMounted) return;
        if (res.ok && res.data?.invite) {
          setInviteDetails(res.data.invite);
        } else {
          setInviteDetails(null);
        }
      })
      .catch(() => {
        if (isMounted) setInviteDetails(null);
      })
      .finally(() => {
        if (isMounted) setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setStatus({ message: "Password must be at least 8 characters.", tone: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ message: "Passwords do not match.", tone: "error" });
      return;
    }

    setLoading(true);
    setStatus(null);
    const result = await acceptOrgInvite({ token: token.trim(), password });
    setLoading(false);

    if (result.ok) {
      setStatus({
        message: "Invite accepted! Your account is created. You can now log in.",
        tone: "success",
      });
      setPassword("");
      setConfirmPassword("");
      return;
    }

    setStatus({
      message: result.error?.message ?? "Invite acceptance failed.",
      tone: "error",
    });
  };

  return (
    <div className="mx-auto max-w-xl">
      <SectionHeader
        title="Accept organization invite"
        subtitle="Activate your staff or clinical account with your invite token."
      />

      {inviteDetails ? (
        <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50/80 p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-sky-700">Invitation Details</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">Organization:</span>{" "}
              <strong className="text-slate-900">{inviteDetails.org.name}</strong>
            </div>
            <div>
              <span className="text-slate-500">Assigned Role:</span>{" "}
              <span className="inline-block rounded-full bg-sky-200 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                {inviteDetails.role}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Email:</span>{" "}
              <span className="font-mono text-xs text-slate-800">{inviteDetails.email}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{" "}
              <span className="font-medium text-emerald-700">{inviteDetails.status}</span>
            </div>
          </div>
        </div>
      ) : verifying ? (
        <p className="mb-4 text-xs text-slate-400">Verifying invite token...</p>
      ) : null}

      <Card title="Account setup" eyebrow="Onboarding">
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label="Invite token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            helperText="Check your invitation message or copy from Root Admin"
            required
          />
          <Input
            label="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Minimum 8 characters"
            required
          />
          <Input
            label="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Repeat password"
            required
          />

          {status ? (
            <div
              className={`rounded-2xl border p-4 text-sm ${
                status.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <p>{status.message}</p>
              {status.tone === "success" ? (
                <div className="mt-3">
                  <Link
                    to="/login"
                    className="inline-block rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    Go to Login &rarr;
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Activating account..." : "Accept invite"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
