import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Card } from "../../components/ui/card";
import { SectionHeader } from "../../components/root/section-header";
import { fetchAdminStats } from "../../lib/root-admin";

export const RootDashboardPage = () => {
  const statsQuery = useQuery({
    queryKey: ["root-admin-stats"],
    queryFn: () => fetchAdminStats(),
  });

  const stats = statsQuery.data?.data?.stats;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Root command"
        subtitle="Manage organization onboarding, diagnostic catalogs, drug formulary, and patient intake."
      />

      {/* Live Telemetry KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Organizations
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-ink">
              {stats ? stats.totalOrgs : "—"}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              {stats ? `${stats.activeOrgs} Active` : "Active"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Hospitals, clinics, pharmacies & labs</p>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Drug Formulary
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-ink">
              {stats ? stats.totalMedicines : "—"}
            </span>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
              Medicines
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Available pharmaceutical catalog items</p>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Diagnostic Panels
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-ink">
              {stats ? stats.totalLabTests : "—"}
            </span>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
              Test Types
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Standardized diagnostic procedures</p>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Enrolled Patients
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-ink">
              {stats ? stats.totalPatients : "—"}
            </span>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
              Profiles
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Validated National ID records</p>
        </div>
      </div>

      {/* Categorized Operational Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Organizations Section */}
        <Card title="Organization control" eyebrow="Branches">
          <p className="text-xs text-slate-500 mb-4">
            Manage provider organizations, configure domain locks, and issue member invites.
          </p>
          <div className="space-y-2">
            <Link
              to="/root/orgs"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>View Organizations Registry</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/root/orgs/create"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>+ Create New Organization</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/root/orgs/invite"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>Invite Staff & Clinicians</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </Card>

        {/* Clinical Catalogs Section */}
        <Card title="Formulary & Diagnostics" eyebrow="Catalogs">
          <p className="text-xs text-slate-500 mb-4">
            Maintain the national medicines directory and lab test measurement definitions.
          </p>
          <div className="space-y-2">
            <Link
              to="/root/medicines"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>Medicines Directory</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/root/medicines/create"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>+ Add New Medicine</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/root/lab-tests"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>Lab Test Definitions</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/root/lab-tests/measures"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>+ Define Lab Measure Range</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </Card>

        {/* Patient Intake & Compliance */}
        <Card title="Intake & Operations" eyebrow="Administration">
          <p className="text-xs text-slate-500 mb-4">
            Patient registration, guardian linkage, and compliance operational checklist.
          </p>
          <div className="space-y-2">
            <Link
              to="/root/patients/create"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>+ Register New Patient</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/root/checklist"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>Launch Readiness Checklist</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/invite/accept"
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span>Member Accept Portal</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
