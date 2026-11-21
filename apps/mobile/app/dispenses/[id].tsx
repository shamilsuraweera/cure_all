import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";

import { Badge, Card, KeyValue, QueryState, Screen, statusTone, Subtitle, Body } from "@/src/components/ui";
import { fetchDispenseHistory } from "@/src/lib/pharmacy";
import { errorMessage, formatDate, unwrap } from "@/src/lib/query";

export default function DispenseHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["dispense-history", id],
    queryFn: () => unwrap(fetchDispenseHistory(id as string, 1, 50)),
    enabled: !!id,
  });
  const records = query.data?.dispenseRecords ?? [];

  return (
    <Screen onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: "Dispense history" }} />
      <QueryState
        isLoading={query.isLoading}
        error={errorMessage(query.error)}
        onRetry={() => query.refetch()}
        isEmpty={records.length === 0}
        emptyTitle="Not dispensed yet"
        emptyMessage="Dispense records appear once a pharmacy fills this prescription."
      >
        {records.map((record, i) => (
          <Card key={record.id} index={i}>
            <Body>{formatDate(record.createdAt)}</Body>
            <Badge label={record.status} tone={statusTone(record.status)} />
            {record.pharmacyOrg?.name ? <Subtitle>{record.pharmacyOrg.name}</Subtitle> : null}
            {record.items.map((item) => (
              <KeyValue
                key={item.id}
                label={item.prescriptionItem.medicine.name}
                value={`Qty ${item.quantity}`}
              />
            ))}
            {record.notes ? <Subtitle>{record.notes}</Subtitle> : null}
          </Card>
        ))}
      </QueryState>
    </Screen>
  );
}
