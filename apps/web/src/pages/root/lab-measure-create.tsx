import { useState } from "react";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createLabMeasure } from "../../lib/root-admin";

export const LabMeasureCreatePage = () => {
  const [labTestTypeId, setLabTestTypeId] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [normalMin, setNormalMin] = useState("");
  const [normalMax, setNormalMax] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!labTestTypeId.trim()) {
      setStatus("Lab test type ID is required.");
      return;
    }
    if (!name.trim()) {
      setStatus("Measure name is required.");
      return;
    }

    const payload = {
      name,
      unit: unit || undefined,
      normalRangeMin: normalMin ? Number(normalMin) : undefined,
      normalRangeMax: normalMax ? Number(normalMax) : undefined,
    };

    const result = await createLabMeasure(labTestTypeId, payload);
    if (result.ok) {
      setStatus("Measure created.");
      setName("");
      setUnit("");
      setNormalMin("");
      setNormalMax("");
      return;
    }

    setStatus(result.error?.message ?? "Failed to create measure");
  };

  return (
    <div>
      <SectionHeader
        title="Create lab measure"
        subtitle="Attach measurable fields to a lab test type."
      />
      <Card title="Measure" eyebrow="Diagnostics">
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label="Lab test type ID"
            value={labTestTypeId}
            onChange={(e) => setLabTestTypeId(e.target.value)}
            required
          />
          <Input label="Measure name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
          <Input
            label="Normal range min"
            value={normalMin}
            onChange={(e) => setNormalMin(e.target.value)}
            type="number"
          />
          <Input
            label="Normal range max"
            value={normalMax}
            onChange={(e) => setNormalMax(e.target.value)}
            type="number"
          />
          <Button type="submit">Create measure</Button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </form>
      </Card>
    </div>
  );
};
