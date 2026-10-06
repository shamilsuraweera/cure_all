import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../auth/auth-context";
import { apiClient } from "../lib/api-client";
import { fetchAdminStats } from "../lib/root-admin";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quickSearchNic, setQuickSearchNic] = useState("");

  const isRootAdmin = user?.globalRole === "ROOT_ADMIN";
  const isDoctor = isRootAdmin || user?.orgRoles?.includes("DOCTOR");
  const isPharmacist = isRootAdmin || user?.orgRoles?.includes("PHARMACIST");
  const isLabTech = isRootAdmin || user?.orgRoles?.includes("LAB_TECH");

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchAdminStats(),
    enabled: isRootAdmin,
  });

  const healthQuery = useQuery({
    queryKey: ["system-health"],
    queryFn: () => apiClient.get<{ status: string }>("/health"),
    refetchInterval: 30000,
  });

  const stats = statsQuery.data?.data?.stats;

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchNic.trim()) return;
    if (isDoctor) {
      navigate(`/doctor/patients`);
    } else if (isLabTech) {
      navigate(`/lab/patients`);
    } else {
      navigate(`/doctor/patients`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-[32px] border border-white/80 bg-white/70 p-6 md:p-8 shadow-glow backdrop-blur flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Clinical Control Center
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl text-ink font-bold">
            Welcome back, {user?.email?.split("@")[0] ?? "Clinician"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Coordinating care operations across hospitals, outpatient clinics, diagnostics, and pharmacies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ink px-3.5 py-1 text-xs font-semibold text-white">
            {user?.globalRole ?? "USER"}
          </span>
          {user?.orgRoles?.map((role) => (
            <span
              key={role}
              className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Organizations
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-ink">
              {stats ? stats.totalOrgs : "—"}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              {stats ? `${stats.activeOrgs} Active` : "Online"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Hospitals, clinics, labs & pharmacies</p>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Registered Patients
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-ink">
              {stats ? stats.totalPatients : "—"}
            </span>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
              National Registry
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Profiles linked with verified NIC identifiers</p>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Prescriptions
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-ink">
              {stats ? stats.totalPrescriptions : "—"}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {stats ? `${stats.dispensedPrescriptions} Dispensed` : "Active"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Orders tracked across clinical pharmacies</p>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Diagnostics
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-ink">
              {stats ? stats.totalLabResults : "—"}
            </span>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
              {stats ? `${stats.totalLabTests} Types` : "Diagnostic"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Laboratory results and measure sets recorded</p>
        </div>
      </div>

      {/* Main Workspace Hub & Launchpad */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">
          Operational Cockpit
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Doctor Card */}
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-semibold text-sky-600">
                  Clinical
                </span>
                <div className="flex items-center gap-1.5">
                  {isDoctor ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Authorized
                    </span>
                  ) : null}
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs text-sky-700 font-medium">
                    Doctor
                  </span>
                </div>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">Doctor Workspace</h3>
              <p className="mt-2 text-sm text-slate-600">
                Search patients by National ID or email, inspect medical history, review lab panels, and issue digital prescriptions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/doctor/patients"
                className="text-xs font-semibold text-ink hover:text-sky-600 transition flex items-center gap-1"
              >
                Open Patient Lookup &rarr;
              </Link>
              <Link
                to="/doctor"
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                Doctor Hub
              </Link>
            </div>
          </div>

          {/* Pharmacy Card */}
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-semibold text-emerald-600">
                  Dispensing
                </span>
                <div className="flex items-center gap-1.5">
                  {isPharmacist ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Authorized
                    </span>
                  ) : null}
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700 font-medium">
                    Pharmacy
                  </span>
                </div>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">Pharmacy Dispenser</h3>
              <p className="mt-2 text-sm text-slate-600">
                Verify prescription authenticity, monitor remaining balances, prevent over-dispensing, and record batch transactions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/pharmacy/prescriptions"
                className="text-xs font-semibold text-ink hover:text-emerald-600 transition flex items-center gap-1"
              >
                View Dispensing Queue &rarr;
              </Link>
              <Link
                to="/pharmacy"
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                Pharmacy Hub
              </Link>
            </div>
          </div>

          {/* Lab Card */}
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-semibold text-purple-600">
                  Diagnostics
                </span>
                <div className="flex items-center gap-1.5">
                  {isLabTech ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Authorized
                    </span>
                  ) : null}
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs text-purple-700 font-medium">
                    Laboratory
                  </span>
                </div>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">Diagnostic Laboratory</h3>
              <p className="mt-2 text-sm text-slate-600">
                Log patient specimens, input automated measure ranges with standard units, and upload diagnostic report attachments.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/lab/patients"
                className="text-xs font-semibold text-ink hover:text-purple-600 transition flex items-center gap-1"
              >
                Find Lab Patient &rarr;
              </Link>
              <Link
                to="/lab"
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                Lab Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search & Platform Status */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Quick patient search" eyebrow="Direct Lookup">
          <p className="text-sm text-slate-500 mb-4">
            Quickly locate patient charts by National Identity Card (NIC) or email address to review treatment history.
          </p>
          <form onSubmit={handleQuickSearch} className="flex gap-3">
            <div className="flex-1">
              <Input
                value={quickSearchNic}
                onChange={(e) => setQuickSearchNic(e.target.value)}
                placeholder="Enter NIC number (e.g. 199012345678 or 901234567V)"
              />
            </div>
            <Button type="submit">
              Lookup &rarr;
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            <span>Fast shortcuts:</span>
            <Link to="/doctor/patients" className="underline hover:text-ink">
              Doctor Patient Search
            </Link>
            <span>·</span>
            <Link to="/lab/patients" className="underline hover:text-ink">
              Lab Patient Search
            </Link>
            {isRootAdmin ? (
              <>
                <span>·</span>
                <Link to="/root/patients/create" className="underline hover:text-ink">
                  + Register New Patient
                </Link>
              </>
            ) : null}
          </div>
        </Card>

        <Card title="System telemetry" eyebrow="Environment">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
              <span className="font-medium text-slate-700">API Health</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                {healthQuery.data?.ok ? "Online (200 OK)" : "Checking..."}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
              <span className="font-medium text-slate-700">Session Security</span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 font-bold text-sky-800">
                HTTP-Only Cookie Rotation
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
              <span className="font-medium text-slate-700">Audit Trail</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-bold text-indigo-800">
                Active & Immutable
              </span>
            </div>
            {isRootAdmin ? (
              <div className="pt-2">
                <Link
                  to="/root"
                  className="block text-center rounded-2xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:text-ink shadow-sm transition"
                >
                  Open Root Admin Control Hub &rarr;
                </Link>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
};
