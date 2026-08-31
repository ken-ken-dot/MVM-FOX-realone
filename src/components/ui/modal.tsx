"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-surface-overlay" />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full rounded-lg bg-white shadow-xl",
          "animate-in fade-in zoom-in-95 duration-200",
          sizeStyles[size],
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 className="text-h4 font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-neutral transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
