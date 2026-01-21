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

  const searchQuery = useQuery({
    queryKey: ["lab-patient-search", nic, email, submitted],
    queryFn: () => searchPatients({ nic, email }),
    enabled: submitted && (Boolean(nic) || Boolean(email)),
  });

  const patients = searchQuery.data?.data?.patients ?? [];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <SectionHeader
        title="Patient lookup"
        subtitle="Search by NIC or email to open lab workflows."
      />
      <Card title="Search" eyebrow="Lab access">
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label="NIC"
            value={nic}
            onChange={(event) => setNic(event.target.value)}
            placeholder="2000XXXXXXXX"
          />
          <Input
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="patient@email.com"
          />
          <Button type="submit">Search</Button>
        </form>
      </Card>

      <Card title="Results" eyebrow="Patients">
        {searchQuery.isLoading ? (
          <p>Searching...</p>
        ) : (
          <div className="space-y-3">
            {submitted && patients.length === 0 ? <p>No patients found.</p> : null}
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {patient.name ?? "Patient"} · {patient.nic}
                  </p>
                  <p className="text-xs text-slate-400">{patient.user.email}</p>
                </div>
                <Link
                  to={`/lab/patients/${patient.id}`}
                  className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs text-slate-700 hover:text-ink"
                >
                  Open profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
