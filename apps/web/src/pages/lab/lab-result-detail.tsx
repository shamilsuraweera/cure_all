import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  const labResultQuery = useQuery({
    queryKey: ["lab-result", id],
    queryFn: () => fetchLabResultDetail(id),
    enabled: Boolean(id),
  });

  const labResult = labResultQuery.data?.data?.labResult;
  const attachments = labResult?.attachments ?? [];

  const handleFillDemoAttachment = (type: "pdf" | "image") => {
    if (type === "pdf") {
      setFileName(`Diagnostic-Report-${id.slice(0, 6)}.pdf`);
      setUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
      setMimeType("application/pdf");
      setSizeBytes("13264");
    } else {
      setFileName(`Lab-Scan-${id.slice(0, 6)}.png`);
      setUrl("https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80");
      setMimeType("image/png");
      setSizeBytes("248102");
    }
  };

  const submitAttachment = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await uploadLabAttachment(id, {
      fileName,
      url,
      mimeType: mimeType || undefined,
      sizeBytes: sizeBytes ? Number(sizeBytes) : undefined,
    });

    if (result.ok) {
      setStatus("Attachment successfully uploaded and linked to this lab result.");
      setStatusType("success");
      setFileName("");
      setUrl("");
      setMimeType("");
      setSizeBytes("");
      void labResultQuery.refetch();
      return;
    }

    setStatus(result.error?.message ?? "Failed to upload attachment.");
    setStatusType("error");
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/lab"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-ink transition"
        >
          &larr; Back to Lab Hub
        </Link>
      </div>

      <SectionHeader
        title="Lab result detail"
        subtitle={
          labResult
            ? `${labResult.labTestType.name} · Recorded ${new Date(labResult.createdAt).toLocaleDateString()}`
            : "Review diagnostic test measures and attachments."
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Measures & Diagnostics" eyebrow="Test Results">
          {labResultQuery.isLoading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading lab result...</div>
          ) : labResult ? (
            <div className="space-y-4">
              <div className="space-y-3">
                {labResult.measures.map((measure, idx) => {
                  const numVal = parseFloat(measure.value);
                  const def = measure.labMeasureDef;
                  const hasMin = def.normalRangeMin !== null && def.normalRangeMin !== undefined;
                  const hasMax = def.normalRangeMax !== null && def.normalRangeMax !== undefined;

                  let flag: "LOW" | "HIGH" | "NORMAL" | null = null;
                  if (!isNaN(numVal) && (hasMin || hasMax)) {
                    if (hasMin && numVal < (def.normalRangeMin as number)) {
                      flag = "LOW";
                    } else if (hasMax && numVal > (def.normalRangeMax as number)) {
                      flag = "HIGH";
                    } else if (hasMin && hasMax) {
                      flag = "NORMAL";
                    }
                  }

                  return (
                    <div
                      key={def.name || idx}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{def.name}</p>
                          {flag === "LOW" ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                              Low
                            </span>
                          ) : flag === "HIGH" ? (
                            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800">
                              High
                            </span>
                          ) : flag === "NORMAL" ? (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                              Normal
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {hasMin && hasMax
                            ? `Ref range: ${def.normalRangeMin} – ${def.normalRangeMax} ${measure.unit || def.unit || ""}`
                            : "Standard parameter"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-slate-900">
                          {measure.value}
                        </span>{" "}
                        <span className="text-xs text-slate-500">{measure.unit || def.unit || ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {labResult.notes ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Technician Observations
                  </span>
                  <p className="mt-1 text-sm text-slate-700">{labResult.notes}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No lab result data available.</p>
          )}
        </Card>

        <Card title="Upload attachment" eyebrow="Documents & Scans">
          <form className="space-y-4" onSubmit={submitAttachment}>
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-slate-500">Quick fill sample:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemoAttachment("pdf")}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                >
                  + Sample PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemoAttachment("image")}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                >
                  + Sample Image
                </button>
              </div>
            </div>

            <Input
              label="File name"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="e.g. Blood-Smear-Analysis.pdf"
              required
            />
            <Input
              label="Resource URL"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="MIME type"
                value={mimeType}
                onChange={(event) => setMimeType(event.target.value)}
                placeholder="application/pdf"
              />
              <Input
                label="Size (bytes)"
                type="number"
                value={sizeBytes}
                onChange={(event) => setSizeBytes(event.target.value)}
                placeholder="e.g. 150000"
              />
            </div>

            <Button type="submit">Upload attachment</Button>

            {status ? (
              <p
                className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                  statusType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {status}
              </p>
            ) : null}
          </form>
        </Card>
      </div>

      <Card
        title="Attachments & Scans"
        eyebrow={attachments.length > 0 ? `${attachments.length} attached` : "Preview"}
      >
        {attachments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
            No diagnostic images or document attachments uploaded yet for this test record.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {attachments.map((attachment) => {
            const isImage = attachment.mimeType?.startsWith("image/");
            const isPdf = attachment.mimeType === "application/pdf" || attachment.fileName.endsWith(".pdf");

            return (
              <div
                key={attachment.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 break-all">{attachment.fileName}</p>
                    {attachment.mimeType ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                        {attachment.mimeType.split("/")[1] || attachment.mimeType}
                      </span>
                    ) : null}
                  </div>

                  {attachment.sizeBytes ? (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatFileSize(attachment.sizeBytes)}
                    </p>
                  ) : null}

                  {isImage ? (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <img
                        src={attachment.url}
                        alt={attachment.fileName}
                        className="max-h-56 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : isPdf ? (
                    <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-slate-500">
                      <div className="text-center">
                        <span className="text-2xl">📄</span>
                        <p className="mt-1 text-xs font-medium">PDF Document</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <a
                    className="inline-flex items-center gap-1 text-xs font-semibold text-tide hover:underline"
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open resource &rarr;
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
