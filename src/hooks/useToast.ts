import { useState } from "react";
import type { ToastProps } from "../components/ui/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (props: Omit<ToastProps, "onClose">) => {
    setToast({
      ...props,
      onClose: () => setToast(null),
    });
  };

  return {
    toast,
    showToast,
  };
}
