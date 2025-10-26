import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export type ToastVariant = "success" | "error" | "info";

export type ToastProps = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
};

export function Toast({ message, variant = "info", duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) {
    return null;
  }

  const variantStyles: Record<ToastVariant, string> = {
    success: "border-mint-dark bg-mint-soft text-mint-dark",
    error: "border-rose-500 bg-rose-50 text-rose-700",
    info: "border-sky-500 bg-sky-50 text-sky-700",
  };

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-6">
      <div
        className={clsx(
          "pointer-events-auto animate-slide-in-down rounded-3xl border px-6 py-4 shadow-lg",
          variantStyles[variant]
        )}
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em]">{message}</p>
      </div>
    </div>,
    document.body
  );
}
