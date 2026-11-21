import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import type { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/src/auth/auth-context";
import { useRoles } from "@/src/auth/roles";
import {
  Badge,
  Card,
  ListItem,
  Screen,
  SectionTitle,
  Segmented,
  SkeletonList,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { usePatientContext } from "@/src/hooks/use-patient-context";
import {
  getPatientLabResults,
  getPatientPrescriptions,
} from "@/src/lib/patient-records";
import { listPrescriptions } from "@/src/lib/pharmacy";
import { fetchAdminStats } from "@/src/lib/root-admin";
import { formatDate, unwrap } from "@/src/lib/query";
import { useTheme } from "@/src/theme";

type Action = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
};

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12
    ? "Good morning"
    : hour < 18
      ? "Good afternoon"
      : "Good evening";
};

const StatTile = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.tileValue, { color: theme.primary }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: theme.textMuted }]}>
        {label}
      </Text>
    </View>
  );
};

export default function HomeTab() {
  const { user } = useAuth();
  const roles = useRoles();
  const router = useRouter();
  const theme = useTheme();
  const patientCtx = usePatientContext();
  const patientId = patientCtx.selectedPatientId;
  const isPharmacyMember = Boolean(user?.orgRoles?.includes("PHARMACIST"));

  const rxQuery = useQuery({
    queryKey: ["home-rx", patientId],
    queryFn: () => unwrap(getPatientPrescriptions(patientId as string)),
    enabled: roles.hasRecords && !!patientId,
  });
  const labQuery = useQuery({
    queryKey: ["home-labs", patientId],
    queryFn: () => unwrap(getPatientLabResults(patientId as string)),
    enabled: roles.hasRecords && !!patientId,
  });
  const queueQuery = useQuery({
    queryKey: ["home-queue"],
    queryFn: () =>
      unwrap(listPrescriptions({ pageSize: 50, status: "ACTIVE" })),
    enabled: isPharmacyMember,
  });
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => unwrap(fetchAdminStats()),
    enabled: roles.isRoot,
  });

  const refreshAll = () =>
    Promise.all([
      patientCtx.refetch(),
      rxQuery.refetch(),
      labQuery.refetch(),
      queueQuery.refetch(),
      statsQuery.refetch(),
    ]);

  const actions: Action[] = [];
  if (roles.isDoctor || roles.isLabTech) {
    actions.push({
      title: "Find a patient",
      subtitle: "Search by NIC or email",
      icon: "search",
      href: "/(tabs)/patients",
    });
  }
  if (isPharmacyMember) {
    actions.push({
      title: "Scan a prescription",
      subtitle: "Scan the patient's QR code",
      icon: "qr-code",
      href: "/pharmacy/scan",
    });
  }
  actions.push({
    title: "Medicine catalog",
    subtitle: "Search registered medicines",
    icon: "medical",
    href: "/medicines",
  });

  const activeRx = (rxQuery.data?.prescriptions ?? []).filter((p) =>
    ["ACTIVE", "PARTIALLY_DISPENSED"].includes(p.status),
  );
  const latestLab = labQuery.data?.labResults?.[0];
  const selectedPatient = patientCtx.patients.find((p) => p.id === patientId);

  return (
    <Screen onRefresh={refreshAll}>
      <View style={styles.header}>
        <Subtitle>{greeting()}</Subtitle>
        <Title>{user?.email?.split("@")[0] ?? "Welcome"}</Title>
        <View style={styles.badges}>
          {roles.isRoot ? <Badge label="Root admin" /> : null}
          {(user?.orgRoles ?? []).map((r) => (
            <Badge key={r} label={r.replace("_", " ")} tone="success" />
          ))}
          {roles.isPatient ? <Badge label="Patient" tone="warning" /> : null}
          {roles.isGuardian ? <Badge label="Guardian" tone="warning" /> : null}
        </View>
      </View>

      {roles.hasRecords ? (
        <>
          <SectionTitle>My health</SectionTitle>
          {patientCtx.patients.length > 1 ? (
            <Segmented
              options={patientCtx.patients.map((p) => ({
                label: p.userId === user?.id ? "Me" : (p.name ?? p.user.email),
                value: p.id,
              }))}
              value={patientId ?? ""}
              onChange={patientCtx.setSelectedPatientId}
            />
          ) : null}
          {rxQuery.isLoading || labQuery.isLoading ? (
            <SkeletonList count={2} height={90} />
          ) : (
            <>
              <View style={styles.tiles}>
                <StatTile
                  label="Active prescriptions"
                  value={activeRx.length}
                />
                <StatTile
                  label="Lab results"
                  value={labQuery.data?.labResults?.length ?? 0}
                />
              </View>
              <ListItem
                index={0}
                icon="medkit"
                title="Prescriptions"
                subtitle={
                  activeRx[0]
                    ? `Latest: ${activeRx[0].items?.[0]?.medicine?.name ?? "Prescription"} · ${formatDate(activeRx[0].createdAt)}`
                    : "No active prescriptions"
                }
                onPress={() => router.push("/(tabs)/records")}
              />
              <ListItem
                index={1}
                icon="flask"
                title="Lab results"
                subtitle={
                  latestLab
                    ? `${latestLab.labTestType.name} · ${formatDate(latestLab.createdAt)}`
                    : "No lab results yet"
                }
                onPress={() => router.push("/(tabs)/records")}
              />
              {selectedPatient ? (
                <Subtitle>
                  Viewing records for{" "}
                  {selectedPatient.name ?? selectedPatient.user.email}
                </Subtitle>
              ) : null}
            </>
          )}
        </>
      ) : null}

      {isPharmacyMember ? (
        <>
          <SectionTitle>Pharmacy</SectionTitle>
          <Card onPress={() => router.push("/(tabs)/pharmacy")}>
            <Text style={[styles.tileValue, { color: theme.primary }]}>
              {queueQuery.data?.prescriptions?.length ?? "–"}
            </Text>
            <Subtitle>prescriptions waiting to be dispensed</Subtitle>
          </Card>
        </>
      ) : null}

      {roles.isRoot ? (
        <>
          <SectionTitle>Platform</SectionTitle>
          {statsQuery.isLoading ? (
            <SkeletonList count={1} height={90} />
          ) : statsQuery.data?.stats ? (
            <View style={styles.tiles}>
              <StatTile
                label="Organizations"
                value={statsQuery.data.stats.totalOrgs}
              />
              <StatTile
                label="Patients"
                value={statsQuery.data.stats.totalPatients}
              />
              <StatTile
                label="Active Rx"
                value={statsQuery.data.stats.activePrescriptions}
              />
              <StatTile
                label="Lab results"
                value={statsQuery.data.stats.totalLabResults}
              />
            </View>
          ) : null}
        </>
      ) : null}

      <SectionTitle>Quick actions</SectionTitle>
      {actions.map((action, index) => (
        <ListItem
          key={action.title}
          index={index}
          icon={action.icon}
          title={action.title}
          subtitle={action.subtitle}
          onPress={() => router.push(action.href)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    flexGrow: 1,
    flexBasis: "45%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  tileValue: { fontSize: 28, fontWeight: "800" },
  tileLabel: { fontSize: 12, marginTop: 2 },
});
