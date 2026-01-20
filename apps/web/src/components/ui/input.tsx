import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
};

export const Input = ({ label, helperText, className, ...props }: InputProps) => (
  <label className="flex flex-col gap-2 text-sm text-slate-600">
    {label ? <span className="font-medium text-slate-700">{label}</span> : null}
    <input
      className={`rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-base text-slate-900 shadow-sm focus:border-tide focus:outline-none ${
        className ?? ""
      }`}
      {...props}
    />
    {helperText ? <span className="text-xs text-slate-400">{helperText}</span> : null}
  </label>
);
