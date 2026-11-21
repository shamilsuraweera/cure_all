import { useState } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/auth/auth-context";
import {
  Badge,
  ListItem,
  QueryState,
  Screen,
  Segmented,
  statusTone,
  Subtitle,
} from "@/src/components/ui";
import { usePatientContext } from "@/src/hooks/use-patient-context";
import { getPatientLabResults, getPatientPrescriptions } from "@/src/lib/patient-records";
import { errorMessage, formatDate, unwrap } from "@/src/lib/query";

type Tab = "rx" | "labs";

export default function RecordsTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { patients, selectedPatientId, setSelectedPatientId, isLoading } = usePatientContext();
  const [tab, setTab] = useState<Tab>("rx");

  const rxQuery = useQuery({
    queryKey: ["prescriptions", selectedPatientId],
    queryFn: () => unwrap(getPatientPrescriptions(selectedPatientId as string)),
    enabled: !!selectedPatientId && tab === "rx",
  });
  const labQuery = useQuery({
    queryKey: ["labs", selectedPatientId],
    queryFn: () => unwrap(getPatientLabResults(selectedPatientId as string)),
    enabled: !!selectedPatientId && tab === "labs",
  });

  const active = tab === "rx" ? rxQuery : labQuery;
  const prescriptions = rxQuery.data?.prescriptions ?? [];
  const labs = labQuery.data?.labResults ?? [];

  return (
    <Screen onRefresh={() => active.refetch()}>
      {patients.length > 1 ? (
        <Segmented
          options={patients.map((p) => ({
            label: p.userId === user?.id ? "Me" : (p.name ?? p.user.email),
            value: p.id,
          }))}
          value={selectedPatientId ?? ""}
          onChange={setSelectedPatientId}
        />
      ) : null}
      <Segmented
        options={[
          { label: "Prescriptions", value: "rx" },
          { label: "Lab results", value: "labs" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <QueryState
        isLoading={isLoading || active.isLoading}
        error={errorMessage(active.error)}
        onRetry={() => active.refetch()}
        isEmpty={tab === "rx" ? prescriptions.length === 0 : labs.length === 0}
        emptyTitle={tab === "rx" ? "No prescriptions yet" : "No lab results yet"}
        emptyMessage="New records will appear here as soon as they are added."
      >
        <View style={{ gap: 12 }}>
          {tab === "rx"
            ? prescriptions.map((p, i) => (
                <ListItem
                  key={p.id}
                  index={i}
                  icon="medkit"
                  title={p.items?.map((item) => item.medicine.name).join(", ") || "Prescription"}
                  subtitle={`${formatDate(p.createdAt)} · ${p.items?.length ?? 0} item(s)`}
                  right={<Badge label={p.status.replace("_", " ")} tone={statusTone(p.status)} />}
                  onPress={() => router.push(`/prescriptions/${p.id}`)}
                />
              ))
            : labs.map((l, i) => (
                <ListItem
                  key={l.id}
                  index={i}
                  icon="flask"
                  title={l.labTestType.name}
                  subtitle={formatDate(l.createdAt)}
                  onPress={() => router.push(`/labs/${l.id}`)}
                />
              ))}
        </View>
      </QueryState>
      {patients.length === 0 && !isLoading ? (
        <Subtitle>No linked patient records found for your account.</Subtitle>
      ) : null}
    </Screen>
  );
}
