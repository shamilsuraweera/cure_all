import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AppProviders } from "@/src/providers/app-providers";
import { useTheme } from "@/src/theme";

const ThemedStack = () => {
  const theme = useTheme();
  const base = theme.isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerTintColor: theme.primary,
          headerTitleStyle: { color: theme.text, fontWeight: "700" },
          headerStyle: { backgroundColor: theme.surface },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
          animation: "slide_from_right",
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
};

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemedStack />
    </AppProviders>
  );
}
