import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { searchPatients } from "../../lib/doctor";

export const PatientLookupPage = () => {
  const [nic, setNic] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["doctor-patients", nic, email, submitted],
    queryFn: () => searchPatients({ nic, email }),
    enabled: false,
  });

  const patients = data?.data?.patients ?? [];

  return (
    <div>
      <SectionHeader
        title="Patient lookup"
        subtitle="Search by NIC or email to open a patient profile."
      />
      <Card title="Search" eyebrow="Doctors">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitted(true);
            await refetch();
          }}
        >
          <Input label="NIC" value={nic} onChange={(e) => setNic(e.target.value)} />
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <Button type="submit">Search</Button>
        </form>
      </Card>
      <Card title="Results" eyebrow="Matches">
        {isLoading ? (
          <p>Searching...</p>
        ) : (
          <div className="space-y-3">
            {patients.length === 0 ? <p>No patients found.</p> : null}
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-800">{patient.name ?? "Unnamed"}</p>
                  <p className="text-xs text-slate-400">
                    {patient.nic} · {patient.user.email}
                  </p>
                </div>
                <Link to={`/doctor/patients/${patient.id}`}>
                  <Button variant="outline">Open</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
