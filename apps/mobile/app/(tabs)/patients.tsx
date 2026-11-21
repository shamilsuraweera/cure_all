import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { Button, Field, ListItem, QueryState, Screen, Segmented, Subtitle } from "@/src/components/ui";
import { searchPatients } from "@/src/lib/doctor";
import { errorMessage, unwrap } from "@/src/lib/query";

export default function PatientsTab() {
  const router = useRouter();
  const [mode, setMode] = useState<"nic" | "email">("nic");
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState<{ mode: "nic" | "email"; value: string } | null>(null);
  const [error, setError] = useState<string>();

  const query = useQuery({
    queryKey: ["patient-search", submitted],
    queryFn: () =>
      unwrap(
        searchPatients(submitted?.mode === "nic" ? { nic: submitted.value } : { email: submitted?.value }),
      ),
    enabled: !!submitted,
  });
  const patients = query.data?.patients ?? [];

  const search = () => {
    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setError("Enter at least 3 characters");
      return;
    }
    setError(undefined);
    setSubmitted({ mode, value: trimmed });
  };

  return (
    <Screen onRefresh={submitted ? () => query.refetch() : undefined}>
      <Subtitle>Find a patient to view their chart, prescribe or record lab results.</Subtitle>
      <Segmented
        options={[
          { label: "By NIC", value: "nic" },
          { label: "By email", value: "email" },
        ]}
        value={mode}
        onChange={(m) => {
          setMode(m);
          setValue("");
          setSubmitted(null);
        }}
      />
      <Field
        label={mode === "nic" ? "NIC number" : "Patient email"}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={mode === "email" ? "email-address" : "default"}
        onSubmitEditing={search}
        returnKeyType="search"
        placeholder={mode === "nic" ? "e.g. 200012345678" : "patient@example.com"}
        error={error}
      />
      <Button title="Search" icon="search" onPress={search} loading={query.isFetching && !!submitted} />

      {submitted ? (
        <QueryState
          isLoading={query.isLoading}
          error={errorMessage(query.error)}
          onRetry={() => query.refetch()}
          isEmpty={patients.length === 0}
          emptyTitle="No patients found"
          emptyMessage="Check the spelling and try again."
        >
          {patients.map((p, i) => (
            <ListItem
              key={p.id}
              index={i}
              icon="person"
              title={p.name ?? p.user.email}
              subtitle={`NIC ${p.nic} · ${p.user.email}`}
              onPress={() => router.push(`/patients/${p.id}`)}
            />
          ))}
        </QueryState>
      ) : null}
    </Screen>
  );
}
