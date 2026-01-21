import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/auth/auth-context";

export default function HomeScreen() {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      router.replace("/profile");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, isReady, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0F172A" />
      <Text style={styles.subtitle}>Preparing your session...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  subtitle: {
    marginTop: 16,
    fontSize: 15,
    color: "#475569",
  },
});
