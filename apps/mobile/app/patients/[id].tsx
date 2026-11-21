import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useRoles } from "@/src/auth/roles";
import {
  Badge,
  Button,
  Card,
  KeyValue,
  ListItem,
  QueryState,
  Screen,
  SectionTitle,
  statusTone,
  Subtitle,
  Title,
} from "@/src/components/ui";
import {
  getPatientLabResults,
  getPatientPrescriptions,
  getPatientProfile,
} from "@/src/lib/doctor";
import { errorMessage, formatDate, unwrap } from "@/src/lib/query";

export default function PatientChartScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const roles = useRoles();

  const profile = useQuery({
    queryKey: ["patient-profile", id],
    queryFn: () => unwrap(getPatientProfile(id as string)),
    enabled: !!id,
  });
  const rx = useQuery({
    queryKey: ["patient-rx", id],
    queryFn: () => unwrap(getPatientPrescriptions(id as string)),
    enabled: !!id && roles.isDoctor,
  });
  const labs = useQuery({
    queryKey: ["patient-labs", id],
    queryFn: () => unwrap(getPatientLabResults(id as string)),
    enabled: !!id && (roles.isDoctor || roles.isLabTech),
  });

  const patient = profile.data?.patient;

  return (
    <Screen
      onRefresh={() =>
        Promise.all([profile.refetch(), rx.refetch(), labs.refetch()])
      }
    >
      <Stack.Screen options={{ title: "Patient chart" }} />
      <QueryState
        isLoading={profile.isLoading}
        error={errorMessage(profile.error)}
        onRetry={() => profile.refetch()}
      >
        {patient ? (
          <>
            <Title>{patient.name ?? patient.user.email}</Title>
            <Card>
              <KeyValue label="NIC" value={patient.nic} />
              <KeyValue label="Email" value={patient.user.email} />
            </Card>

            {roles.isDoctor ? (
              <Button
                title="New prescription"
                icon="create"
                onPress={() => router.push(`/prescribe/${patient.id}`)}
              />
            ) : null}
            {roles.isLabTech ? (
              <Button
                title="Record lab result"
                icon="flask"
                variant={roles.isDoctor ? "outline" : "primary"}
                onPress={() => router.push(`/lab-entry/${patient.id}`)}
              />
            ) : null}

            {roles.isDoctor ? (
              <>
                <SectionTitle>Prescriptions</SectionTitle>
                <QueryState
                  isLoading={rx.isLoading}
                  error={errorMessage(rx.error)}
                  onRetry={() => rx.refetch()}
                  isEmpty={(rx.data?.prescriptions ?? []).length === 0}
                  emptyTitle="No prescriptions"
                >
                  {(rx.data?.prescriptions ?? []).map((p, i) => (
                    <ListItem
                      key={p.id}
                      index={i}
                      icon="medkit"
                      title={p.items.map((it) => it.medicine.name).join(", ")}
                      subtitle={formatDate(p.createdAt)}
                      right={
                        <Badge
                          label={p.status.replace("_", " ")}
                          tone={statusTone(p.status)}
                        />
                      }
                      onPress={() => router.push(`/prescriptions/${p.id}`)}
                    />
                  ))}
                </QueryState>
              </>
            ) : null}

            <SectionTitle>Lab results</SectionTitle>
            <QueryState
              isLoading={labs.isLoading}
              error={errorMessage(labs.error)}
              onRetry={() => labs.refetch()}
              isEmpty={(labs.data?.labResults ?? []).length === 0}
              emptyTitle="No lab results"
            >
              {(labs.data?.labResults ?? []).map((l, i) => (
                <ListItem
                  key={l.id}
                  index={i}
                  icon="flask"
                  title={l.labTestType.name}
                  subtitle={formatDate(l.createdAt)}
                  onPress={() => router.push(`/labs/${l.id}`)}
                />
              ))}
            </QueryState>
            <Subtitle>Pull down to refresh.</Subtitle>
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}
