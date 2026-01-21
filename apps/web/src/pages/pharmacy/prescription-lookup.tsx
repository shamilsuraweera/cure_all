import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const PharmacyPrescriptionLookupPage = () => {
  const [prescriptionId, setPrescriptionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!prescriptionId.trim()) {
      setError("Enter a prescription ID to continue.");
      return;
    }
    setError(null);
    navigate(`/pharmacy/prescriptions/${prescriptionId.trim()}`);
  };

  return (
    <div>
      <SectionHeader
        title="Open prescription"
        subtitle="Enter the prescription ID and verify before dispensing."
      />
      <Card title="Prescription lookup" eyebrow="Pharmacy">
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label="Prescription ID"
            value={prescriptionId}
            onChange={(event) => setPrescriptionId(event.target.value)}
            placeholder="e.g. presc_123..."
            required
          />
          <Button type="submit">Open prescription</Button>
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        </form>
      </Card>
    </div>
  );
};
