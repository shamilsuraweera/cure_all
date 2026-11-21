import { useState } from "react";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createMedicine, type MedicineForm } from "../../lib/root-admin";

const forms: MedicineForm[] = [
  "TABLET",
  "CAPSULE",
  "SYRUP",
  "INJECTION",
  "CREAM",
  "OTHER",
];

export const MedicineCreatePage = () => {
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState<MedicineForm>("TABLET");
  const [manufacturer, setManufacturer] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setStatus("Name is required.");
      return;
    }

    const result = await createMedicine({
      name,
      genericName: genericName || undefined,
      strength: strength || undefined,
      form,
      manufacturer: manufacturer || undefined,
      notes: notes || undefined,
    });

    if (result.ok) {
      setStatus("Medicine created.");
      setName("");
      setGenericName("");
      setStrength("");
      setManufacturer("");
      setNotes("");
      return;
    }

    setStatus(result.error?.message ?? "Failed to create medicine");
  };

  const guardedSubmit = async (event: React.FormEvent) => {
    if (submitting) {
      event.preventDefault();
      return;
    }
    setSubmitting(true);
    try {
      await submit(event);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Create medicine"
        subtitle="Add a new medicine to the catalog."
      />
      <Card title="Medicine details" eyebrow="Catalogs">
        <form
          className="space-y-4"
          onSubmit={(event) => void guardedSubmit(event)}
        >
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Generic name"
            value={genericName}
            onChange={(e) => setGenericName(e.target.value)}
          />
          <Input
            label="Strength"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
          />
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Form</span>
            <select
              className="rounded-2xl border border-teal-100 bg-white/90 px-4 py-2 text-base text-slate-900"
              value={form}
              onChange={(e) => setForm(e.target.value as MedicineForm)}
            >
              {forms.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          />
          <Input
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button type="submit" loading={submitting}>
            Create medicine
          </Button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </form>
      </Card>
    </div>
  );
};
