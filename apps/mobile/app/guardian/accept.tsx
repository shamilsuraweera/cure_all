import { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import {
  Button,
  Field,
  Screen,
  Subtitle,
  Title,
  useToast,
} from "@/src/components/ui";
import { apiClient } from "@/src/lib/api-client";

export default function GuardianAcceptScreen() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ token?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    const next: typeof errors = {};
    if (!token.trim()) next.token = "Paste the invite token";
    if (password.length < 8) next.password = "Use at least 8 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const result = await apiClient.post<
      { patientId: string; guardianId: string },
      { token: string; password: string }
    >("/guardians/accept", { token: token.trim(), password });
    setLoading(false);

    if (result.ok) {
      toast.show("Invite accepted. You can now sign in.", "success");
      router.replace("/login");
      return;
    }
    toast.show(result.error?.message ?? "Failed to accept invite.", "error");
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Guardian invite" }} />
      <Title>Accept invite</Title>
      <Subtitle>
        Paste the invite token and choose a password for guardian access.
      </Subtitle>
      <Field
        label="Invite token"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Token from your patient"
        error={errors.token}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        placeholder="At least 8 characters"
        error={errors.password}
      />
      <Button
        title="Accept invite"
        icon="checkmark"
        onPress={submit}
        loading={loading}
      />
    </Screen>
  );
}
