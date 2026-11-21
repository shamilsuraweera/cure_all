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
import { createOrg, type OrgType } from "@/src/lib/root-admin";

const TYPES: { label: string; value: OrgType }[] = [
  { label: "Hospital", value: "HOSPITAL" },
  { label: "Clinic", value: "CLINIC" },
  { label: "Pharmacy", value: "PHARMACY" },
  { label: "Laboratory", value: "LAB" },
];

export default function OrgCreateScreen() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<OrgType | "">("");
  const [domain, setDomain] = useState("");
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Required";
    if (!type) next.type = "Select a type";
    setErrors(next);
    if (Object.keys(next).length || !type) return;
    setSaving(true);
    const result = await createOrg({
      name: name.trim(),
      type,
      domain: domain.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(
        result.error?.message ?? "Could not create the organization.",
        "error",
      );
      return;
    }
    void qc.invalidateQueries({ queryKey: ["admin-orgs"] });
    toast.show("Organization created.", "success");
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Create organization" }} />
      <Field
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="City General Hospital"
        error={errors.name}
      />
      <PickerField
        label="Type"
        options={TYPES}
        value={type}
        onChange={setType}
        error={errors.type}
      />
      <Field
        label="Email domain (optional)"
        value={domain}
        onChangeText={setDomain}
        autoCapitalize="none"
        placeholder="hospital.org"
        hint="If set, invited staff must use this email domain."
      />
      <Button
        title="Create"
        icon="checkmark"
        onPress={submit}
        loading={saving}
      />
    </Screen>
  );
}
