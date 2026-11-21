import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";

import { useAuth } from "@/src/auth/auth-context";
import { Button, Field, Screen, Subtitle, useToast } from "@/src/components/ui";
import { usePatientContext } from "@/src/hooks/use-patient-context";
import { updatePatientProfile } from "@/src/lib/patient-records";

export default function ProfileEditScreen() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { patients, refetch } = usePatientContext();
  const self = patients.find((p) => p.userId === user?.id);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [dobError, setDobError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!self) return;
    setName(self.name ?? "");
    setDob(self.dob ? self.dob.slice(0, 10) : "");
    setLocation(self.location ?? "");
  }, [self]);

  const save = async () => {
    if (!self || saving) return;
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      setDobError("Use the format YYYY-MM-DD");
      return;
    }
    setDobError(undefined);
    const payload: { name?: string; dob?: string; location?: string } = {};
    if (name.trim()) payload.name = name.trim();
    if (dob) payload.dob = new Date(dob).toISOString();
    if (location.trim()) payload.location = location.trim();
    if (Object.keys(payload).length === 0) {
      toast.show("Enter at least one detail to save.", "error");
      return;
    }
    setSaving(true);
    const result = await updatePatientProfile(self.id, payload);
    setSaving(false);
    if (!result.ok) {
      toast.show(result.error?.message ?? "Could not save your details.", "error");
      return;
    }
    await refetch();
    void qc.invalidateQueries({ queryKey: ["patient-self"] });
    toast.show("Details saved.", "success");
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Edit details" }} />
      <Subtitle>Keep your details up to date so clinicians can identify you.</Subtitle>
      <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
      <Field
        label="Date of birth"
        value={dob}
        onChangeText={setDob}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
        error={dobError}
      />
      <Field label="Location" value={location} onChangeText={setLocation} placeholder="City / district" />
      <Button title="Save changes" icon="checkmark" onPress={save} loading={saving} />
    </Screen>
  );
}
