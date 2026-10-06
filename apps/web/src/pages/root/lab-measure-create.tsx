import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createLabMeasure, fetchLabTestTypes } from "../../lib/root-admin";

export const LabMeasureCreatePage = () => {
  const [searchParams] = useSearchParams();
  const [labTestTypeId, setLabTestTypeId] = useState(searchParams.get("labTestTypeId") ?? "");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [normalMin, setNormalMin] = useState("");
  const [normalMax, setNormalMax] = useState("");
  const [status, setStatus] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const testTypesQuery = useQuery({
    queryKey: ["lab-test-types-for-measure"],
    queryFn: () => fetchLabTestTypes(1, 100),
  });

  const testTypes = testTypesQuery.data?.data?.items ?? [];

  useEffect(() => {
    const paramId = searchParams.get("labTestTypeId");
    if (paramId) {
      setLabTestTypeId(paramId);
    } else if (testTypes.length > 0 && !labTestTypeId) {
      setLabTestTypeId(testTypes[0].id);
    }
  }, [searchParams, testTypes, labTestTypeId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!labTestTypeId.trim()) {
      setStatus({ message: "Lab test type is required.", tone: "error" });
      return;
    }
    if (!name.trim()) {
      setStatus({ message: "Measure name is required.", tone: "error" });
      return;
    }

    const payload = {
      name: name.trim(),
      unit: unit.trim() || undefined,
      normalRangeMin: normalMin ? Number(normalMin) : undefined,
      normalRangeMax: normalMax ? Number(normalMax) : undefined,
    };

    setLoading(true);
    setStatus(null);
    const result = await createLabMeasure(labTestTypeId, payload);
    setLoading(false);

    if (result.ok) {
      setStatus({ message: `Measure "${name}" created successfully.`, tone: "success" });
      setName("");
      setUnit("");
      setNormalMin("");
      setNormalMax("");
      return;
    }

    setStatus({ message: result.error?.message ?? "Failed to create measure", tone: "error" });
  };

  return (
    <div className="mx-auto max-w-xl">
      <SectionHeader
        title="Create lab measure definition"
        subtitle="Attach measurable diagnostic fields and normal ranges to a test type."
      />
      <Card title="Measure parameters" eyebrow="Diagnostics">
        <form className="space-y-4" onSubmit={submit}>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Lab Test Type</span>
            {testTypesQuery.isLoading ? (
              <span className="text-xs text-slate-400">Loading lab test types...</span>
            ) : testTypes.length > 0 ? (
              <select
                className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-base text-slate-900 focus:border-tide focus:outline-none"
                value={labTestTypeId}
                onChange={(e) => setLabTestTypeId(e.target.value)}
                required
              >
                {testTypes.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name} {test.code ? `(${test.code})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                label=""
                value={labTestTypeId}
                onChange={(e) => setLabTestTypeId(e.target.value)}
                placeholder="Enter Lab Test Type ID"
                required
              />
            )}
          </label>

          <Input
            label="Measure name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fasting Blood Glucose, Platelet Count..."
            required
          />

          <Input
            label="Unit of measurement"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g. mg/dL, mmol/L, %..."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Normal range minimum"
              value={normalMin}
              onChange={(e) => setNormalMin(e.target.value)}
              type="number"
              step="any"
              placeholder="e.g. 70"
            />
            <Input
              label="Normal range maximum"
              value={normalMax}
              onChange={(e) => setNormalMax(e.target.value)}
              type="number"
              step="any"
              placeholder="e.g. 99"
            />
          </div>

          {status ? (
            <div
              className={`rounded-2xl border p-4 text-sm ${
                status.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <p>{status.message}</p>
              {status.tone === "success" ? (
                <div className="mt-2">
                  <Link
                    to="/root/lab-tests"
                    className="font-semibold text-emerald-900 underline text-xs"
                  >
                    View in Catalog &rarr;
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Adding measure..." : "Save Lab Measure"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
