import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppProviders } from "@/src/providers/app-providers";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Sign in" }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="guardian/accept" options={{ title: "Guardian invite" }} />
          <Stack.Screen name="prescriptions/index" options={{ title: "Prescriptions" }} />
          <Stack.Screen name="prescriptions/[id]" options={{ title: "Prescription" }} />
          <Stack.Screen name="dispenses/[id]" options={{ title: "Dispense history" }} />
          <Stack.Screen name="labs/index" options={{ title: "Lab results" }} />
          <Stack.Screen name="labs/[id]" options={{ title: "Lab result" }} />
          <Stack.Screen name="labs/attachment" options={{ title: "Attachment" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProviders>
  );
}
