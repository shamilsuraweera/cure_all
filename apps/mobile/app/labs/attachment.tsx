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
          <Image
            source={{ uri: url }}
            style={styles.image}
            resizeMode="contain"
          />
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
    backgroundColor: "#F0FDFA",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#134E4A",
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: "#5F8F8B",
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
    borderColor: "#CCFBF1",
  },
  helper: {
    marginTop: 6,
    color: "#2F5553",
  },
  link: {
    marginTop: 8,
    color: "#134E4A",
  },
});
