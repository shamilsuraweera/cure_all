import { Image, Linking, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import { Button, Card, Screen, Subtitle, Title } from "@/src/components/ui";

export default function AttachmentViewerScreen() {
  const { url, name, mimeType } = useLocalSearchParams<{ url?: string; name?: string; mimeType?: string }>();
  const isImage = mimeType?.startsWith("image/");

  return (
    <Screen>
      <Stack.Screen options={{ title: "Attachment" }} />
      <Title>{name ?? "Attachment"}</Title>
      <Subtitle>{mimeType || "Unknown type"}</Subtitle>
      {url && isImage ? (
        <View style={{ borderRadius: 18, overflow: "hidden" }}>
          <Image source={{ uri: url }} style={{ width: "100%", height: 420 }} resizeMode="contain" />
        </View>
      ) : (
        <Card>
          <Subtitle>Preview is not available for this file type.</Subtitle>
        </Card>
      )}
      {url ? <Button title="Open in browser" icon="open-outline" onPress={() => void Linking.openURL(url)} /> : null}
    </Screen>
  );
}
