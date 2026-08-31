import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, required, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-body-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          className={cn(
            "min-h-[120px] rounded-md border bg-white px-3 py-2.5 text-body-sm",
            "placeholder:text-text-tertiary resize-y",
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

Textarea.displayName = "Textarea";
