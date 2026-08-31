import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-surface-neutral p-4">
        {icon || <Package size={32} className="text-text-tertiary" />}
      </div>
      <h3 className="text-h4 font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-body-sm text-text-secondary max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
