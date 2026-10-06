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
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

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

  const selectedTestType = useMemo(
    () => labTestTypes.find((t) => t.id === labTestTypeId),
    [labTestTypes, labTestTypeId],
  );

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
      setStatusType("error");
      return;
    }

    const measures = measurePayload.filter((measure) => measure.value.trim().length > 0);
    if (measures.length === 0) {
      setStatus("Enter at least one measure value.");
      setStatusType("error");
      return;
    }

    const result = await createLabResult(id, {
      labTestTypeId,
      notes: notes || undefined,
      measures,
    });

    if (result.ok) {
      setStatus("Lab result successfully saved and added to patient history.");
      setStatusType("success");
      setNotes("");
      setMeasureInputs({});
      void labResultsQuery.refetch();
      return;
    }

    setStatus(result.error?.message ?? "Failed to create lab result.");
    setStatusType("error");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={patient?.name ?? "Patient Profile"}
        subtitle={patient ? `NIC: ${patient.nic} · ${patient.user.email}` : "Loading patient..."}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Record lab test" eyebrow="Diagnostic Input">
          <form className="space-y-5" onSubmit={submitLabResult}>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Lab test type</span>
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-900 shadow-sm focus:border-tide focus:outline-none"
                value={labTestTypeId}
                onChange={(event) => {
                  setLabTestTypeId(event.target.value);
                  setMeasureInputs({});
                  setStatus(null);
                }}
                required
              >
                <option value="">Select test type...</option>
                {labTestTypes.map((testType) => (
                  <option key={testType.id} value={testType.id}>
                    {testType.name} {testType.code ? `(${testType.code})` : ""}
                  </option>
                ))}
              </select>
            </label>

            {!labTestTypeId ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-4 text-xs text-slate-500 text-center">
                Select a lab test type above to load its defined measurement parameters.
              </p>
            ) : null}

            {labTestTypeId && !labMeasuresQuery.isLoading && labMeasures.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <p className="font-semibold text-amber-800">
                  No measure parameters defined for {selectedTestType?.name ?? "this test"}.
                </p>
                <p className="mt-1 text-slate-600">
                  Standard measure definitions (e.g. Hemoglobin, Platelets) must be defined before entering values.
                </p>
                <Link
                  to={`/root/lab-measures/new?testTypeId=${labTestTypeId}`}
                  className="mt-3 inline-flex items-center gap-1 font-semibold text-tide hover:underline"
                >
                  + Define measures for this test &rarr;
                </Link>
              </div>
            ) : null}

            {labMeasuresQuery.isLoading ? (
              <div className="py-4 text-center text-xs text-slate-400">Loading test parameters...</div>
            ) : null}

            {labMeasures.length > 0 ? (
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Test Parameters ({labMeasures.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Values & Reference Ranges</span>
                </div>

                {labMeasures.map((measure) => {
                  const valStr = measureInputs[measure.id]?.value ?? "";
                  const valNum = parseFloat(valStr);
                  const hasMin =
                    measure.normalRangeMin !== null && measure.normalRangeMin !== undefined;
                  const hasMax =
                    measure.normalRangeMax !== null && measure.normalRangeMax !== undefined;
                  const isOutOfRange =
                    valStr.trim() !== "" &&
                    !isNaN(valNum) &&
                    ((hasMin && valNum < (measure.normalRangeMin as number)) ||
                      (hasMax && valNum > (measure.normalRangeMax as number)));
                  const isNormal =
                    valStr.trim() !== "" &&
                    !isNaN(valNum) &&
                    hasMin &&
                    hasMax &&
                    valNum >= (measure.normalRangeMin as number) &&
                    valNum <= (measure.normalRangeMax as number);

                  return (
                    <div
                      key={measure.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition"
                    >
                      <div className="grid gap-3 md:grid-cols-[1.4fr_0.6fr]">
                        <Input
                          label={measure.name}
                          value={valStr}
                          onChange={(event) =>
                            setMeasureInputs((prev) => ({
                              ...prev,
                              [measure.id]: {
                                value: event.target.value,
                                unit: prev[measure.id]?.unit ?? measure.unit ?? "",
                              },
                            }))
                          }
                          placeholder={
                            hasMin && hasMax
                              ? `Normal: ${measure.normalRangeMin} - ${measure.normalRangeMax}`
                              : "Enter value"
                          }
                          helperText={
                            hasMin && hasMax
                              ? `Ref range: ${measure.normalRangeMin} – ${measure.normalRangeMax} ${measure.unit ?? ""}`
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
                          placeholder="e.g. mg/dL"
                        />
                      </div>

                      {isOutOfRange ? (
                        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                          <span>⚠️</span>
                          <span>
                            Value is outside reference range ({measure.normalRangeMin} - {measure.normalRangeMax} {measure.unit ?? ""})
                          </span>
                        </div>
                      ) : isNormal ? (
                        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
                          <span>✓</span>
                          <span>Within normal reference range</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <Input
              label="Clinical Notes / Observations"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. Fasting sample collected at 08:30 AM. No hemolysis observed."
            />

            <Button type="submit" disabled={!labTestTypeId || labMeasures.length === 0}>
              Save lab result
            </Button>

            {status ? (
              <p
                className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                  statusType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {status}
              </p>
            ) : null}
          </form>
        </Card>

        <div className="space-y-6">
          <Card title="Patient details" eyebrow="Demographics">
            {patient ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tide/10 text-lg font-bold text-tide">
                    {(patient.name || patient.nic || "P").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{patient.name ?? "Patient"}</p>
                    <p className="text-xs text-slate-400">NIC: {patient.nic}</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <p>Email: {patient.user.email}</p>
                  <p className="mt-1">ID: <span className="font-mono text-[11px] text-slate-400">{patient.id}</span></p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading patient profile...</p>
            )}
          </Card>

          <Card
            title="Recent lab results"
            eyebrow={labResults.length > 0 ? `${labResults.length} records` : "History"}
          >
            {labResultsQuery.isLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading lab history...</div>
            ) : (
              <div className="space-y-3">
                {labResults.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    No lab test results on file yet.
                  </p>
                ) : null}
                {labResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs transition hover:border-slate-200"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{result.labTestType.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                        {result.measures?.length ? (
                          <span>· {result.measures.length} measures</span>
                        ) : null}
                        {result.attachments?.length ? (
                          <span>· {result.attachments.length} attachment(s)</span>
                        ) : null}
                      </div>
                    </div>
                    <Link
                      to={`/lab/results/${result.id}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:text-ink"
                    >
                      View details &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
