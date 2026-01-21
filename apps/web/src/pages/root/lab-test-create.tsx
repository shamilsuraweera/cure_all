import { useState } from "react";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createLabTestType } from "../../lib/root-admin";

export const LabTestCreatePage = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setStatus("Name is required.");
      return;
    }

    const result = await createLabTestType({
      name,
      code: code || undefined,
      description: description || undefined,
    });

    if (result.ok) {
      setStatus("Lab test type created.");
      setName("");
      setCode("");
      setDescription("");
      return;
    }

    setStatus(result.error?.message ?? "Failed to create lab test type");
  };

  return (
    <div>
      <SectionHeader
        title="Create lab test type"
        subtitle="Add a new lab test category for results and measures."
      />
      <Card title="Lab test" eyebrow="Diagnostics">
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit">Create lab test type</Button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </form>
      </Card>
    </div>
  );
};
