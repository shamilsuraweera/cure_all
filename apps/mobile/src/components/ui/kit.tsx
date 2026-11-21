import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { radius, useTheme } from "@/src/theme";
import { haptic } from "./haptics";

/* ---------- Screen ---------- */

type ScreenProps = {
  children: React.ReactNode;
  onRefresh?: () => Promise<unknown> | unknown;
  scroll?: boolean;
  padded?: boolean;
};

export const Screen = ({ children, onRefresh, scroll = true, padded = true }: ScreenProps) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  if (!scroll) {
    return (
      <View style={[styles.flex, padded && styles.pad, { backgroundColor: theme.background }]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[padded && styles.pad, styles.grow]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.primary}
            colors={[theme.primary]}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await onRefresh();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
};

/* ---------- Typography ---------- */

export const Title = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return <Text style={[styles.title, { color: theme.text }]}>{children}</Text>;
};

export const Subtitle = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return <Text style={[styles.subtitle, { color: theme.textMuted }]}>{children}</Text>;
};

export const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return <Text style={[styles.section, { color: theme.primaryDark }]}>{children}</Text>;
};

export const Body = ({ children, muted }: { children: React.ReactNode; muted?: boolean }) => {
  const theme = useTheme();
  return <Text style={{ color: muted ? theme.textMuted : theme.text, fontSize: 14 }}>{children}</Text>;
};

/* ---------- Card ---------- */

export const Card = ({
  children,
  style,
  onPress,
  index = 0,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  index?: number;
}) => {
  const theme = useTheme();
  const body = (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>
      {children}
    </View>
  );
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(260)}>
      {onPress ? (
        <Pressable
          onPress={() => {
            haptic.tap();
            onPress();
          }}
          style={({ pressed }) => [pressed && styles.pressed]}
          accessibilityRole="button"
        >
          {body}
        </Pressable>
      ) : (
        body
      )}
    </Animated.View>
  );
};

/* ---------- Button ---------- */

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  style,
}: ButtonProps) => {
  const theme = useTheme();
  const palette = {
    primary: { bg: theme.primary, fg: theme.onPrimary, border: theme.primary },
    secondary: { bg: theme.accent, fg: "#FFFFFF", border: theme.accent },
    danger: { bg: theme.danger, fg: "#FFFFFF", border: theme.danger },
    outline: { bg: "transparent", fg: theme.primaryDark, border: theme.primary },
    ghost: { bg: "transparent", fg: theme.primaryDark, border: "transparent" },
  }[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={palette.fg} /> : null}
          <Text style={[styles.buttonText, { color: palette.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
};

/* ---------- Field ---------- */

type FieldProps = TextInputProps & { label: string; error?: string; hint?: string };

export const Field = ({ label, error, hint, style, ...props }: FieldProps) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            color: theme.text,
            borderColor: error ? theme.danger : focused ? theme.primary : theme.border,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={[styles.hint, { color: theme.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: theme.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
};

/* ---------- Badge ---------- */

export const Badge = ({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
}) => {
  const theme = useTheme();
  const color = {
    primary: theme.primaryDark,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    muted: theme.textMuted,
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: theme.chip }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

/** Map a backend status string to a badge tone. */
export const statusTone = (status: string): "primary" | "success" | "warning" | "danger" | "muted" => {
  switch (status) {
    case "DISPENSED":
    case "ACTIVE":
    case "FULL":
      return "success";
    case "PARTIALLY_DISPENSED":
    case "PARTIAL":
      return "warning";
    case "CANCELLED":
    case "SUSPENDED":
      return "danger";
    default:
      return "primary";
  }
};

/* ---------- ListItem ---------- */

export const ListItem = ({
  title,
  subtitle,
  icon,
  right,
  onPress,
  index,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
  onPress?: () => void;
  index?: number;
}) => {
  const theme = useTheme();
  return (
    <Card onPress={onPress} index={index}>
      <View style={styles.row}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: theme.chip }]}>
            <Ionicons name={icon} size={20} color={theme.primaryDark} />
          </View>
        ) : null}
        <View style={styles.flex}>
          <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.itemSub, { color: theme.textMuted }]}>{subtitle}</Text> : null}
        </View>
        {right}
        {onPress ? <Ionicons name="chevron-forward" size={18} color={theme.textMuted} /> : null}
      </View>
    </Card>
  );
};

/* ---------- Skeleton / states ---------- */

export const Skeleton = ({ height = 64 }: { height?: number }) => {
  const theme = useTheme();
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[{ height, borderRadius: radius.md, backgroundColor: theme.chip }, style]} />
  );
};

export const SkeletonList = ({ count = 4, height = 72 }: { count?: number; height?: number }) => (
  <View style={styles.gap}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} height={height} />
    ))}
  </View>
);

export const EmptyState = ({
  icon = "file-tray-outline",
  title,
  message,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}) => {
  const theme = useTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.chip }]}>
        <Ionicons name={icon} size={30} color={theme.primaryDark} />
      </View>
      <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.itemSub, styles.centerText, { color: theme.textMuted }]}>{message}</Text>
      ) : null}
    </View>
  );
};

export const ErrorState = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
  <View style={styles.center}>
    <EmptyState icon="alert-circle-outline" title="Something went wrong" message={message} />
    {onRetry ? <Button title="Try again" variant="outline" onPress={onRetry} /> : null}
  </View>
);

/** Renders loading / error / empty / content for a react-query style result. */
export const QueryState = ({
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyMessage,
  onRetry,
  children,
}: {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}) => {
  if (isLoading) return <SkeletonList />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState title={emptyTitle ?? "Nothing here yet"} message={emptyMessage} />;
  return <>{children}</>;
};

/* ---------- Segmented / chips ---------- */

export const Segmented = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) => {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              haptic.tap();
              onChange(option.value);
            }}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.primary : theme.chip,
              },
            ]}
          >
            <Text style={{ color: active ? theme.onPrimary : theme.primaryDark, fontWeight: "600", fontSize: 13 }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

/* ---------- Picker bottom sheet ---------- */

export const PickerField = <T extends string>({
  label,
  placeholder = "Select...",
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  options: { label: string; value: T; subtitle?: string }[];
  value: T | "";
  onChange: (value: T) => void;
  error?: string;
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <Pressable
        onPress={() => {
          haptic.tap();
          setOpen(true);
        }}
        style={[
          styles.input,
          styles.pickerRow,
          { backgroundColor: theme.surface, borderColor: error ? theme.danger : theme.border },
        ]}
      >
        <Text style={{ color: selected ? theme.text : theme.textMuted, fontSize: 15 }}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
      </Pressable>
      {error ? <Text style={[styles.hint, { color: theme.danger }]}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: theme.overlay }]} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={[styles.grabber, { backgroundColor: theme.border }]} />
          <Text style={[styles.itemTitle, { color: theme.text, marginBottom: 8 }]}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(o) => o.value}
            style={styles.sheetList}
            ListEmptyComponent={<Text style={{ color: theme.textMuted }}>No options available.</Text>}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  haptic.tap();
                  onChange(item.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.option, pressed && styles.pressed, { borderColor: theme.border }]}
              >
                <View style={styles.flex}>
                  <Text style={{ color: theme.text, fontSize: 15, fontWeight: "600" }}>{item.label}</Text>
                  {item.subtitle ? (
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>{item.subtitle}</Text>
                  ) : null}
                </View>
                {item.value === value ? <Ionicons name="checkmark" size={20} color={theme.primary} /> : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

/* ---------- Key/value rows ---------- */

export const KeyValue = ({ label, value }: { label: string; value?: string | number | null }) => {
  const theme = useTheme();
  return (
    <View style={styles.kv}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <Text style={{ color: theme.text, fontSize: 15, fontWeight: "500" }}>{value ?? "—"}</Text>
    </View>
  );
};

export const Stack = ({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) => (
  <View style={{ gap }}>{children}</View>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1, paddingBottom: 40 },
  pad: { padding: 20, gap: 14 },
  gap: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 36, gap: 10 },
  centerText: { textAlign: "center", maxWidth: 280 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  section: { fontSize: 12, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase", marginTop: 6 },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 16, gap: 8 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
  button: {
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { fontSize: 15, fontWeight: "700" },
  fieldWrap: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  input: { borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  hint: { fontSize: 12 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: "700" },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  itemTitle: { fontSize: 15, fontWeight: "700" },
  itemSub: { fontSize: 13, marginTop: 2 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  chips: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  overlay: { flex: 1 },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 18, maxHeight: "65%" },
  sheetList: { flexGrow: 0 },
  grabber: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, marginBottom: 12 },
  option: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  kv: { gap: 2, marginBottom: 6 },
});
