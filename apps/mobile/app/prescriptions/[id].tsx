import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { getPrescriptionDetail } from "@/src/lib/patient-records";

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const detailQuery = useQuery({
    queryKey: ["prescription-detail", id],
    queryFn: () => getPrescriptionDetail(id ?? ""),
    enabled: Boolean(id),
  });

  const prescription = detailQuery.data?.ok
    ? detailQuery.data.data?.prescription
    : undefined;

  return (
    <ScrollView style={styles.container}>
      {detailQuery.isLoading ? (
        <Text style={styles.helper}>Loading prescription...</Text>
      ) : detailQuery.data?.ok === false ? (
        <Text style={styles.helper}>
          {detailQuery.data.error?.message ?? "Unable to load prescription."}
        </Text>
      ) : prescription ? (
        <View>
          <Text style={styles.title}>{prescription.status}</Text>
          <Text style={styles.meta}>
            {new Date(prescription.createdAt).toLocaleString()}
          </Text>

          <Text style={styles.sectionTitle}>Items</Text>
          {prescription.items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.medicine.name} {item.medicine.strength ?? ""}
              </Text>
              <Text style={styles.cardMeta}>
                {item.dose} · {item.frequency} · {item.durationDays} days
              </Text>
              <Text style={styles.cardMeta}>Qty: {item.quantity}</Text>
            </View>
          ))}

          <Text
            style={styles.link}
            onPress={() => router.push(`/dispenses/${prescription.id}`)}
          >
            View dispense history
          </Text>
        </View>
      ) : (
        <Text style={styles.helper}>Prescription not found.</Text>
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
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: "#94A3B8",
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
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
  link: {
    marginTop: 20,
    fontWeight: "600",
    color: "#0F172A",
  },
  helper: {
    marginTop: 12,
    color: "#64748B",
  },
});
