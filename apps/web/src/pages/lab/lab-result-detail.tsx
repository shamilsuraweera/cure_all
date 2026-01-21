import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { fetchLabResultDetail, uploadLabAttachment } from "../../lib/lab";

export const LabResultDetailPage = () => {
  const { id = "" } = useParams();
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [sizeBytes, setSizeBytes] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const labResultQuery = useQuery({
    queryKey: ["lab-result", id],
    queryFn: () => fetchLabResultDetail(id),
    enabled: Boolean(id),
  });

  const labResult = labResultQuery.data?.data?.labResult;
  const attachments = labResult?.attachments ?? [];

  const submitAttachment = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await uploadLabAttachment(id, {
      fileName,
      url,
      mimeType: mimeType || undefined,
      sizeBytes: sizeBytes ? Number(sizeBytes) : undefined,
    });

    if (result.ok) {
      setStatus("Attachment saved.");
      setFileName("");
      setUrl("");
      setMimeType("");
      setSizeBytes("");
      void labResultQuery.refetch();
      return;
    }

    setStatus(result.error?.message ?? "Failed to upload attachment.");
  };

  return (
    <div>
      <SectionHeader
        title="Lab result detail"
        subtitle={labResult ? labResult.labTestType.name : "Review lab measures."}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Measures" eyebrow="Result data">
          {labResultQuery.isLoading ? (
            <p>Loading lab result...</p>
          ) : labResult ? (
            <div className="space-y-3">
              {labResult.measures.map((measure) => (
                <div key={measure.labMeasureDef.name} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <p className="font-medium text-slate-800">{measure.labMeasureDef.name}</p>
                  <p className="text-xs text-slate-500">
                    {measure.value} {measure.unit ?? ""}
                  </p>
                </div>
              ))}
              {labResult.notes ? (
                <p className="text-xs text-slate-500">Notes: {labResult.notes}</p>
              ) : null}
            </div>
          ) : (
            <p>No lab result data available.</p>
          )}
        </Card>

        <Card title="Upload attachment" eyebrow="Documents">
          <form className="space-y-4" onSubmit={submitAttachment}>
            <Input
              label="File name"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              required
            />
            <Input
              label="URL"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              required
            />
            <Input
              label="MIME type"
              value={mimeType}
              onChange={(event) => setMimeType(event.target.value)}
              placeholder="image/png"
            />
            <Input
              label="Size (bytes)"
              type="number"
              value={sizeBytes}
              onChange={(event) => setSizeBytes(event.target.value)}
            />
            <Button type="submit">Upload attachment</Button>
            {status ? <p className="text-sm text-rose-500">{status}</p> : null}
          </form>
        </Card>
      </div>

      <Card title="Attachments" eyebrow="Preview">
        {attachments.length === 0 ? <p>No attachments yet.</p> : null}
        <div className="space-y-4">
          {attachments.map((attachment) => {
            const isImage = attachment.mimeType?.startsWith("image/");
            return (
              <div key={attachment.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <p className="font-medium text-slate-800">{attachment.fileName}</p>
                <a
                  className="text-xs text-slate-500 underline"
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open file
                </a>
                {isImage ? (
                  <img
                    src={attachment.url}
                    alt={attachment.fileName}
                    className="mt-3 max-h-64 rounded-2xl border border-slate-100 object-contain"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
