import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PurchaseOptionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  description: ReactNode;
  selected?: boolean;
}

export function PurchaseOptionCard({
  title,
  description,
  selected = false,
  className = "",
  type = "button",
  ...props
}: PurchaseOptionCardProps) {
  const baseStyles = "w-full rounded-xl border px-5 py-4 text-left transition-all duration-200 ease-snap";
  const stateStyles = selected
    ? "border-mint bg-mint-soft shadow-brand"
    : "border-stone/50 bg-white hover:border-mint hover:bg-mint-soft/60";

  return (
    <button type={type} className={`${baseStyles} ${stateStyles} ${className}`.trim()} {...props}>
      <p className="font-semibold text-sm text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>
    </button>
  );
}
