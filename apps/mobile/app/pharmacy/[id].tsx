import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import {
  Badge,
  Body,
  Button,
  Card,
  Field,
  KeyValue,
  QueryState,
  Screen,
  SectionTitle,
  statusTone,
  Subtitle,
  Title,
  useToast,
} from "@/src/components/ui";
import { dispensePrescription, verifyPrescription } from "@/src/lib/pharmacy";
import { errorMessage, unwrap } from "@/src/lib/query";

export default function DispenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();

  const verify = useQuery({
    queryKey: ["pharmacy-verify", id],
    queryFn: () => unwrap(verifyPrescription(id as string)),
    enabled: !!id,
    retry: false,
  });
  const prescription = verify.data?.prescription;
  const remaining = new Map(
    (verify.data?.remainingItems ?? []).map((r) => [r.prescriptionItemId, r]),
  );

  useEffect(() => {
    setQuantities({});
  }, [verify.data]);

  const dispense = useMutation({
    mutationFn: async () => {
      const items = Object.entries(quantities)
        .map(([prescriptionItemId, q]) => ({
          prescriptionItemId,
          quantity: Number.parseInt(q, 10),
        }))
        .filter((item) => item.quantity > 0);
      return unwrap(
        dispensePrescription(id as string, {
          notes: notes.trim() || undefined,
          items,
        }),
      );
    },
    onSuccess: () => {
      toast.show("Dispense recorded.", "success");
      void qc.invalidateQueries({ queryKey: ["pharmacy-queue"] });
      void qc.invalidateQueries({ queryKey: ["prescription-detail", id] });
      void qc.invalidateQueries({ queryKey: ["home-queue"] });
      setNotes("");
      void verify.refetch();
    },
    onError: (err) =>
      toast.show(errorMessage(err) ?? "Dispense failed.", "error"),
  });

  const submit = () => {
    for (const [itemId, raw] of Object.entries(quantities)) {
      const value = Number.parseInt(raw, 10);
      const limit = remaining.get(itemId)?.remainingQuantity ?? 0;
      if (raw && (Number.isNaN(value) || value < 0)) {
        setError("Quantities must be positive numbers.");
        return;
      }
      if (value > limit) {
        setError(`You can dispense at most ${limit} of an item.`);
        return;
      }
    }
    if (!Object.values(quantities).some((q) => Number.parseInt(q, 10) > 0)) {
      setError("Enter a quantity for at least one item.");
      return;
    }
    setError(undefined);
    dispense.mutate();
  };

  return (
    <Screen onRefresh={() => verify.refetch()}>
      <Stack.Screen options={{ title: "Verify & dispense" }} />
      <QueryState
        isLoading={verify.isLoading}
        error={errorMessage(verify.error)}
        onRetry={() => verify.refetch()}
      >
        {prescription ? (
          <>
            <Title>Prescription</Title>
            <Badge
              label={prescription.status.replace("_", " ")}
              tone={statusTone(prescription.status)}
            />

            <SectionTitle>Items to dispense</SectionTitle>
            {prescription.items.map((item, i) => {
              const left = remaining.get(item.id);
              const none = (left?.remainingQuantity ?? 0) === 0;
              return (
                <Card key={item.id} index={i}>
                  <Body>
                    {item.medicine.name} {item.medicine.strength ?? ""}
                  </Body>
                  <Subtitle>
                    {item.dose} · {item.frequency} · {item.durationDays} days
                  </Subtitle>
                  <KeyValue
                    label="Dispensed / prescribed"
                    value={`${left?.dispensedQuantity ?? 0} / ${left?.prescribedQuantity ?? item.quantity}`}
                  />
                  <Field
                    label={
                      none
                        ? "Fully dispensed"
                        : `Quantity now (max ${left?.remainingQuantity})`
                    }
                    editable={!none}
                    value={quantities[item.id] ?? ""}
                    onChangeText={(v) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [item.id]: v.replace(/[^0-9]/g, ""),
                      }))
                    }
                    keyboardType="number-pad"
                    placeholder="0"
                  />
                </Card>
              );
            })}
            <Field
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            {error ? <Subtitle>{error}</Subtitle> : null}
            <Button
              title="Complete dispense"
              icon="checkmark-done"
              onPress={submit}
              loading={dispense.isPending}
            />
            <Button
              title="Dispense history"
              variant="outline"
              icon="time-outline"
              onPress={() => router.push(`/dispenses/${prescription.id}`)}
            />
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}
