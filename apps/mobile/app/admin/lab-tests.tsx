import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";

import {
  Badge,
  Button,
  Card,
  Field,
  ListItem,
  PickerField,
  QueryState,
  Screen,
  SectionTitle,
  useToast,
} from "@/src/components/ui";
import { errorMessage, unwrap } from "@/src/lib/query";
import {
  createLabMeasure,
  createLabTestType,
  fetchLabTestTypes,
} from "@/src/lib/root-admin";

export default function LabTestsScreen() {
  const toast = useToast();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-lab-tests"],
    queryFn: () => unwrap(fetchLabTestTypes(1, 100)),
  });
  const tests = query.data?.items ?? [];

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [savingTest, setSavingTest] = useState(false);

  const [testId, setTestId] = useState("");
  const [measureName, setMeasureName] = useState("");
  const [unit, setUnit] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [savingMeasure, setSavingMeasure] = useState(false);

  const addTest = async () => {
    if (savingTest) return;
    if (!name.trim()) {
      toast.show("Enter a test name.", "error");
      return;
    }
    setSavingTest(true);
    const result = await createLabTestType({
      name: name.trim(),
      code: code.trim() || undefined,
    });
    setSavingTest(false);
    if (!result.ok) {
      toast.show(
        result.error?.message ?? "Could not create the test.",
        "error",
      );
      return;
    }
    setName("");
    setCode("");
    toast.show("Lab test created.", "success");
    void qc.invalidateQueries({ queryKey: ["admin-lab-tests"] });
    void qc.invalidateQueries({ queryKey: ["lab-test-types"] });
  };

  const addMeasure = async () => {
    if (savingMeasure) return;
    const lo = min ? Number(min) : undefined;
    const hi = max ? Number(max) : undefined;
    if (!testId || !measureName.trim()) {
      toast.show("Select a test and enter a measure name.", "error");
      return;
    }
    if (
      (min && Number.isNaN(lo)) ||
      (max && Number.isNaN(hi)) ||
      (lo != null && hi != null && lo > hi)
    ) {
      toast.show("Check the normal range values.", "error");
      return;
    }
    setSavingMeasure(true);
    const result = await createLabMeasure(testId, {
      name: measureName.trim(),
      unit: unit.trim() || undefined,
      normalRangeMin: lo,
      normalRangeMax: hi,
    });
    setSavingMeasure(false);
    if (!result.ok) {
      toast.show(
        result.error?.message ?? "Could not create the measure.",
        "error",
      );
      return;
    }
    setMeasureName("");
    setUnit("");
    setMin("");
    setMax("");
    toast.show("Measure added.", "success");
    void qc.invalidateQueries({ queryKey: ["lab-measures", testId] });
  };

  return (
    <Screen onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: "Lab tests" }} />
      <SectionTitle>Test catalog</SectionTitle>
      <QueryState
        isLoading={query.isLoading}
        error={errorMessage(query.error)}
        onRetry={() => query.refetch()}
        isEmpty={tests.length === 0}
        emptyTitle="No lab tests yet"
      >
        {tests.map((t, i) => (
          <ListItem
            key={t.id}
            index={i}
            icon="flask"
            title={t.name}
            subtitle={t.code ?? undefined}
            right={
              t.isActive ? undefined : <Badge label="Inactive" tone="muted" />
            }
          />
        ))}
      </QueryState>

      <SectionTitle>Add a test</SectionTitle>
      <Card>
        <Field
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Complete blood count"
        />
        <Field
          label="Code (optional)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <Button
          title="Create test"
          icon="add"
          onPress={addTest}
          loading={savingTest}
        />
      </Card>

      <SectionTitle>Add a measure</SectionTitle>
      <Card>
        <PickerField
          label="Test"
          options={tests.map((t) => ({ label: t.name, value: t.id }))}
          value={testId}
          onChange={setTestId}
        />
        <Field
          label="Measure name"
          value={measureName}
          onChangeText={setMeasureName}
          placeholder="Hemoglobin"
        />
        <Field
          label="Unit (optional)"
          value={unit}
          onChangeText={setUnit}
          placeholder="g/dL"
          autoCapitalize="none"
        />
        <Field
          label="Normal min (optional)"
          value={min}
          onChangeText={setMin}
          keyboardType="decimal-pad"
        />
        <Field
          label="Normal max (optional)"
          value={max}
          onChangeText={setMax}
          keyboardType="decimal-pad"
        />
        <Button
          title="Add measure"
          icon="add"
          onPress={addMeasure}
          loading={savingMeasure}
        />
      </Card>
    </Screen>
  );
}
