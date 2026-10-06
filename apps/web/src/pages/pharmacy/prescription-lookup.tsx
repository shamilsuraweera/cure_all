import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { listPrescriptions } from "../../lib/pharmacy";

export const PharmacyPrescriptionLookupPage = () => {
  const [prescriptionId, setPrescriptionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const queueQuery = useQuery({
    queryKey: ["pharmacy-active-prescriptions"],
    queryFn: () => listPrescriptions({ pageSize: 20 }),
  });

  const prescriptions = queueQuery.data?.data?.prescriptions ?? [];

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
        title="Pharmacy dispensing queue"
        subtitle="Lookup prescriptions by ID or select from active orders to verify and dispense."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.8fr]">
        <Card title="Prescription lookup" eyebrow="Direct access">
          <form className="space-y-4" onSubmit={submit}>
            <Input
              label="Prescription ID"
              value={prescriptionId}
              onChange={(event) => setPrescriptionId(event.target.value)}
              placeholder="e.g. 550e8400-e29b-..."
              required
            />
            <Button type="submit">Open prescription</Button>
            {error ? <p className="text-sm text-rose-500 font-medium">{error}</p> : null}
          </form>
        </Card>

        <Card title="Pending prescription orders" eyebrow="Queue">
          {queueQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading prescription queue...</p>
          ) : (
            <div className="space-y-3">
              {prescriptions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No pending prescriptions in the system.
                </div>
              ) : null}
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          prescription.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : prescription.status === "PARTIALLY_DISPENSED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {prescription.status}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {prescription.id.slice(0, 18)}...
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      {prescription.items.map((i) => i.medicine.name).join(", ")}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Created: {new Date(prescription.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    to={`/pharmacy/prescriptions/${prescription.id}`}
                    className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white shadow-glow hover:bg-slate-800 transition"
                  >
                    Verify & Dispense &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
