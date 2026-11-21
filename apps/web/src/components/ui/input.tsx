import React, { useId } from "react";

type FieldProps = {
  label?: string;
  helperText?: string;
  error?: string;
};

const fieldClass =
  "rounded-2xl border bg-white px-4 py-2 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70";

const stateClass = (error?: string) =>
  error
    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
    : "border-teal-100 focus:border-teal-500 focus:ring-teal-200";

const Field = ({
  id,
  label,
  helperText,
  error,
  children,
}: FieldProps & { id: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2 text-sm text-slate-600">
    {label ? (
      <label htmlFor={id} className="font-medium text-slate-700">
        {label}
      </label>
    ) : null}
    {children}
    {error ? (
      <span id={`${id}-msg`} role="alert" className="text-xs text-rose-600">
        {error}
      </span>
    ) : helperText ? (
      <span id={`${id}-msg`} className="text-xs text-slate-400">
        {helperText}
      </span>
    ) : null}
  </div>
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & FieldProps;

export const Input = ({
  label,
  helperText,
  error,
  className,
  id,
  ...props
}: InputProps) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} helperText={helperText} error={error}>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || helperText ? `${fieldId}-msg` : undefined}
        className={`${fieldClass} ${stateClass(error)} ${className ?? ""}`}
        {...props}
      />
    </Field>
  );
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & FieldProps;

export const Select = ({
  label,
  helperText,
  error,
  className,
  id,
  ...props
}: SelectProps) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} helperText={helperText} error={error}>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={`${fieldClass} ${stateClass(error)} ${className ?? ""}`}
        {...props}
      />
    </Field>
  );
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldProps;

export const Textarea = ({
  label,
  helperText,
  error,
  className,
  id,
  ...props
}: TextareaProps) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} helperText={helperText} error={error}>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={`${fieldClass} ${stateClass(error)} ${className ?? ""}`}
        {...props}
      />
    </Field>
  );
};
