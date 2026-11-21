import React from "react";

type CardProps = {
  title?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export const Card = ({
  title,
  eyebrow,
  actions,
  className,
  children,
}: CardProps) => (
  <section
    className={`animate-fade-in rounded-3xl border border-teal-100 bg-white/90 p-6 shadow-glow backdrop-blur transition-shadow hover:shadow-[0_14px_44px_rgba(13,148,136,0.2)] ${
      className ?? ""
    }`}
  >
    {eyebrow || title || actions ? (
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="mt-2 font-display text-xl text-ink">{title}</h2>
          ) : null}
        </div>
        {actions}
      </div>
    ) : null}
    <div className={`${eyebrow || title ? "mt-4 " : ""}text-sm text-slate-600`}>
      {children}
    </div>
  </section>
);
