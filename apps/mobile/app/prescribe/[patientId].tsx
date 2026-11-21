import { useState } from "react";
import { View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button, Card, Field, PickerField, Screen, SectionTitle, Subtitle, useToast } from "@/src/components/ui";
import { createPrescription, fetchMedicines } from "@/src/lib/doctor";
import { unwrap } from "@/src/lib/query";

type Draft = {
  medicineId: string;
  dose: string;
  frequency: string;
  durationDays: string;
  quantity: string;
  instructions: string;
};

const emptyItem = (): Draft => ({
  medicineId: "",
  dose: "",
  frequency: "",
  durationDays: "",
  quantity: "",
  instructions: "",
});

export default function PrescribeScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [items, setItems] = useState<Draft[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const medicines = useQuery({
    queryKey: ["medicines-all"],
    queryFn: () => unwrap(fetchMedicines()),
  });
  const options = (medicines.data?.items ?? []).map((m) => ({
    label: `${m.name}${m.strength ? ` ${m.strength}` : ""}`,
    value: m.id,
    subtitle: [m.genericName, m.form].filter(Boolean).join(" · "),
  }));

  const update = (index: number, patch: Partial<Draft>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const validate = () => {
    const next: Record<string, string> = {};
    items.forEach((item, i) => {
      if (!item.medicineId) next[`${i}.medicine`] = "Select a medicine";
      if (!item.dose.trim()) next[`${i}.dose`] = "Required";
      if (!item.frequency.trim()) next[`${i}.frequency`] = "Required";
      if (!(Number.parseInt(item.durationDays, 10) > 0)) next[`${i}.duration`] = "Enter days > 0";
      if (!(Number.parseInt(item.quantity, 10) > 0)) next[`${i}.quantity`] = "Enter quantity > 0";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (saving || !validate()) return;
    setSaving(true);
    const result = await createPrescription(patientId as string, {
      notes: notes.trim() || undefined,
      items: items.map((item) => ({
        medicineId: item.medicineId,
        dose: item.dose.trim(),
        frequency: item.frequency.trim(),
        durationDays: Number.parseInt(item.durationDays, 10),
        quantity: Number.parseInt(item.quantity, 10),
        instructions: item.instructions.trim() || undefined,
      })),
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(result.error?.message ?? "Could not create the prescription.", "error");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["patient-rx", patientId] });
    toast.show("Prescription created.", "success");
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "New prescription" }} />
      <Subtitle>Add one or more medicines. The patient can show a QR code at the pharmacy.</Subtitle>
      {items.map((item, i) => (
        <Card key={i}>
          <SectionTitle>{`Medicine ${i + 1}`}</SectionTitle>
          <PickerField
            label="Medicine"
            options={options}
            value={item.medicineId}
            onChange={(v) => update(i, { medicineId: v })}
            error={errors[`${i}.medicine`]}
          />
          <Field label="Dose" value={item.dose} onChangeText={(v) => update(i, { dose: v })} placeholder="1 tablet" error={errors[`${i}.dose`]} />
          <Field label="Frequency" value={item.frequency} onChangeText={(v) => update(i, { frequency: v })} placeholder="2x daily" error={errors[`${i}.frequency`]} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="Days" value={item.durationDays} onChangeText={(v) => update(i, { durationDays: v })} keyboardType="number-pad" error={errors[`${i}.duration`]} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Quantity" value={item.quantity} onChangeText={(v) => update(i, { quantity: v })} keyboardType="number-pad" error={errors[`${i}.quantity`]} />
            </View>
          </View>
          <Field label="Instructions (optional)" value={item.instructions} onChangeText={(v) => update(i, { instructions: v })} placeholder="After meals" />
          {items.length > 1 ? (
            <Button title="Remove" variant="ghost" icon="trash-outline" onPress={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} />
          ) : null}
        </Card>
      ))}
      <Button title="Add another medicine" icon="add" variant="outline" onPress={() => setItems((prev) => [...prev, emptyItem()])} />
      <Field label="Notes (optional)" value={notes} onChangeText={setNotes} multiline placeholder="Clinical notes" />
      <Button title="Create prescription" icon="checkmark" onPress={submit} loading={saving} />
    </Screen>
  );
}
