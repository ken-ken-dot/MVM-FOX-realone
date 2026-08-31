"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  dismissible: boolean;
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant, dismissible?: boolean) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 4000;

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-success text-white",
  error: "bg-error text-white",
  info: "bg-info text-white",
  warning: "bg-warning text-white",
};

const variantIcons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertCircle size={18} />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", dismissible = true) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => {
        const next = [...prev, { id, message, variant, dismissible }];
        // Limit visible toasts
        return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next;
      });

      // Auto-dismiss (unless destructive/non-dismissible)
      if (dismissible) {
        setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg",
              "text-body-sm font-medium animate-in slide-in-from-right fade-in duration-200",
              variantStyles[toast.variant],
            )}
            role="alert"
          >
            {variantIcons[toast.variant]}
            <span className="flex-1">{toast.message}</span>
            {toast.dismissible && (
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
