import { useState } from "react";
import { Alert } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";

import {
  Badge,
  Button,
  Card,
  Body,
  Field,
  QueryState,
  Screen,
  statusTone,
  Subtitle,
  useToast,
} from "@/src/components/ui";
import { errorMessage, unwrap } from "@/src/lib/query";
import {
  fetchOrgs,
  updateOrgStatus,
  type Organization,
} from "@/src/lib/root-admin";

export default function OrgsScreen() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: () => unwrap(fetchOrgs(1, 100)),
  });
  const orgs = (query.data?.items ?? []).filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.domain ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (org: Organization) => {
    const next = org.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    Alert.alert(
      `${next === "SUSPENDED" ? "Suspend" : "Activate"} ${org.name}?`,
      undefined,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: next === "SUSPENDED" ? "destructive" : "default",
          onPress: async () => {
            setPending(org.id);
            const result = await updateOrgStatus(org.id, next);
            setPending(null);
            if (!result.ok) {
              toast.show(result.error?.message ?? "Update failed.", "error");
              return;
            }
            toast.show(`${org.name} is now ${next.toLowerCase()}.`, "success");
            void qc.invalidateQueries({ queryKey: ["admin-orgs"] });
          },
        },
      ],
    );
  };

  return (
    <Screen onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: "Organizations" }} />
      <Field
        label="Search"
        value={search}
        onChangeText={setSearch}
        placeholder="Name or domain"
        autoCapitalize="none"
      />
      <Button
        title="Create organization"
        icon="add"
        variant="outline"
        onPress={() => router.push("/admin/org-create")}
      />
      <QueryState
        isLoading={query.isLoading}
        error={errorMessage(query.error)}
        onRetry={() => query.refetch()}
        isEmpty={orgs.length === 0}
        emptyTitle="No organizations"
      >
        {orgs.map((org, i) => (
          <Card key={org.id} index={i}>
            <Body>{org.name}</Body>
            <Subtitle>
              {[org.type, org.domain].filter(Boolean).join(" · ")}
            </Subtitle>
            <Badge label={org.status} tone={statusTone(org.status)} />
            <Button
              title="Invite member"
              variant="ghost"
              icon="mail-outline"
              onPress={() => router.push(`/admin/org-invite?orgId=${org.id}`)}
            />
            <Button
              title={org.status === "ACTIVE" ? "Suspend" : "Activate"}
              variant={org.status === "ACTIVE" ? "danger" : "outline"}
              loading={pending === org.id}
              onPress={() => toggle(org)}
            />
          </Card>
        ))}
      </QueryState>
    </Screen>
  );
}
