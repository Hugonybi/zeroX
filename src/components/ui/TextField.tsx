import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export function TextField({ className = "", ...props }: TextFieldProps) {
  const composedClass = `w-full rounded-md bg-neutral-50 px-4 text-neutral-500 text-base min-h-11 text-ink placeholder:text-ink-muted/70 transition-shadow duration-200 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/40 ${className}`.trim();

  return <input className={composedClass} {...props} />;
}
