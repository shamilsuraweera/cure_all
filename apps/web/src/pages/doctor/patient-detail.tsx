import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  createPrescription,
  getPatientLabResults,
  getPatientPrescriptions,
  getPatientProfile,
} from "../../lib/doctor";

export const PatientDetailPage = () => {
  const { id = "" } = useParams();
  const [note, setNote] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState<string | null>(null);

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

  const patient = patientQuery.data?.data?.patient;
  const prescriptions = prescriptionsQuery.data?.data?.prescriptions ?? [];
  const labResults = labResultsQuery.data?.data?.labResults ?? [];

  const submitPrescription = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await createPrescription(id, {
      notes: note || undefined,
      items: [
        {
          medicineId,
          dose,
          frequency,
          durationDays: Number(durationDays),
          quantity: Number(quantity),
        },
      ],
    });

    if (result.ok) {
      setStatus("Prescription created.");
      setMedicineId("");
      setDose("");
      setFrequency("");
      setDurationDays("");
      setQuantity("");
      setNote("");
      void prescriptionsQuery.refetch();
      return;
    }

    setStatus(result.error?.message ?? "Failed to create prescription");
  };

  return (
    <div>
      <SectionHeader
        title={patient?.name ?? "Patient profile"}
        subtitle={patient ? `${patient.nic} · ${patient.user.email}` : ""}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Create prescription" eyebrow="Doctor">
          <form className="space-y-4" onSubmit={submitPrescription}>
            <Input
              label="Medicine ID"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              required
            />
            <Input label="Dose" value={dose} onChange={(e) => setDose(e.target.value)} required />
            <Input
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
            />
            <Input
              label="Duration (days)"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              type="number"
              required
            />
            <Input
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              required
            />
            <Input label="Notes" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="submit">Create prescription</Button>
            {status ? <p className="text-sm text-slate-500">{status}</p> : null}
          </form>
        </Card>

        <Card title="Lab results" eyebrow="Read only">
          {labResultsQuery.isLoading ? (
            <p>Loading lab results...</p>
          ) : (
            <div className="space-y-3">
              {labResults.length === 0 ? <p>No lab results yet.</p> : null}
              {labResults.map((result) => (
                <div key={result.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <p className="font-medium text-slate-800">{result.labTestType.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {result.measures.map((measure) => (
                      <li key={`${result.id}-${measure.labMeasureDef.name}`}>
                        {measure.labMeasureDef.name}: {measure.value} {measure.unit ?? ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Prescriptions" eyebrow="History">
        {prescriptionsQuery.isLoading ? (
          <p>Loading prescriptions...</p>
        ) : (
          <div className="space-y-3">
            {prescriptions.length === 0 ? <p>No prescriptions yet.</p> : null}
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <p className="font-medium text-slate-800">{prescription.status}</p>
                <p className="text-xs text-slate-400">
                  {new Date(prescription.createdAt).toLocaleDateString()}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {prescription.items.map((item) => (
                    <li key={item.id}>
                      {item.medicine.name} · {item.dose} · {item.frequency}
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
