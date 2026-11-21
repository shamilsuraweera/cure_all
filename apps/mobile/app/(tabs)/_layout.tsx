import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/src/auth/auth-context";
import { useRoles } from "@/src/auth/roles";
import { haptic } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

type IconName = keyof typeof Ionicons.glyphMap;

const icon =
  (active: IconName, inactive: IconName) =>
  ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : inactive} size={size} color={color} />
  );

export default function TabsLayout() {
  const { isReady, isAuthenticated, user } = useAuth();
  const roles = useRoles();
  const theme = useTheme();

  if (isReady && !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const isPharmacyMember = Boolean(user?.orgRoles?.includes("PHARMACIST"));
  const show = (visible: boolean) => (visible ? {} : { href: null });

  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.tap() }}
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: { fontWeight: "600", fontSize: 11 },
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { color: theme.text, fontWeight: "700" },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home", "home-outline") }} />
      <Tabs.Screen
        name="records"
        options={{
          title: "Records",
          tabBarIcon: icon("document-text", "document-text-outline"),
          ...show(roles.hasRecords),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: "Patients",
          tabBarIcon: icon("people", "people-outline"),
          ...show(roles.isDoctor || roles.isLabTech),
        }}
      />
      <Tabs.Screen
        name="pharmacy"
        options={{
          title: "Pharmacy",
          tabBarIcon: icon("medkit", "medkit-outline"),
          ...show(isPharmacyMember),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: icon("shield-checkmark", "shield-checkmark-outline"),
          ...show(roles.isRoot),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: icon("person-circle", "person-circle-outline") }}
      />
    </Tabs>
  );
}
