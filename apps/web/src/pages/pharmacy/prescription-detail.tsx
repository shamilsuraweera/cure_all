import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  dispensePrescription,
  fetchDispenseHistory,
  verifyPrescription,
} from "../../lib/pharmacy";

export const PharmacyPrescriptionDetailPage = () => {
  const { id = "" } = useParams();
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  const verifyQuery = useQuery({
    queryKey: ["pharmacy-verify", id],
    queryFn: () => verifyPrescription(id),
    enabled: Boolean(id),
  });

  const historyQuery = useQuery({
    queryKey: ["pharmacy-history", id],
    queryFn: () => fetchDispenseHistory(id),
    enabled: Boolean(id),
  });

  const prescription = verifyQuery.data?.data?.prescription;
  const remainingItems = verifyQuery.data?.data?.remainingItems ?? [];
  const dispenseHistory = historyQuery.data?.data?.dispenseRecords ?? [];

  const remainingById = useMemo(
    () => new Map(remainingItems.map((item) => [item.prescriptionItemId, item])),
    [remainingItems],
  );

  const updateQuantity = (itemId: string, value: string) => {
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const submitDispense = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prescription) {
      setStatus({ message: "Verify the prescription before dispensing.", tone: "error" });
      return;
    }

    const payloadItems = prescription.items
      .map((item) => ({
        prescriptionItemId: item.id,
        quantity: Number(quantities[item.id] || 0),
      }))
      .filter((item) => item.quantity > 0);

    if (payloadItems.length === 0) {
      setStatus({ message: "Enter at least one quantity to dispense.", tone: "error" });
      return;
    }

    for (const item of payloadItems) {
      const remaining = remainingById.get(item.prescriptionItemId);
      if (remaining && item.quantity > remaining.remainingQuantity) {
        setStatus({
          message: "Over-dispensing is not allowed. Check remaining quantities.",
          tone: "error",
        });
        return;
      }
    }

    const result = await dispensePrescription(id, {
      notes: notes || undefined,
      items: payloadItems,
    });

    if (result.ok) {
      setStatus({ message: "Dispense recorded.", tone: "success" });
      setNotes("");
      setQuantities({});
      void verifyQuery.refetch();
      void historyQuery.refetch();
      return;
    }

    setStatus({
      message: result.error?.message ?? "Failed to dispense prescription.",
      tone: "error",
    });
  };

  const verifyError =
    verifyQuery.data && !verifyQuery.data.ok
      ? verifyQuery.data.error?.message
      : null;

  return (
    <div>
      <SectionHeader
        title="Prescription detail"
        subtitle={id ? `ID: ${id}` : "Review prescription and dispense items."}
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Button type="button" onClick={() => void verifyQuery.refetch()}>
          Re-verify prescription
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Verification" eyebrow="Status check">
          {verifyQuery.isLoading ? (
            <p>Checking prescription...</p>
          ) : verifyError ? (
            <p className="text-rose-500">{verifyError}</p>
          ) : prescription ? (
            <div className="space-y-3">
              <p className="font-medium text-slate-800">
                Status: <span className="text-ink">{prescription.status}</span>
              </p>
              <p className="text-xs text-slate-400">
                Created {new Date(prescription.createdAt).toLocaleString()}
              </p>
              <div className="space-y-2">
                {prescription.items.map((item) => {
                  const remaining = remainingById.get(item.id);
                  const dispensed = remaining?.dispensedQuantity ?? 0;
                  const remainingQty = remaining?.remainingQuantity ?? item.quantity;
                  const percent = Math.min(100, Math.round((dispensed / item.quantity) * 100));
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.medicine.name}{" "}
                            {item.medicine.strength ? `· ${item.medicine.strength}` : ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.dose} · {item.frequency} · {item.durationDays} days
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {dispensed} / {item.quantity} dispensed
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            percent === 100 ? "bg-emerald-500" : percent > 0 ? "bg-amber-500" : "bg-slate-300"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-slate-500 pt-1">
                        <span>Remaining to dispense:</span>
                        <strong className="text-slate-800">{remainingQty} units</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Verifying prescription details...</p>
          )}
        </Card>

        <Card title="Dispense medication" eyebrow="Pharmacy action">
          <form className="space-y-4" onSubmit={submitDispense}>
            {prescription?.items.map((item) => {
              const remaining = remainingById.get(item.id);
              const remainingQty = remaining?.remainingQuantity ?? 0;
              const value = quantities[item.id] ?? "";
              const numericValue = Number(value || 0);
              const overLimit = numericValue > remainingQty;
              return (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">{item.medicine.name}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, String(remainingQty))}
                      disabled={remainingQty === 0}
                      className="text-xs font-semibold text-tide hover:underline disabled:opacity-40"
                    >
                      Fill Max ({remainingQty})
                    </button>
                  </div>
                  <Input
                    label=""
                    placeholder={`Qty to dispense (max ${remainingQty})`}
                    value={value}
                    onChange={(event) => updateQuantity(item.id, event.target.value)}
                    type="number"
                    min={0}
                    max={remainingQty}
                    disabled={remainingQty === 0}
                    className={overLimit ? "border-rose-400 focus:border-rose-500" : ""}
                  />
                </div>
              );
            })}
            <Input
              label="Dispense Notes / Verification ID"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. Batch #4912, patient identity verified."
            />
            <Button type="submit">Complete Dispense</Button>
            {status ? (
              <div
                className={`rounded-2xl border p-3.5 text-sm ${
                  status.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {status.message}
              </div>
            ) : null}
          </form>
        </Card>
      </div>

      <Card title="Dispense history" eyebrow="Audit">
        {historyQuery.isLoading ? (
          <p>Loading dispense history...</p>
        ) : (
          <div className="space-y-3">
            {dispenseHistory.length === 0 ? <p>No dispense records yet.</p> : null}
            {dispenseHistory.map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <p className="font-medium text-slate-800">
                  {record.status}{" "}
                  <span className="text-xs text-slate-400">
                    · {new Date(record.createdAt).toLocaleString()}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {record.pharmacyOrg?.name ?? "Pharmacy org"}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {record.items.map((item) => (
                    <li key={item.id}>
                      {item.prescriptionItem.medicine.name}: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
