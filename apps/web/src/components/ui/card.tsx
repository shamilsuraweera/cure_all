import React from "react";

type CardProps = {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export const Card = ({ title, eyebrow, children }: CardProps) => (
  <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow backdrop-blur">
    {eyebrow ? (
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
        {eyebrow}
      </p>
    ) : null}
    {title ? (
      <h2 className="mt-2 font-display text-xl text-ink">{title}</h2>
    ) : null}
    <div className="mt-4 text-sm text-slate-600">{children}</div>
  </section>
);
