import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAuth } from "@/src/auth/auth-context";
import { Button, Field, haptic } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/(tabs)");
  }, [isAuthenticated, router]);

  const submit = async () => {
    if (loading) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Enter both your email and password.");
      haptic.error();
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      haptic.error();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await login(trimmedEmail, password);
      if (!result.ok) {
        setError(result.error ?? "Login failed. Check your credentials.");
        haptic.error();
      } else {
        haptic.success();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Ionicons name="medical" size={34} color={theme.onPrimary} />
          </View>
          <Text style={[styles.brand, { color: theme.accent }]}>CURE-ALL</Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Sign in with your clinic, pharmacy, lab, patient or guardian
            account.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(400)}
          style={styles.form}
        >
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@cureall.app"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={submit}
            placeholder="••••••••"
          />
          {error ? (
            <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
          ) : null}
          <Button
            title="Sign in"
            icon="log-in-outline"
            onPress={submit}
            loading={loading}
          />
          <Button
            title="I have a staff invite"
            variant="ghost"
            onPress={() => router.push("/invite/accept")}
          />
          <Button
            title="I have a guardian invite"
            variant="ghost"
            onPress={() => router.push("/guardian/accept")}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 28 },
  header: { alignItems: "center", gap: 8 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  brand: { fontSize: 12, letterSpacing: 4, fontWeight: "800" },
  title: { fontSize: 30, fontWeight: "800" },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  form: { gap: 14 },
  error: { fontSize: 13, fontWeight: "600" },
});
