import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import {
  Button,
  Card,
  EmptyState,
  Field,
  PickerField,
  Screen,
  SectionTitle,
  SkeletonList,
  Subtitle,
  useToast,
} from "@/src/components/ui";
import {
  createLabResult,
  fetchLabMeasures,
  fetchLabTestTypes,
} from "@/src/lib/lab";
import { unwrap } from "@/src/lib/query";

export default function LabEntryScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [testTypeId, setTestTypeId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const types = useQuery({
    queryKey: ["lab-test-types"],
    queryFn: () => unwrap(fetchLabTestTypes()),
  });
  const measuresQuery = useQuery({
    queryKey: ["lab-measures", testTypeId],
    queryFn: () => unwrap(fetchLabMeasures(testTypeId)),
    enabled: !!testTypeId,
  });
  const measures = measuresQuery.data?.items ?? [];

  const submit = async () => {
    if (saving) return;
    const entered = measures.filter((m) => values[m.id]?.trim());
    const next: Record<string, string> = {};
    if (!testTypeId) next.type = "Select a test";
    if (entered.length === 0) next.measures = "Enter at least one value";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const result = await createLabResult(patientId as string, {
      labTestTypeId: testTypeId,
      notes: notes.trim() || undefined,
      measures: entered.map((m) => ({
        labMeasureDefId: m.id,
        value: values[m.id].trim(),
        unit: m.unit ?? undefined,
      })),
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(
        result.error?.message ?? "Could not save the lab result.",
        "error",
      );
      return;
    }
    void qc.invalidateQueries({ queryKey: ["patient-labs", patientId] });
    toast.show("Lab result saved.", "success");
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Record lab result" }} />
      <PickerField
        label="Test type"
        options={(types.data?.items ?? []).map((t) => ({
          label: t.name,
          value: t.id,
          subtitle: t.code ?? undefined,
        }))}
        value={testTypeId}
        onChange={(v) => {
          setTestTypeId(v);
          setValues({});
        }}
        error={errors.type}
      />
      {testTypeId ? (
        measuresQuery.isLoading ? (
          <SkeletonList count={3} height={64} />
        ) : measures.length === 0 ? (
          <EmptyState
            title="No measures defined"
            message="A root administrator must define measures for this test."
          />
        ) : (
          <Card>
            <SectionTitle>Measures</SectionTitle>
            {measures.map((m) => (
              <Field
                key={m.id}
                label={`${m.name}${m.unit ? ` (${m.unit})` : ""}`}
                value={values[m.id] ?? ""}
                onChangeText={(v) =>
                  setValues((prev) => ({ ...prev, [m.id]: v }))
                }
                keyboardType="decimal-pad"
                hint={
                  m.normalRangeMin != null || m.normalRangeMax != null
                    ? `Normal range: ${m.normalRangeMin ?? "–"} to ${m.normalRangeMax ?? "–"}`
                    : undefined
                }
              />
            ))}
            {errors.measures ? <Subtitle>{errors.measures}</Subtitle> : null}
          </Card>
        )
      ) : null}
      <Field
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Button
        title="Save result"
        icon="checkmark"
        onPress={submit}
        loading={saving}
      />
    </Screen>
  );
}
