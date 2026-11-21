import { ActivityIndicator, Text, View } from "react-native";
import { Redirect } from "expo-router";

import { useAuth } from "@/src/auth/auth-context";
import { useTheme } from "@/src/theme";

export default function Entry() {
  const { isReady, isAuthenticated } = useAuth();
  const theme = useTheme();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
          gap: 12,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textMuted }}>Preparing your session...</Text>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
}
