import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { useRoles } from "@/src/auth/roles";
import {
  EmptyState,
  ListItem,
  QueryState,
  Screen,
  SectionTitle,
  Card,
  Body,
  Subtitle,
} from "@/src/components/ui";
import { errorMessage, unwrap } from "@/src/lib/query";
import { fetchAdminStats } from "@/src/lib/root-admin";

export default function AdminTab() {
  const router = useRouter();
  const roles = useRoles();
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => unwrap(fetchAdminStats()),
    enabled: roles.isRoot,
  });

  if (!roles.isRoot) {
    return (
      <Screen>
        <EmptyState icon="lock-closed-outline" title="Administrators only" />
      </Screen>
    );
  }

  const s = stats.data?.stats;
  return (
    <Screen onRefresh={() => stats.refetch()}>
      <SectionTitle>Platform overview</SectionTitle>
      <QueryState
        isLoading={stats.isLoading}
        error={errorMessage(stats.error)}
        onRetry={() => stats.refetch()}
      >
        {s ? (
          <Card>
            <View style={{ gap: 4 }}>
              <Body>{`${s.activeOrgs} active / ${s.suspendedOrgs} suspended organizations`}</Body>
              <Subtitle>{`${s.totalPatients} patients · ${s.totalMedicines} medicines · ${s.totalLabTests} lab tests`}</Subtitle>
              <Subtitle>{`${s.activePrescriptions} active, ${s.dispensedPrescriptions} dispensed of ${s.totalPrescriptions} prescriptions · ${s.totalLabResults} lab results`}</Subtitle>
            </View>
          </Card>
        ) : null}
      </QueryState>

      <SectionTitle>Organizations</SectionTitle>
      <ListItem
        icon="business"
        title="Organizations"
        subtitle="View, suspend or activate"
        onPress={() => router.push("/admin/orgs")}
      />
      <ListItem
        icon="add-circle"
        title="Create organization"
        onPress={() => router.push("/admin/org-create")}
      />
      <ListItem
        icon="mail"
        title="Invite staff member"
        subtitle="Doctor, pharmacist or lab tech"
        onPress={() => router.push("/admin/org-invite")}
      />

      <SectionTitle>People</SectionTitle>
      <ListItem
        icon="person-add"
        title="Register patient"
        onPress={() => router.push("/admin/patient-create")}
      />

      <SectionTitle>Catalogs</SectionTitle>
      <ListItem
        icon="medical"
        title="Medicines"
        onPress={() => router.push("/medicines")}
      />
      <ListItem
        icon="flask"
        title="Lab tests & measures"
        onPress={() => router.push("/admin/lab-tests")}
      />
    </Screen>
  );
}
