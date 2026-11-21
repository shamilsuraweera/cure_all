import { useState } from "react";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";

import {
  Body,
  Button,
  Card,
  Field,
  PickerField,
  Screen,
  Subtitle,
  useToast,
} from "@/src/components/ui";
import { formatDate, unwrap } from "@/src/lib/query";
import {
  fetchOrgs,
  inviteOrgMember,
  type OrgInvite,
} from "@/src/lib/root-admin";

const ROLES = [
  { label: "Doctor", value: "DOCTOR" },
  { label: "Pharmacist", value: "PHARMACIST" },
  { label: "Lab technician", value: "LAB_TECH" },
];

export default function OrgInviteScreen() {
  const params = useLocalSearchParams<{ orgId?: string }>();
  const toast = useToast();
  const [orgId, setOrgId] = useState(params.orgId ?? "");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    org?: string;
    role?: string;
    email?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const [invite, setInvite] = useState<OrgInvite | null>(null);

  const orgs = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: () => unwrap(fetchOrgs(1, 100)),
  });

  const submit = async () => {
    if (saving) return;
    const next: typeof errors = {};
    if (!orgId) next.org = "Select an organization";
    if (!role) next.role = "Select a role";
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      next.email = "Enter a valid email";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    const result = await inviteOrgMember(orgId, { email: email.trim(), role });
    setSaving(false);
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
      <Stack.Screen options={{ title: "Invite staff" }} />
      <PickerField
        label="Organization"
        options={(orgs.data?.items ?? []).map((o) => ({
          label: o.name,
          value: o.id,
          subtitle: o.type,
        }))}
        value={orgId}
        onChange={setOrgId}
        error={errors.org}
      />
      <PickerField
        label="Role"
        options={ROLES}
        value={role}
        onChange={setRole}
        error={errors.role}
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="staff@hospital.org"
        error={errors.email}
      />
      <Button
        title="Create invite"
        icon="mail"
        onPress={submit}
        loading={saving}
      />
      {invite ? (
        <Card>
          <Body>{`Invite for ${invite.email} (${invite.role.replace("_", " ")})`}</Body>
          <Subtitle>{`Expires ${formatDate(invite.expiresAt)}. Share this token privately:`}</Subtitle>
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
                message: `Your Cure-All staff invite token: ${invite.token}`,
              })
            }
          />
        </Card>
      ) : null}
    </Screen>
  );
}
