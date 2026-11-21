import { useState } from "react";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Stack } from "expo-router";

import { useAuth } from "@/src/auth/auth-context";
import {
  Button,
  Card,
  Field,
  Screen,
  Subtitle,
  Body,
  useToast,
} from "@/src/components/ui";
import { usePatientContext } from "@/src/hooks/use-patient-context";
import { inviteGuardian, type GuardianInvite } from "@/src/lib/patient-records";
import { formatDate } from "@/src/lib/query";

export default function GuardianInviteScreen() {
  const toast = useToast();
  const { user } = useAuth();
  const { patients } = usePatientContext();
  const self = patients.find((p) => p.userId === user?.id);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState<GuardianInvite | null>(null);

  const submit = async () => {
    if (!self || loading) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError(undefined);
    setLoading(true);
    const result = await inviteGuardian(self.id, email.trim());
    setLoading(false);
    if (!result.ok || !result.data) {
      toast.show(
        result.error?.message ?? "Could not create the invite.",
        "error",
      );
      return;
    }
    setInvite(result.data.invite);
    setEmail("");
    toast.show("Invite created.", "success");
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Invite a guardian" }} />
      <Subtitle>
        Your guardian will receive a one-time token they can enter in the app to
        view your records.
      </Subtitle>
      <Field
        label="Guardian email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="guardian@example.com"
        error={emailError}
      />
      <Button
        title="Create invite"
        icon="person-add"
        onPress={submit}
        loading={loading}
      />

      {invite ? (
        <Card>
          <Body>Invite for {invite.email}</Body>
          <Subtitle>
            Expires {formatDate(invite.expiresAt)}. Share this token privately:
          </Subtitle>
          <Body>{invite.token}</Body>
          <Button
            title="Copy token"
            icon="copy-outline"
            variant="outline"
            onPress={async () => {
              await Clipboard.setStringAsync(invite.token);
              toast.show("Token copied.", "success");
            }}
          />
          <Button
            title="Share"
            icon="share-outline"
            variant="ghost"
            onPress={() =>
              void Share.share({
                message: `Your Cure-All guardian invite token: ${invite.token}`,
              })
            }
          />
        </Card>
      ) : null}
    </Screen>
  );
}
