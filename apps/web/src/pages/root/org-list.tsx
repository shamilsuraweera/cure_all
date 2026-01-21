import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { fetchOrgs, updateOrgStatus } from "../../lib/root-admin";

export const OrgListPage = () => {
  const [page] = useState(1);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["orgs", page],
    queryFn: () => fetchOrgs(page),
  });

  const orgs = data?.data?.items ?? [];

  return (
    <div>
      <SectionHeader
        title="Organizations"
        subtitle="Activate or suspend orgs and verify their domains."
      />
      <Card title="Org registry" eyebrow="Root admin">
        {isLoading ? (
          <p>Loading organizations...</p>
        ) : (
          <div className="space-y-4">
            {orgs.length === 0 ? <p>No organizations yet.</p> : null}
            {orgs.map((org) => (
              <div
                key={org.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-800">{org.name}</p>
                  <p className="text-xs text-slate-400">
                    {org.type} · {org.domain ?? "no domain"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      org.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {org.status}
                  </span>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const nextStatus =
                        org.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                      await updateOrgStatus(org.id, nextStatus);
                      void refetch();
                    }}
                  >
                    {org.status === "ACTIVE" ? "Suspend" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
