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
          <Stack.Screen name="index" options={{ title: "Cure-All" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProviders>
  );
}
