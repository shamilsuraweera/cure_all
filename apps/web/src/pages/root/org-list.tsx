import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { fetchOrgs, updateOrgStatus } from "../../lib/root-admin";

export const OrgListPage = () => {
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["orgs", page],
    queryFn: () => fetchOrgs(page),
  });

  const orgs = data?.data?.items ?? [];

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      (org.domain && org.domain.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === "ALL" || org.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeader
          title="Organizations"
          subtitle="Activate or suspend orgs, configure domains, and manage clinical branches."
        />
        <div className="flex gap-2">
          <Link
            to="/root/orgs/create"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-slate-800 transition"
          >
            + Create Organization
          </Link>
          <Link
            to="/root/orgs/invite"
            className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-ink transition"
          >
            Invite Member
          </Link>
        </div>
      </div>

      <Card title="Org registry" eyebrow="Root admin">
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by organization name or domain..."
            />
          </div>
          <select
            className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-700 focus:outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="HOSPITAL">HOSPITAL</option>
            <option value="CLINIC">CLINIC</option>
            <option value="PHARMACY">PHARMACY</option>
            <option value="LAB">LAB</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-400">Loading organizations...</p>
        ) : (
          <div className="space-y-3">
            {filteredOrgs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No organizations found matching your criteria.
              </div>
            ) : null}
            {filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{org.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {org.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Domain: <code className="font-mono text-slate-600">{org.domain ?? "None (any email allowed)"}</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      org.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {org.status}
                  </span>
                  <Link
                    to={`/root/orgs/invite?orgId=${org.id}`}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                  >
                    + Invite
                  </Link>
                  <Button
                    variant="outline"
                    className="text-xs py-1 px-3"
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
