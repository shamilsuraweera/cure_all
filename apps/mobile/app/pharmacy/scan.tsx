import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";

import { Button, Screen, Subtitle, Title, haptic } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

export default function ScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);
  const [hint, setHint] = useState("Point the camera at the patient's QR code");

  if (!permission) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Scan prescription" }} />
        <Subtitle>Checking camera access...</Subtitle>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Scan prescription" }} />
        <Title>Camera access needed</Title>
        <Subtitle>Allow camera access to scan prescription QR codes.</Subtitle>
        <Button
          title="Allow camera"
          icon="camera"
          onPress={() => void requestPermission()}
        />
        <Button
          title="Enter ID manually"
          variant="outline"
          onPress={() => router.replace("/(tabs)/pharmacy")}
        />
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Scan prescription" }} />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => {
          if (handled.current) return;
          const id = data.trim();
          if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
            setHint("That QR code is not a prescription. Try again.");
            return;
          }
          handled.current = true;
          haptic.success();
          router.replace(`/pharmacy/${id}`);
        }}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={[styles.frame, { borderColor: theme.primary }]} />
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  frame: { width: 240, height: 240, borderWidth: 4, borderRadius: 28 },
  hint: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
