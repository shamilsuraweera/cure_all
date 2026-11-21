import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { useAuth } from "@/src/auth/auth-context";
import {
  Badge,
  Body,
  Button,
  Card,
  KeyValue,
  QueryState,
  Screen,
  SectionTitle,
  statusTone,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { errorMessage, formatDate, unwrap } from "@/src/lib/query";
import { getPrescriptionDetail } from "@/src/lib/pharmacy";
import { useTheme } from "@/src/theme";

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const isPharmacist = Boolean(user?.orgRoles?.includes("PHARMACIST"));

  const query = useQuery({
    queryKey: ["prescription-detail", id],
    queryFn: () => unwrap(getPrescriptionDetail(id as string)),
    enabled: !!id,
  });

  const prescription = query.data?.prescription;
  const remaining = new Map(
    (query.data?.remainingItems ?? []).map((r) => [r.prescriptionItemId, r.remainingQuantity]),
  );
  const canShowQr = prescription && ["ACTIVE", "PARTIALLY_DISPENSED"].includes(prescription.status);

  return (
    <Screen onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: "Prescription" }} />
      <QueryState
        isLoading={query.isLoading}
        error={errorMessage(query.error)}
        onRetry={() => query.refetch()}
      >
        {prescription ? (
          <>
            <View style={{ gap: 6 }}>
              <Title>Prescription</Title>
              <Subtitle>{formatDate(prescription.createdAt)}</Subtitle>
              <Badge label={prescription.status.replace("_", " ")} tone={statusTone(prescription.status)} />
            </View>

            <SectionTitle>Medicines</SectionTitle>
            {prescription.items.map((item, i) => (
              <Card key={item.id} index={i}>
                <Body>
                  {item.medicine.name} {item.medicine.strength ?? ""}
                </Body>
                <Subtitle>
                  {item.dose} · {item.frequency} · {item.durationDays} days
                </Subtitle>
                <KeyValue label="Quantity" value={item.quantity} />
                {remaining.has(item.id) ? (
                  <KeyValue label="Remaining to dispense" value={remaining.get(item.id)} />
                ) : null}
                {item.instructions ? <Subtitle>{item.instructions}</Subtitle> : null}
              </Card>
            ))}

            {canShowQr ? (
              <>
                <SectionTitle>Show at the pharmacy</SectionTitle>
                <Card>
                  <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
                    <View style={{ padding: 12, backgroundColor: "#FFFFFF", borderRadius: 16 }}>
                      <QRCode value={prescription.id} size={170} color={theme.text} backgroundColor="#FFFFFF" />
                    </View>
                    <Subtitle>The pharmacist scans this code to find your prescription.</Subtitle>
                  </View>
                </Card>
              </>
            ) : null}

            <Button
              title="Dispense history"
              icon="time-outline"
              variant="outline"
              onPress={() => router.push(`/dispenses/${prescription.id}`)}
            />
            {isPharmacist && canShowQr ? (
              <Button
                title="Verify & dispense"
                icon="checkmark-done"
                onPress={() => router.push(`/pharmacy/${prescription.id}`)}
              />
            ) : null}
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}
