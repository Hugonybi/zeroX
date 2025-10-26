import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

export function TextArea({ className = "", ...props }: TextAreaProps) {
  const composedClass = `w-full rounded-3xl border border-stone/50 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 transition-shadow duration-200 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/40 ${className}`.trim();

  return <textarea className={composedClass} {...props} />;
}
