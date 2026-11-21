import { useState } from "react";
import { Stack, useRouter } from "expo-router";

import { Button, Field, Screen, useToast } from "@/src/components/ui";
import { createPatient } from "@/src/lib/root-admin";

export default function PatientCreateScreen() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    email: "",
    password: "",
    nic: "",
    name: "",
    dob: "",
    location: "",
    guardianEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (saving) return;
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = "Enter a valid email";
    if (form.password.length < 8) next.password = "At least 8 characters";
    if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(form.nic.trim()))
      next.nic = "Old (9 digits + V/X) or new (12 digits) NIC";
    if (form.dob && !/^\d{4}-\d{2}-\d{2}$/.test(form.dob))
      next.dob = "Use YYYY-MM-DD";
    if (form.guardianEmail && !/^\S+@\S+\.\S+$/.test(form.guardianEmail.trim()))
      next.guardianEmail = "Enter a valid email";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    const result = await createPatient({
      email: form.email.trim(),
      password: form.password,
      nic: form.nic.trim(),
      name: form.name.trim() || undefined,
      dob: form.dob ? new Date(form.dob).toISOString() : undefined,
      location: form.location.trim() || undefined,
      guardianEmail: form.guardianEmail.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(
        result.error?.message ?? "Could not register the patient.",
        "error",
      );
      return;
    }
    toast.show("Patient registered.", "success");
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Register patient" }} />
      <Field
        label="Email"
        value={form.email}
        onChangeText={set("email")}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />
      <Field
        label="Temporary password"
        value={form.password}
        onChangeText={set("password")}
        secureTextEntry
        autoCapitalize="none"
        error={errors.password}
      />
      <Field
        label="NIC"
        value={form.nic}
        onChangeText={set("nic")}
        autoCapitalize="characters"
        error={errors.nic}
      />
      <Field
        label="Full name (optional)"
        value={form.name}
        onChangeText={set("name")}
      />
      <Field
        label="Date of birth (optional)"
        value={form.dob}
        onChangeText={set("dob")}
        placeholder="YYYY-MM-DD"
        error={errors.dob}
      />
      <Field
        label="Location (optional)"
        value={form.location}
        onChangeText={set("location")}
      />
      <Field
        label="Guardian email (optional)"
        value={form.guardianEmail}
        onChangeText={set("guardianEmail")}
        autoCapitalize="none"
        keyboardType="email-address"
        hint="The guardian must already have an account."
        error={errors.guardianEmail}
      />
      <Button
        title="Register patient"
        icon="person-add"
        onPress={submit}
        loading={saving}
      />
    </Screen>
  );
}
