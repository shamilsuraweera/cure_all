import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { getLabResultDetail } from "@/src/lib/patient-records";

export default function LabResultDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const resultQuery = useQuery({
    queryKey: ["lab-result-detail", id],
    queryFn: () => getLabResultDetail(id ?? ""),
    enabled: Boolean(id),
  });

  const labResult = resultQuery.data?.ok
    ? resultQuery.data.data?.labResult
    : undefined;
  const attachments = labResult?.attachments ?? [];

  return (
    <ScrollView style={styles.container}>
      {resultQuery.isLoading ? (
        <Text style={styles.helper}>Loading lab result...</Text>
      ) : resultQuery.data?.ok === false ? (
        <Text style={styles.helper}>
          {resultQuery.data.error?.message ?? "Unable to load lab result."}
        </Text>
      ) : labResult ? (
        <View>
          <Text style={styles.title}>{labResult.labTestType.name}</Text>
          <Text style={styles.meta}>
            {new Date(labResult.createdAt).toLocaleString()}
          </Text>

          <Text style={styles.sectionTitle}>Measures</Text>
          {labResult.measures.map((measure) => (
            <View key={measure.labMeasureDef.name} style={styles.card}>
              <Text style={styles.cardTitle}>{measure.labMeasureDef.name}</Text>
              <Text style={styles.cardMeta}>
                {measure.value} {measure.unit ?? ""}
              </Text>
            </View>
          ))}

          {labResult.notes ? (
            <Text style={styles.notes}>Notes: {labResult.notes}</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Attachments</Text>
          {attachments.length === 0 ? (
            <Text style={styles.helper}>No attachments yet.</Text>
          ) : (
            attachments.map((attachment) => (
              <Text
                key={attachment.id}
                style={styles.link}
                onPress={() =>
                  router.push({
                    pathname: "/labs/attachment",
                    params: {
                      url: attachment.url,
                      name: attachment.fileName,
                      mimeType: attachment.mimeType ?? "",
                    },
                  })
                }
              >
                {attachment.fileName}
              </Text>
            ))
          )}
        </View>
      ) : (
        <Text style={styles.helper}>Lab result not found.</Text>
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
  notes: {
    marginTop: 12,
    color: "#475569",
  },
  link: {
    marginTop: 10,
    color: "#0F172A",
    fontWeight: "600",
  },
  helper: {
    marginTop: 12,
    color: "#64748B",
  },
});
