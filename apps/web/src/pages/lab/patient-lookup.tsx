import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { searchPatients } from "../../lib/lab";

export const LabPatientLookupPage = () => {
  const [nic, setNic] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const searchQuery = useQuery({
    queryKey: ["lab-patient-search", nic, email, submitted],
    queryFn: () => searchPatients({ nic: nic.trim(), email: email.trim() }),
    enabled: submitted && (Boolean(nic.trim()) || Boolean(email.trim())),
  });

  const patients = searchQuery.data?.data?.patients ?? [];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!nic.trim() && !email.trim()) {
      setValidationError("Please enter an NIC or Email to search.");
      return;
    }
    setValidationError(null);
    setSubmitted(true);
  };

  const handleClear = () => {
    setNic("");
    setEmail("");
    setSubmitted(false);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Patient lookup"
        subtitle="Search by NIC or email to open lab testing and record diagnostic values."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Search" eyebrow="Lab access">
          <form className="space-y-4" onSubmit={submit}>
            <Input
              label="NIC"
              value={nic}
              onChange={(event) => {
                setNic(event.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. 2000XXXXXXXX"
            />
            <Input
              label="Email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (validationError) setValidationError(null);
              }}
              type="email"
              placeholder="patient@email.com"
            />

            {validationError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {validationError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button type="submit" disabled={searchQuery.isLoading || searchQuery.isFetching}>
                {searchQuery.isLoading || searchQuery.isFetching ? "Searching..." : "Search"}
              </Button>
              {submitted || nic || email ? (
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              ) : null}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400">
                Tip: Search matches partial National ID Card (NIC) or email address.
              </p>
            </div>
          </form>
        </Card>

        <Card
          title="Results"
          eyebrow={
            submitted && !searchQuery.isLoading
              ? `${patients.length} match${patients.length === 1 ? "" : "es"}`
              : "Patients"
          }
        >
          {searchQuery.isLoading || searchQuery.isFetching ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-tide border-t-transparent" />
              <p className="mt-3 text-sm">Searching patient database...</p>
            </div>
          ) : !submitted ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-slate-500">
              <p className="font-medium text-slate-700">Enter search criteria above</p>
              <p className="mt-1 text-xs text-slate-400">
                Look up a patient to enter lab test values, diagnostic measures, and upload report attachments.
              </p>
            </div>
          ) : patients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-6 text-center text-amber-900">
              <p className="font-medium">No matching patients found</p>
              <p className="mt-1 text-xs text-amber-700">
                No patient found matching "{nic || email}". Verify the NIC or email address.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
                <span>Showing {patients.length} result(s)</span>
                <span>Sorted by recent</span>
              </div>
              {patients.map((patient) => {
                const initials = (patient.name || patient.nic || "P")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={patient.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 font-bold text-teal-700">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">
                            {patient.name ?? "Patient"}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            NIC: {patient.nic}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{patient.user.email}</p>
                      </div>
                    </div>
                    <Link to={`/lab/patients/${patient.id}`}>
                      <Button variant="outline" className="text-xs font-semibold">
                        Record Lab &rarr;
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
