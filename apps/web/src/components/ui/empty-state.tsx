import React from "react";

export const EmptyState = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/50 px-6 py-8 text-center">
    <p className="font-display text-base text-ink">{title}</p>
    {children ? (
      <div className="mt-1 text-sm text-slate-500">{children}</div>
    ) : null}
  </div>
);
