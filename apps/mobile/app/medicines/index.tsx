import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";

import { useRoles } from "@/src/auth/roles";
import { Badge, Button, Field, ListItem, QueryState, Screen } from "@/src/components/ui";
import { errorMessage, unwrap } from "@/src/lib/query";
import { fetchMedicines } from "@/src/lib/root-admin";

export default function MedicinesScreen() {
  const router = useRouter();
  const roles = useRoles();
  const [text, setText] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQ(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);

  const query = useQuery({
    queryKey: ["medicines", q],
    queryFn: () => unwrap(fetchMedicines(1, 50, q)),
  });
  const items = query.data?.items ?? [];

  return (
    <Screen onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: "Medicines" }} />
      <Field label="Search" value={text} onChangeText={setText} placeholder="Name or generic name" autoCapitalize="none" />
      {roles.isRoot ? (
        <Button title="Add medicine" icon="add" variant="outline" onPress={() => router.push("/admin/medicine-create")} />
      ) : null}
      <QueryState
        isLoading={query.isLoading}
        error={errorMessage(query.error)}
        onRetry={() => query.refetch()}
        isEmpty={items.length === 0}
        emptyTitle="No medicines found"
        emptyMessage="Try a different search term."
      >
        {items.map((m, i) => (
          <ListItem
            key={m.id}
            index={i}
            icon="medical"
            title={`${m.name}${m.strength ? ` ${m.strength}` : ""}`}
            subtitle={[m.genericName, m.form].filter(Boolean).join(" · ")}
            right={m.isActive ? undefined : <Badge label="Inactive" tone="muted" />}
          />
        ))}
      </QueryState>
    </Screen>
  );
}
