import React from "react";

const tones = {
  teal: "bg-teal-100 text-teal-800",
  coral: "bg-coral-100 text-coral-600",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-slate-100 text-slate-700",
} as const;

export const Badge = ({
  tone = "teal",
  children,
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
}) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
  >
    {children}
  </span>
);
