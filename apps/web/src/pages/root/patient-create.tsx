import { useState } from "react";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createPatient } from "../../lib/root-admin";

export const PatientCreatePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nic, setNic] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await createPatient({
      email,
      password,
      nic,
      name: name || undefined,
      dob: dob || undefined,
      location: location || undefined,
      guardianEmail: guardianEmail || undefined,
    });

    if (result.ok) {
      setStatus("Patient created.");
      setEmail("");
      setPassword("");
      setNic("");
      setName("");
      setDob("");
      setLocation("");
      setGuardianEmail("");
      return;
    }

    setStatus(result.error?.message ?? "Failed to create patient");
  };

  return (
    <div>
      <SectionHeader
        title="Create patient"
        subtitle="Register a new patient and optionally link a guardian."
      />
      <Card title="Patient details" eyebrow="Intake">
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Patient email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <Input
            label="Temporary password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <Input label="NIC" value={nic} onChange={(e) => setNic(e.target.value)} required />
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Date of birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            type="date"
          />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input
            label="Guardian email (optional)"
            value={guardianEmail}
            onChange={(e) => setGuardianEmail(e.target.value)}
            type="email"
          />
          <Button type="submit">Create patient</Button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </form>
      </Card>
    </div>
  );
};
