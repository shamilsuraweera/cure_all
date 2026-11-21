import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";
import { haptic } from "./haptics";

type ToastKind = "success" | "error" | "info";
type ToastState = { id: number; kind: ToastKind; message: string } | null;

const ToastContext = createContext<{ show: (message: string, kind?: ToastKind) => void } | null>(
  null,
);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    if (kind === "success") haptic.success();
    if (kind === "error") haptic.error();
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), kind, message });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const value = useMemo(() => ({ show }), [show]);
  const color =
    toast?.kind === "success" ? theme.success : toast?.kind === "error" ? theme.danger : theme.primary;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={FadeInUp.duration(220)}
          exiting={FadeOutUp.duration(180)}
          pointerEvents="none"
          style={[styles.wrap, { top: insets.top + 8 }]}
        >
          <View style={[styles.toast, { backgroundColor: theme.surface, borderColor: color }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.text, { color: theme.text }]}>{toast.message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, zIndex: 100 },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { flex: 1, fontSize: 14, fontWeight: "600" },
});
