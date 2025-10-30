import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export function TextField({ className = "", ...props }: TextFieldProps) {
  const composedClass = `w-full rounded-pill border border-stone/50 bg-white px-4 py-3 text-base min-h-11 text-ink placeholder:text-ink-muted/70 transition-shadow duration-200 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/40 ${className}`.trim();

  return <input className={composedClass} {...props} />;
}
