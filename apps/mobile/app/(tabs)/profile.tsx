import { Alert, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/auth/auth-context";
import { useRoles } from "@/src/auth/roles";
import {
  Badge,
  Button,
  Card,
  KeyValue,
  ListItem,
  Screen,
  SectionTitle,
  haptic,
} from "@/src/components/ui";
import { usePatientContext } from "@/src/hooks/use-patient-context";

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const roles = useRoles();
  const router = useRouter();
  const { patients } = usePatientContext();
  const self = patients.find((p) => p.userId === user?.id);

  const confirmLogout = () =>
    Alert.alert("Sign out", "Do you want to sign out of Cure-All?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          haptic.tap();
          await logout();
          router.replace("/login");
        },
      },
    ]);

  return (
    <Screen>
      <Card>
        <KeyValue label="Email" value={user?.email} />
        <KeyValue
          label="Account type"
          value={roles.isRoot ? "Root administrator" : "Standard"}
        />
        {(user?.memberships ?? []).map((m) => (
          <View
            key={`${m.org.id}-${m.role}`}
            style={{ gap: 4, marginBottom: 6 }}
          >
            <KeyValue label={m.org.name} value={m.org.type} />
            <Badge label={m.role.replace("_", " ")} tone="success" />
          </View>
        ))}
        {self ? <KeyValue label="NIC" value={self.nic} /> : null}
      </Card>

      {self ? (
        <>
          <SectionTitle>My account</SectionTitle>
          <ListItem
            icon="create-outline"
            title="Edit my details"
            subtitle="Name, date of birth and location"
            onPress={() => router.push("/profile-edit")}
          />
          <ListItem
            icon="person-add-outline"
            title="Invite a guardian"
            subtitle="Let a family member view your records"
            onPress={() => router.push("/guardian/invite")}
          />
        </>
      ) : null}

      <SectionTitle>More</SectionTitle>
      <ListItem
        icon="medical-outline"
        title="Medicine catalog"
        onPress={() => router.push("/medicines")}
      />
      <ListItem
        icon="key-outline"
        title="Accept a guardian invite"
        onPress={() => router.push("/guardian/accept")}
      />

      <Button
        title="Sign out"
        variant="danger"
        icon="log-out-outline"
        onPress={confirmLogout}
      />
    </Screen>
  );
}
