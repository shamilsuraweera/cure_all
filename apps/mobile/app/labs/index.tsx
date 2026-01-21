import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { usePatientContext } from "@/src/hooks/use-patient-context";
import { getPatientLabResults } from "@/src/lib/patient-records";

export default function LabResultsScreen() {
  const router = useRouter();
  const { patients, selectedPatientId, setSelectedPatientId, isLoading } =
    usePatientContext();

  const labsQuery = useQuery({
    queryKey: ["lab-results", selectedPatientId],
    queryFn: () => getPatientLabResults(selectedPatientId ?? ""),
    enabled: Boolean(selectedPatientId),
  });

  const labResults = labsQuery.data?.ok
    ? labsQuery.data.data?.labResults ?? []
    : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.eyebrow}>PATIENT</Text>
      {isLoading ? (
        <Text style={styles.helper}>Loading patient profiles...</Text>
      ) : (
        <View style={styles.selector}>
          {patients.map((patient) => (
            <Text
              key={patient.id}
              style={[
                styles.selectorChip,
                selectedPatientId === patient.id && styles.selectorChipActive,
              ]}
              onPress={() => setSelectedPatientId(patient.id)}
            >
              {patient.name ?? patient.nic}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Lab results</Text>
      {labsQuery.isLoading ? (
        <Text style={styles.helper}>Loading lab results...</Text>
      ) : labsQuery.data?.ok === false ? (
        <Text style={styles.helper}>
          {labsQuery.data.error?.message ?? "Unable to load lab results."}
        </Text>
      ) : labResults.length === 0 ? (
        <Text style={styles.helper}>No lab results yet.</Text>
      ) : (
        labResults.map((result) => (
          <View key={result.id} style={styles.card}>
            <Text style={styles.cardTitle}>{result.labTestType.name}</Text>
            <Text style={styles.cardMeta}>
              {new Date(result.createdAt).toLocaleDateString()}
            </Text>
            <Text
              style={styles.link}
              onPress={() => router.push(`/labs/${result.id}`)}
            >
              View details
            </Text>
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
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#94A3B8",
  },
  selector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 12,
  },
  selectorChip: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    color: "#475569",
  },
  selectorChipActive: {
    backgroundColor: "#0F172A",
    color: "#FFFFFF",
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  helper: {
    marginTop: 8,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },
  link: {
    marginTop: 10,
    color: "#0F172A",
    fontWeight: "600",
  },
});
