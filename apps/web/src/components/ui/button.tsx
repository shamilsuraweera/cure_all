import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

const styles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-ink text-white shadow-glow hover:-translate-y-[1px] hover:bg-slate-900",
  ghost: "bg-transparent text-ink hover:bg-white/70",
  outline:
    "border border-slate-200 bg-white/80 text-slate-700 hover:text-ink",
};

export const Button = ({
  variant = "primary",
  className,
  ...props
}: ButtonProps) => (
  <button
    type="button"
    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
      styles[variant]
    } ${className ?? ""}`}
    {...props}
  />
);
