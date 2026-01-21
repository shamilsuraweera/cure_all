import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { apiClient } from "@/src/lib/api-client";

export default function GuardianAcceptScreen() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    setStatus(null);
    const result = await apiClient.post<
      { patientId: string; guardianId: string },
      { token: string; password: string }
    >("/guardians/accept", { token, password });

    if (result.ok) {
      setStatus("Invite accepted. You can now view patient info.");
      setToken("");
      setPassword("");
      return;
    }

    setStatus(result.error?.message ?? "Failed to accept invite.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>GUARDIAN</Text>
      <Text style={styles.title}>Accept invite</Text>
      <Text style={styles.subtitle}>
        Paste the invite token and create a password for guardian access.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Invite token</Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          style={styles.input}
          placeholder="Token from email"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="Create a password"
        />

        {status ? <Text style={styles.status}>{status}</Text> : null}

        <Pressable style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Accept invite</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.back()}>
          <Text style={styles.linkText}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F5F7FB",
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2.8,
    textTransform: "uppercase",
    color: "#94A3B8",
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },
  form: {
    marginTop: 24,
    gap: 12,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#94A3B8",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
  },
  status: {
    marginTop: 8,
    color: "#0F172A",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#0F172A",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  link: {
    alignItems: "center",
    paddingVertical: 10,
  },
  linkText: {
    color: "#475569",
  },
});
