import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import {
  Badge,
  Body,
  Button,
  Card,
  Field,
  Screen,
  Subtitle,
  Title,
  useToast,
} from "@/src/components/ui";
import { errorMessage, formatDate, unwrap } from "@/src/lib/query";
import { acceptOrgInvite, verifyOrgInvite } from "@/src/lib/root-admin";

export default function InviteAcceptScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const toast = useToast();
  const [token, setToken] = useState(params.token ?? "");
  const [checkedToken, setCheckedToken] = useState(params.token ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [saving, setSaving] = useState(false);

  const verify = useQuery({
    queryKey: ["invite-verify", checkedToken],
    queryFn: () => unwrap(verifyOrgInvite(checkedToken)),
    enabled: !!checkedToken,
    retry: false,
  });
  const invite = verify.data?.invite;
  const usable = invite && invite.status === "PENDING";

  const accept = async () => {
    if (saving) return;
    const next: typeof errors = {};
    if (password.length < 8) next.password = "At least 8 characters";
    if (confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    const result = await acceptOrgInvite({ token: checkedToken, password });
    setSaving(false);
    if (!result.ok) {
      toast.show(
        result.error?.message ?? "Could not accept the invite.",
        "error",
      );
      return;
    }
    toast.show("Invite accepted. Please sign in.", "success");
    router.replace("/login");
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Staff invite" }} />
      <Title>Accept invite</Title>
      <Subtitle>Enter the token you received from your administrator.</Subtitle>
      <Field
        label="Invite token"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        title="Check invite"
        variant="outline"
        icon="search"
        loading={verify.isFetching}
        onPress={() => setCheckedToken(token.trim())}
      />
      {checkedToken && verify.error ? (
        <Subtitle>{errorMessage(verify.error)}</Subtitle>
      ) : null}
      {invite ? (
        <Card>
          <Body>{invite.org.name}</Body>
          <Subtitle>{`${invite.email} · ${invite.role.replace("_", " ")}`}</Subtitle>
          <Badge label={invite.status} tone={usable ? "success" : "danger"} />
          <Subtitle>{`Expires ${formatDate(invite.expiresAt)}`}</Subtitle>
        </Card>
      ) : null}
      {usable ? (
        <>
          <Field
            label="Choose a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />
          <Field
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirm}
          />
          <Button
            title="Accept & create account"
            icon="checkmark"
            onPress={accept}
            loading={saving}
          />
        </>
      ) : null}
    </Screen>
  );
}
