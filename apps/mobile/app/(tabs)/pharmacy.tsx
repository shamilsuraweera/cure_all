import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import {
  Badge,
  Button,
  Field,
  ListItem,
  QueryState,
  Screen,
  Segmented,
  statusTone,
} from "@/src/components/ui";
import { listPrescriptions } from "@/src/lib/pharmacy";
import { errorMessage, formatDate, unwrap } from "@/src/lib/query";

const FILTERS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Partial", value: "PARTIALLY_DISPENSED" },
  { label: "Dispensed", value: "DISPENSED" },
];

export default function PharmacyTab() {
  const router = useRouter();
  const [status, setStatus] = useState("ACTIVE");
  const [manualId, setManualId] = useState("");

  const query = useQuery({
    queryKey: ["pharmacy-queue", status],
    queryFn: () => unwrap(listPrescriptions({ pageSize: 50, status })),
  });
  const items = query.data?.prescriptions ?? [];

  return (
    <Screen onRefresh={() => query.refetch()}>
      <Button
        title="Scan prescription QR"
        icon="qr-code"
        onPress={() => router.push("/pharmacy/scan")}
      />
      <Field
        label="Or enter a prescription ID"
        value={manualId}
        onChangeText={setManualId}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Paste prescription ID"
        returnKeyType="go"
        onSubmitEditing={() =>
          manualId.trim() && router.push(`/pharmacy/${manualId.trim()}`)
        }
      />
      <Segmented options={FILTERS} value={status} onChange={setStatus} />
      <QueryState
        isLoading={query.isLoading}
        error={errorMessage(query.error)}
        onRetry={() => query.refetch()}
        isEmpty={items.length === 0}
        emptyTitle="Queue is empty"
        emptyMessage="Prescriptions matching this filter will show up here."
      >
        {items.map((p, i) => (
          <ListItem
            key={p.id}
            index={i}
            icon="medkit"
            title={
              p.items.map((it) => it.medicine.name).join(", ") || "Prescription"
            }
            subtitle={`${formatDate(p.createdAt)} · ${p.items.length} item(s)`}
            right={
              <Badge
                label={p.status.replace("_", " ")}
                tone={statusTone(p.status)}
              />
            }
            onPress={() => router.push(`/pharmacy/${p.id}`)}
          />
        ))}
      </QueryState>
    </Screen>
  );
}
