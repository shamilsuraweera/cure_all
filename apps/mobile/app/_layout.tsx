import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AppProviders } from "@/src/providers/app-providers";
import { palette } from "@/src/theme/colors";

// All screens are styled for the light teal theme, so the navigation chrome is
// pinned to light as well (previously dark nav chrome sat on light screens).
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    background: palette.background,
    card: palette.surface,
    text: palette.ink,
    border: palette.border,
  },
};

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerTintColor: palette.primaryDark,
            headerTitleStyle: { color: palette.ink, fontWeight: "700" },
            headerShadowVisible: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Sign in" }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen
            name="guardian/accept"
            options={{ title: "Guardian invite" }}
          />
          <Stack.Screen
            name="prescriptions/index"
            options={{ title: "Prescriptions" }}
          />
          <Stack.Screen
            name="prescriptions/[id]"
            options={{ title: "Prescription" }}
          />
          <Stack.Screen
            name="dispenses/[id]"
            options={{ title: "Dispense history" }}
          />
          <Stack.Screen name="labs/index" options={{ title: "Lab results" }} />
          <Stack.Screen name="labs/[id]" options={{ title: "Lab result" }} />
          <Stack.Screen
            name="labs/attachment"
            options={{ title: "Attachment" }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AppProviders>
  );
}
