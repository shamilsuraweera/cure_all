import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const [nic, setNic] = useState("");

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (nic.trim()) {
      navigate(`/doctor/patients`);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Doctor workspace"
        subtitle="Search patient clinical profiles, review diagnostics, and sign electronic prescriptions."
      />

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Card title="Patient lookup" eyebrow="Direct access">
          <p className="text-sm text-slate-500 mb-4">
            Search patient charts using their National Identity Card (NIC) or email address.
          </p>
          <form onSubmit={handleLookup} className="flex gap-3">
            <div className="flex-1">
              <Input
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                placeholder="Enter patient NIC or email..."
              />
            </div>
            <Button type="submit">Open Patient Search</Button>
          </form>
          <div className="mt-4 flex gap-3 text-xs text-slate-500">
            <Link to="/doctor/patients" className="font-semibold text-tide hover:underline">
              Open Full Patient Lookup Directory &rarr;
            </Link>
          </div>
        </Card>

        <Card title="Clinical workflows" eyebrow="Quick actions">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
              <span>Find Patient & Prescribe</span>
              <Link
                to="/doctor/patients"
                className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                Lookup &rarr;
              </Link>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
              <span>Medicines Reference</span>
              <Link
                to="/root/medicines"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:text-ink transition"
              >
                Catalog
              </Link>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
              <span>Diagnostic Test Reference</span>
              <Link
                to="/root/lab-tests"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:text-ink transition"
              >
                Lab Tests
              </Link>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Electronic prescribing" eyebrow="Rx Safety">
          Issue prescriptions with multi-item capability, standardized dosage frequencies, duration limits, and automated unit tracking.
        </Card>
        <Card title="Diagnostic history" eyebrow="Lab data">
          Review lab panels and test measure sets with normal ranges displayed automatically for each result.
        </Card>
        <Card title="Tamper-proof audit" eyebrow="Compliance">
          All prescribing and dispensing events are cryptographically recorded with physician timestamps and actor IDs.
        </Card>
      </div>
    </div>
  );
};
