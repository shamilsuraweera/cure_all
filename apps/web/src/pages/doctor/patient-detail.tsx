import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  createPrescription,
  fetchMedicines,
  getPatientLabResults,
  getPatientPrescriptions,
  getPatientProfile,
} from "../../lib/doctor";

type PrescriptionDraftItem = {
  medicineId: string;
  dose: string;
  frequency: string;
  durationDays: string;
  quantity: string;
  instructions: string;
};

const frequencyOptions = [
  "Once daily",
  "Twice daily (BID)",
  "Three times daily (TID)",
  "Four times daily (QID)",
  "Every 8 hours",
  "Every 12 hours",
  "Once weekly",
  "As needed (PRN)",
];

const initialItem: PrescriptionDraftItem = {
  medicineId: "",
  dose: "500mg",
  frequency: "Twice daily (BID)",
  durationDays: "7",
  quantity: "14",
  instructions: "Take with or after meals.",
};

export const PatientDetailPage = () => {
  const { id = "" } = useParams();
  const [note, setNote] = useState("");
  const [items, setItems] = useState<PrescriptionDraftItem[]>([{ ...initialItem }]);
  const [status, setStatus] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const patientQuery = useQuery({
    queryKey: ["doctor-patient", id],
    queryFn: () => getPatientProfile(id),
    enabled: Boolean(id),
  });

  const prescriptionsQuery = useQuery({
    queryKey: ["doctor-prescriptions", id],
    queryFn: () => getPatientPrescriptions(id),
    enabled: Boolean(id),
  });

  const labResultsQuery = useQuery({
    queryKey: ["doctor-labs", id],
    queryFn: () => getPatientLabResults(id),
    enabled: Boolean(id),
  });

  const medicinesQuery = useQuery({
    queryKey: ["doctor-medicines"],
    queryFn: async () => {
      if (typeof fetchMedicines === "function") {
        return fetchMedicines();
      }
      return { ok: true, data: { items: [] } };
    },
  });

  const patient = patientQuery.data?.data?.patient;
  const prescriptions = prescriptionsQuery.data?.data?.prescriptions ?? [];
  const labResults = labResultsQuery.data?.data?.labResults ?? [];
  const medicineCatalog = medicinesQuery.data?.data?.items ?? [];

  const updateItem = (index: number, field: keyof PrescriptionDraftItem, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...initialItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const submitPrescription = async (event: React.FormEvent) => {
    event.preventDefault();

    const invalidItem = items.find(
      (item) =>
        !item.medicineId.trim() ||
        !item.dose.trim() ||
        !item.frequency.trim() ||
        !item.durationDays ||
        !item.quantity,
    );

    if (invalidItem) {
      setStatus({
        message: "Please fill in all medication fields (medicine, dose, frequency, duration, quantity).",
        tone: "error",
      });
      return;
    }

    setLoading(true);
    setStatus(null);
    const result = await createPrescription(id, {
      notes: note.trim() || undefined,
      items: items.map((item) => ({
        medicineId: item.medicineId.trim(),
        dose: item.dose.trim(),
        frequency: item.frequency.trim(),
        durationDays: Number(item.durationDays),
        quantity: Number(item.quantity),
        instructions: item.instructions.trim() || undefined,
      })),
    });
    setLoading(false);

    if (result.ok) {
      setStatus({ message: "Prescription successfully created and signed.", tone: "success" });
      setItems([{ ...initialItem }]);
      setNote("");
      void prescriptionsQuery.refetch();
      return;
    }

    setStatus({
      message: result.error?.message ?? "Failed to create prescription",
      tone: "error",
    });
  };

  return (
    <div>
      <SectionHeader
        title={patient?.name ?? "Patient profile"}
        subtitle={patient ? `NIC: ${patient.nic} · Email: ${patient.user.email}` : ""}
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card title="Create prescription" eyebrow="Doctor">
          <form className="space-y-6" onSubmit={submitPrescription}>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Medication #{idx + 1}
                    </span>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Medicine</span>
                      {medicineCatalog.length > 0 ? (
                        <select
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-tide focus:outline-none"
                          value={item.medicineId}
                          onChange={(e) => updateItem(idx, "medicineId", e.target.value)}
                          required
                        >
                          <option value="">-- Select medicine from catalog --</option>
                          {medicineCatalog.map((med) => (
                            <option key={med.id} value={med.id}>
                              {med.name} {med.strength ? `(${med.strength})` : ""} · {med.form}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          label=""
                          aria-label="Medicine ID"
                          placeholder="Select or enter medicine ID"
                          value={item.medicineId}
                          onChange={(e) => updateItem(idx, "medicineId", e.target.value)}
                          required
                        />
                      )}
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Dose"
                        value={item.dose}
                        onChange={(e) => updateItem(idx, "dose", e.target.value)}
                        placeholder="e.g. 500mg, 1 tablet"
                        required
                      />
                      <label className="flex flex-col gap-1 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Frequency</span>
                        <select
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-tide focus:outline-none"
                          value={item.frequency}
                          onChange={(e) => updateItem(idx, "frequency", e.target.value)}
                        >
                          {frequencyOptions.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Duration (days)"
                        value={item.durationDays}
                        onChange={(e) => updateItem(idx, "durationDays", e.target.value)}
                        type="number"
                        min="1"
                        required
                      />
                      <Input
                        label="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        type="number"
                        min="1"
                        required
                      />
                    </div>

                    <Input
                      label="Instructions for patient"
                      value={item.instructions}
                      onChange={(e) => updateItem(idx, "instructions", e.target.value)}
                      placeholder="e.g. Take with water after meals."
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full text-xs py-2 border-dashed"
              >
                + Add Another Medication
              </Button>
            </div>

            <Input
              label="Doctor clinical notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Follow up in 10 days if symptoms persist."
            />

            {status ? (
              <div
                className={`rounded-2xl border p-4 text-sm ${
                  status.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {status.message}
              </div>
            ) : null}

            <Button type="submit" disabled={loading}>
              {loading ? "Prescribing..." : "Sign & Create Prescription"}
            </Button>
          </form>
        </Card>

        <Card title="Lab results" eyebrow="Diagnostic history">
          {labResultsQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading lab results...</p>
          ) : (
            <div className="space-y-3">
              {labResults.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No lab results on file for this patient.</p>
              ) : null}
              {labResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{result.labTestType.name}</p>
                    <span className="text-xs text-slate-400">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 divide-y divide-slate-100 text-xs">
                    {result.measures.map((measure, i) => (
                      <div key={i} className="flex justify-between py-1 text-slate-600">
                        <span>{measure.labMeasureDef.name}</span>
                        <strong className="font-mono text-slate-900">
                          {measure.value} {measure.unit ?? ""}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Prescriptions" eyebrow="History">
          {prescriptionsQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading prescriptions...</p>
          ) : (
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No past prescriptions recorded.</p>
              ) : null}
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-mono text-slate-400">
                        Rx ID: {prescription.id}
                      </span>
                      <p className="text-xs text-slate-400">
                        Issued: {new Date(prescription.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        prescription.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : prescription.status === "DISPENSED"
                            ? "bg-sky-100 text-sky-800"
                            : prescription.status === "PARTIALLY_DISPENSED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {prescription.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {prescription.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"
                      >
                        <div>
                          <strong className="font-medium text-slate-800">
                            {item.medicine.name} {item.medicine.strength ?? ""}
                          </strong>
                          <p className="text-slate-500">
                            {item.dose} · {item.frequency} · {item.durationDays} days
                          </p>
                        </div>
                        <span className="font-semibold text-slate-700">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
