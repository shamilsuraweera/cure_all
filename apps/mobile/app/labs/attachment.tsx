import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AttachmentViewerScreen() {
  const { url, name, mimeType } = useLocalSearchParams<{
    url?: string;
    name?: string;
    mimeType?: string;
  }>();

  const isImage = mimeType?.startsWith("image/");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{name ?? "Attachment"}</Text>
      <Text style={styles.meta}>{mimeType ?? "Unknown type"}</Text>

      {url ? (
        isImage ? (
          <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.card}>
            <Text style={styles.helper}>Preview not available.</Text>
            <Text style={styles.helper}>Open the file in a browser:</Text>
            <Text selectable style={styles.link}>
              {url}
            </Text>
          </View>
        )
      ) : (
        <Text style={styles.helper}>Missing attachment URL.</Text>
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
  image: {
    marginTop: 16,
    width: "100%",
    height: 320,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  helper: {
    marginTop: 6,
    color: "#475569",
  },
  link: {
    marginTop: 8,
    color: "#0F172A",
  },
});
