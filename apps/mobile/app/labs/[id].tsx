import { Linking } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useRoles } from "@/src/auth/roles";
import {
  Badge,
  Body,
  Button,
  Card,
  ListItem,
  QueryState,
  Screen,
  SectionTitle,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { fetchLabResultDetail } from "@/src/lib/lab";
import { errorMessage, formatDate, unwrap } from "@/src/lib/query";

const flag = (value: string, min?: number | null, max?: number | null) => {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  if (min != null && n < min) return "low" as const;
  if (max != null && n > max) return "high" as const;
  return "normal" as const;
};

export default function LabResultDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const roles = useRoles();

  const query = useQuery({
    queryKey: ["lab-result-detail", id],
    queryFn: () => unwrap(fetchLabResultDetail(id as string)),
    enabled: !!id,
  });
  const result = query.data?.labResult;
  const attachments = result?.attachments ?? [];

  return (
    <Screen onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: "Lab result" }} />
      <QueryState
        isLoading={query.isLoading}
        error={errorMessage(query.error)}
        onRetry={() => query.refetch()}
      >
        {result ? (
          <>
            <Title>{result.labTestType.name}</Title>
            <Subtitle>{formatDate(result.createdAt)}</Subtitle>

            <SectionTitle>Measures</SectionTitle>
            {result.measures.map((m, i) => {
              const state = flag(
                m.value,
                m.labMeasureDef.normalRangeMin,
                m.labMeasureDef.normalRangeMax,
              );
              const range =
                m.labMeasureDef.normalRangeMin != null ||
                m.labMeasureDef.normalRangeMax != null
                  ? `Normal: ${m.labMeasureDef.normalRangeMin ?? "–"} to ${m.labMeasureDef.normalRangeMax ?? "–"}`
                  : null;
              return (
                <Card key={m.labMeasureDef.name} index={i}>
                  <Body>{m.labMeasureDef.name}</Body>
                  <Title>
                    {m.value} {m.unit ?? m.labMeasureDef.unit ?? ""}
                  </Title>
                  {range ? <Subtitle>{range}</Subtitle> : null}
                  {state && state !== "normal" ? (
                    <Badge
                      label={state === "low" ? "Below range" : "Above range"}
                      tone="danger"
                    />
                  ) : state === "normal" ? (
                    <Badge label="Within range" tone="success" />
                  ) : null}
                </Card>
              );
            })}
            {result.notes ? (
              <Card>
                <Subtitle>{result.notes}</Subtitle>
              </Card>
            ) : null}

            <SectionTitle>Attachments</SectionTitle>
            {attachments.length === 0 ? (
              <Subtitle>No attachments.</Subtitle>
            ) : null}
            {attachments.map((a, i) => (
              <ListItem
                key={a.id}
                index={i}
                icon="attach"
                title={a.fileName}
                subtitle={a.mimeType ?? "File"}
                onPress={() =>
                  a.mimeType?.startsWith("image/")
                    ? router.push({
                        pathname: "/labs/attachment",
                        params: {
                          url: a.url,
                          name: a.fileName,
                          mimeType: a.mimeType ?? "",
                        },
                      })
                    : void Linking.openURL(a.url)
                }
              />
            ))}
            {roles.isLabTech ? (
              <Button
                title="Add attachment link"
                icon="link"
                variant="outline"
                onPress={() =>
                  router.push(`/labs/add-attachment?id=${result.id}`)
                }
              />
            ) : null}
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}
