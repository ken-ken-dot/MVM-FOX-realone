import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-text-on-accent hover:bg-accent-hover active:bg-accent-hover active:scale-[0.98] active:brightness-90",
  secondary:
    "bg-bg-primary-dark text-text-on-dark hover:bg-bg-primary-dark-elevated active:scale-[0.98]",
  outline:
    "border border-border-default text-text-primary hover:bg-surface-neutral active:bg-surface-neutral active:scale-[0.98]",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-neutral active:bg-surface-neutral",
  danger:
    "bg-error text-white hover:bg-error/90 active:bg-error/90 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-small gap-1.5",
  md: "h-10 px-5 text-body-sm gap-2",
  lg: "h-12 px-8 text-body gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium",
          "transition-all duration-[var(--motion-fast)] ease-out",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          // Touch device hover guard — no hover effects on touch
          "@media (hover: hover) { &:hover { /* hover styles applied via variant */ } }",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
