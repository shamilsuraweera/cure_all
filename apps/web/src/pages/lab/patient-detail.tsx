import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  createLabResult,
  fetchLabMeasures,
  fetchLabTestTypes,
  fetchPatientLabResults,
  getPatientProfile,
} from "../../lib/lab";

type MeasureInput = {
  value: string;
  unit: string;
};

export const LabPatientDetailPage = () => {
  const { id = "" } = useParams();
  const [labTestTypeId, setLabTestTypeId] = useState("");
  const [notes, setNotes] = useState("");
  const [measureInputs, setMeasureInputs] = useState<Record<string, MeasureInput>>({});
  const [status, setStatus] = useState<string | null>(null);

  const patientQuery = useQuery({
    queryKey: ["lab-patient", id],
    queryFn: () => getPatientProfile(id),
    enabled: Boolean(id),
  });

  const labResultsQuery = useQuery({
    queryKey: ["lab-results", id],
    queryFn: () => fetchPatientLabResults(id),
    enabled: Boolean(id),
  });

  const labTestTypesQuery = useQuery({
    queryKey: ["lab-test-types"],
    queryFn: () => fetchLabTestTypes(),
  });

  const labMeasuresQuery = useQuery({
    queryKey: ["lab-measures", labTestTypeId],
    queryFn: () => fetchLabMeasures(labTestTypeId),
    enabled: Boolean(labTestTypeId),
  });

  const patient = patientQuery.data?.data?.patient;
  const labResults = labResultsQuery.data?.data?.labResults ?? [];
  const labTestTypes = labTestTypesQuery.data?.data?.items ?? [];
  const labMeasures = labMeasuresQuery.data?.data?.items ?? [];

  useEffect(() => {
    if (!labMeasures.length) return;
    setMeasureInputs((prev) => {
      const next = { ...prev };
      for (const measure of labMeasures) {
        if (!next[measure.id]) {
          next[measure.id] = { value: "", unit: measure.unit ?? "" };
        }
      }
      return next;
    });
  }, [labMeasures]);

  const measurePayload = useMemo(
    () =>
      labMeasures.map((measure) => ({
        labMeasureDefId: measure.id,
        value: measureInputs[measure.id]?.value ?? "",
        unit: measureInputs[measure.id]?.unit ?? measure.unit ?? undefined,
      })),
    [labMeasures, measureInputs],
  );

  const submitLabResult = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!labTestTypeId) {
      setStatus("Select a lab test type.");
      return;
    }

    const measures = measurePayload.filter((measure) => measure.value.trim().length > 0);
    if (measures.length === 0) {
      setStatus("Enter at least one measure value.");
      return;
    }

    const result = await createLabResult(id, {
      labTestTypeId,
      notes: notes || undefined,
      measures,
    });

    if (result.ok) {
      setStatus("Lab result saved.");
      setNotes("");
      setMeasureInputs({});
      void labResultsQuery.refetch();
      return;
    }

    setStatus(result.error?.message ?? "Failed to create lab result.");
  };

  return (
    <div>
      <SectionHeader
        title={patient?.name ?? "Patient profile"}
        subtitle={patient ? `${patient.nic} · ${patient.user.email}` : ""}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Create lab result" eyebrow="Lab tech">
          <form className="space-y-4" onSubmit={submitLabResult}>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Lab test type</span>
              <select
                className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-base text-slate-900 shadow-sm focus:border-tide focus:outline-none"
                value={labTestTypeId}
                onChange={(event) => {
                  setLabTestTypeId(event.target.value);
                  setMeasureInputs({});
                }}
                required
              >
                <option value="">Select test type</option>
                {labTestTypes.map((testType) => (
                  <option key={testType.id} value={testType.id}>
                    {testType.name}
                  </option>
                ))}
              </select>
            </label>

            {labMeasures.length === 0 ? (
              <p className="text-xs text-slate-400">
                Select a test type to load measure definitions.
              </p>
            ) : null}

            {labMeasures.map((measure) => (
              <div key={measure.id} className="grid gap-3 md:grid-cols-[1.4fr_0.6fr]">
                <Input
                  label={measure.name}
                  value={measureInputs[measure.id]?.value ?? ""}
                  onChange={(event) =>
                    setMeasureInputs((prev) => ({
                      ...prev,
                      [measure.id]: {
                        value: event.target.value,
                        unit: prev[measure.id]?.unit ?? measure.unit ?? "",
                      },
                    }))
                  }
                  helperText={
                    measure.normalRangeMin !== null && measure.normalRangeMax !== null
                      ? `Normal: ${measure.normalRangeMin} - ${measure.normalRangeMax}`
                      : undefined
                  }
                />
                <Input
                  label="Unit"
                  value={measureInputs[measure.id]?.unit ?? measure.unit ?? ""}
                  onChange={(event) =>
                    setMeasureInputs((prev) => ({
                      ...prev,
                      [measure.id]: {
                        value: prev[measure.id]?.value ?? "",
                        unit: event.target.value,
                      },
                    }))
                  }
                />
              </div>
            ))}

            <Input
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes"
            />
            <Button type="submit">Save lab result</Button>
            {status ? <p className="text-sm text-rose-500">{status}</p> : null}
          </form>
        </Card>

        <Card title="Recent lab results" eyebrow="History">
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
                  <Link
                    to={`/lab/results/${result.id}`}
                    className="mt-2 inline-flex rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs text-slate-700 hover:text-ink"
                  >
                    View details
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
