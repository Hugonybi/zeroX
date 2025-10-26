import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "info" | "success" | "neutral";
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  info: "bg-sky-soft/70 text-ink",
  success: "bg-mint-soft text-ink",
  neutral: "bg-stone/30 text-ink",
};

export function Badge({ tone = "info", className = "", children, ...props }: BadgeProps) {
  const composedClass = `inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-medium leading-tight ${toneStyles[tone]} ${className}`.trim();

  return (
    <span className={composedClass} {...props}>
      {children}
    </span>
  );
}
