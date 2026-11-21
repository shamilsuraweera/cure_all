import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";

import {
  Button,
  Field,
  PickerField,
  Screen,
  useToast,
} from "@/src/components/ui";
import { createMedicine, type MedicineForm } from "@/src/lib/root-admin";

const FORMS: { label: string; value: MedicineForm }[] = [
  "TABLET",
  "CAPSULE",
  "SYRUP",
  "INJECTION",
  "CREAM",
  "OTHER",
].map((f) => ({
  label: f[0] + f.slice(1).toLowerCase(),
  value: f as MedicineForm,
}));

export default function MedicineCreateScreen() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState<MedicineForm>("TABLET");
  const [manufacturer, setManufacturer] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    if (!name.trim()) {
      setNameError("Required");
      return;
    }
    setNameError(undefined);
    setSaving(true);
    const result = await createMedicine({
      name: name.trim(),
      genericName: genericName.trim() || undefined,
      strength: strength.trim() || undefined,
      form,
      manufacturer: manufacturer.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(
        result.error?.message ?? "Could not create the medicine.",
        "error",
      );
      return;
    }
    void qc.invalidateQueries({ queryKey: ["medicines"] });
    void qc.invalidateQueries({ queryKey: ["medicines-all"] });
    toast.show("Medicine created.", "success");
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Add medicine" }} />
      <Field
        label="Name"
        value={name}
        onChangeText={setName}
        error={nameError}
      />
      <Field
        label="Generic name (optional)"
        value={genericName}
        onChangeText={setGenericName}
      />
      <Field
        label="Strength (optional)"
        value={strength}
        onChangeText={setStrength}
        placeholder="500mg"
      />
      <PickerField
        label="Form"
        options={FORMS}
        value={form}
        onChange={setForm}
      />
      <Field
        label="Manufacturer (optional)"
        value={manufacturer}
        onChangeText={setManufacturer}
      />
      <Field
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Button
        title="Create medicine"
        icon="checkmark"
        onPress={submit}
        loading={saving}
      />
    </Screen>
  );
}
