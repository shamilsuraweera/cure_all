import React from "react";
import { Link, type LinkProps } from "react-router-dom";

import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-glow hover:from-teal-700 hover:to-teal-600 hover:-translate-y-[1px] active:translate-y-0",
  secondary:
    "bg-coral-500 text-white shadow-soft hover:bg-coral-600 hover:-translate-y-[1px] active:translate-y-0",
  ghost: "bg-transparent text-teal-800 hover:bg-teal-100/70",
  outline:
    "border border-teal-200 bg-white/80 text-teal-800 hover:border-teal-400 hover:bg-teal-50",
  danger: "bg-rose-600 text-white shadow-soft hover:bg-rose-700",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold no-underline focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

export const buttonClass = (variant: Variant = "primary", className?: string) =>
  `${base} ${styles[variant]} ${className ?? ""}`;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", className, loading, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonClass(variant, className)} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0`}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

type LinkButtonProps = LinkProps & { variant?: Variant };

/** A router link styled as a button (avoids invalid <a><button/></a> nesting). */
export const LinkButton = ({
  variant = "primary",
  className,
  ...props
}: LinkButtonProps) => (
  <Link className={buttonClass(variant, className)} {...props} />
);
