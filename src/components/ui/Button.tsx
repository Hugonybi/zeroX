import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type ReactNode,
} from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type CommonButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  className?: string;
};

type ButtonAsButtonProps = CommonButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
  };

type ButtonAsAnchorProps = CommonButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: "a";
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

/* ---------------- VARIANT STYLES ---------------- */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-neutral-900 text-white hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2EB257]",
  secondary:
    "bg-neutral-300 text-white hover:bg-red-900/80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#59E17C]",
  ghost:
    "bg-transparent text-neutral-900 hover:bg-[#1010100D] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#10101066]",
};

/* ---------------- SIZE STYLES ---------------- */
const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2.5 text-xs min-h-11",
  md: "px-5 py-3 text-sm min-h-11",
  lg: "px-6 py-3.5 text-base min-h-12",
};

/* ---------------- BASE STYLES ---------------- */
const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg min-px-10 font-semibold uppercase tracking-wide transition-all duration-200 ease-snap  hover:-translate-y-0.5 active:translate-y-0  disabled:cursor-not-allowed disabled:opacity-60 ";
/* ---------------- COMPONENT ---------------- */
type ButtonRef = HTMLButtonElement | HTMLAnchorElement;

export const Button = forwardRef<ButtonRef, ButtonProps>((props, ref) => {
  const {
    as: asProp = "button",
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "left",
    loading = false,
    className,
    children,
    ...rest
  } = props;

  const isIconOnly = Boolean(icon) && !children;

  const composedClass = clsx(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    isIconOnly && "p-3 rounded-full",
    loading && "opacity-70 cursor-wait",
    className
  );

  const content = (
    <>
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && icon && iconPosition === "left" && <span className="text-lg">{icon}</span>}
      {!loading && children}
      {!loading && icon && iconPosition === "right" && <span className="text-lg">{icon}</span>}
    </>
  );

  if (asProp === "a") {
    const { href, onClick, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };

    if (isIconOnly && typeof anchorRest["aria-label"] === "undefined") {
      console.warn("⚠️ Icon-only buttons should include an aria-label for accessibility.");
    }

    const handleAnchorClick: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"] = (event) => {
      if (loading) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    return (
      <a
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        href={href}
        className={composedClass}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        onClick={handleAnchorClick}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const { type = "button", disabled, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  const finalDisabled = Boolean(disabled || loading);

  if (isIconOnly && typeof buttonRest["aria-label"] === "undefined") {
    console.warn("⚠️ Icon-only buttons should include an aria-label for accessibility.");
  }

  return (
    <button
      ref={ref as ForwardedRef<HTMLButtonElement>}
      type={type}
      className={composedClass}
      disabled={finalDisabled}
      aria-busy={loading || undefined}
      {...buttonRest}
    >
      {content}
    </button>
  );
});

Button.displayName = "Button";
