import React from "react";

type Tone = "success" | "error" | "info" | "warning";

const tones: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-teal-200 bg-teal-50 text-teal-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export const Alert = ({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    className={`animate-fade-in rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}
  >
    {children}
  </div>
);
