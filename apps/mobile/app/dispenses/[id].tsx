import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { getDispenseHistory } from "@/src/lib/patient-records";

export default function DispenseHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const historyQuery = useQuery({
    queryKey: ["dispense-history", id],
    queryFn: () => getDispenseHistory(id ?? ""),
    enabled: Boolean(id),
  });

  const records = historyQuery.data?.ok
    ? historyQuery.data.data?.dispenseRecords ?? []
    : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dispense history</Text>
      {historyQuery.isLoading ? (
        <Text style={styles.helper}>Loading dispense history...</Text>
      ) : historyQuery.data?.ok === false ? (
        <Text style={styles.helper}>
          {historyQuery.data.error?.message ?? "Unable to load dispense history."}
        </Text>
      ) : records.length === 0 ? (
        <Text style={styles.helper}>No dispense records yet.</Text>
      ) : (
        records.map((record) => (
          <View key={record.id} style={styles.card}>
            <Text style={styles.cardTitle}>{record.status}</Text>
            <Text style={styles.cardMeta}>
              {new Date(record.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.cardMeta}>
              {record.pharmacyOrg?.name ?? "Pharmacy"}
            </Text>
            {record.items.map((item) => (
              <Text key={item.id} style={styles.item}>
                {item.prescriptionItem.medicine.name}: {item.quantity}
              </Text>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  helper: {
    marginTop: 12,
    color: "#64748B",
  },
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
  item: {
    marginTop: 6,
    fontSize: 12,
    color: "#475569",
  },
});
