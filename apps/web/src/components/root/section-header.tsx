import React from "react";

export const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-6">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Root Admin</p>
    <h2 className="mt-2 font-display text-3xl text-ink">{title}</h2>
    {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
  </div>
);
