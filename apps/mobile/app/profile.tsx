import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/auth/auth-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PROFILE</Text>
      <Text style={styles.title}>{user?.email ?? "User"}</Text>
      <Text style={styles.subtitle}>Global role: {user?.globalRole ?? "USER"}</Text>
      <View style={styles.roles}>
        <Text style={styles.rolesTitle}>Org roles</Text>
        {user?.orgRoles?.length ? (
          user.orgRoles.map((role) => (
            <Text key={role} style={styles.roleChip}>
              {role}
            </Text>
          ))
        ) : (
          <Text style={styles.roleEmpty}>No org roles assigned.</Text>
        )}
      </View>

      <Pressable style={styles.action} onPress={() => router.push("/guardian/accept")}>
        <Text style={styles.actionText}>Accept guardian invite</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={() => router.push("/prescriptions")}>
        <Text style={styles.actionText}>View prescriptions</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={() => router.push("/labs")}>
        <Text style={styles.actionText}>View lab results</Text>
      </Pressable>
      <Pressable style={[styles.action, styles.logout]} onPress={handleLogout}>
        <Text style={styles.actionText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F5F7FB",
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2.8,
    textTransform: "uppercase",
    color: "#94A3B8",
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },
  roles: {
    marginTop: 24,
    gap: 8,
  },
  rolesTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#94A3B8",
  },
  roleChip: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: "flex-start",
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "600",
  },
  roleEmpty: {
    fontSize: 13,
    color: "#64748B",
  },
  action: {
    marginTop: 20,
    backgroundColor: "#0F172A",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  logout: {
    backgroundColor: "#DC2626",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
