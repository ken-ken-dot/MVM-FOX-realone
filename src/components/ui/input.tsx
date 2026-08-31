import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, required, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            "h-10 rounded-md border bg-white px-3 text-body-sm",
            "placeholder:text-text-tertiary",
            "transition-all duration-[var(--motion-fast)] ease-out",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
            error
              ? "border-error focus:ring-error"
              : "border-border-default hover:border-text-tertiary",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-caption text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="text-caption text-text-tertiary">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
