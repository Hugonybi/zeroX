import type { SelectHTMLAttributes, ReactNode } from "react";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
  leadingIcon?: ReactNode;
};

export function SelectField({ className = "", leadingIcon, children, ...props }: SelectFieldProps) {
  const baseClass = `w-full flex-1 appearance-none rounded-pill border border-stone/50 bg-white px-4 py-2 text-left text-sm text-ink transition-shadow duration-200 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/40 ${className}`.trim();

  return (
    <div className="relative flex items-center gap-3">
      {leadingIcon && <span className="pointer-events-none text-base text-ink/60">{leadingIcon}</span>}
      <select className={baseClass} {...props}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-4 text-xs uppercase tracking-[0.35em] text-ink/40">
        ▼
      </span>
    </div>
  );
}
