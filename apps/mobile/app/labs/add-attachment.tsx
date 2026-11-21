import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button, Field, Screen, Subtitle, useToast } from "@/src/components/ui";
import { uploadLabAttachment } from "@/src/lib/lab";

export default function AddAttachmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [errors, setErrors] = useState<{ fileName?: string; url?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    const next: typeof errors = {};
    if (!fileName.trim()) next.fileName = "Required";
    if (!/^https?:\/\/\S+$/i.test(url.trim())) next.url = "Enter a valid http(s) URL";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    const result = await uploadLabAttachment(id as string, {
      fileName: fileName.trim(),
      url: url.trim(),
      mimeType: mimeType.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(result.error?.message ?? "Could not add the attachment.", "error");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["lab-result-detail", id] });
    toast.show("Attachment added.", "success");
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Add attachment" }} />
      <Subtitle>Attach a link to the report file (for example a PDF or image hosted by your lab).</Subtitle>
      <Field label="File name" value={fileName} onChangeText={setFileName} placeholder="report.pdf" error={errors.fileName} />
      <Field label="File URL" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="https://..." error={errors.url} />
      <Field label="MIME type (optional)" value={mimeType} onChangeText={setMimeType} autoCapitalize="none" placeholder="application/pdf" />
      <Button title="Add attachment" icon="attach" onPress={submit} loading={saving} />
    </Screen>
  );
}
