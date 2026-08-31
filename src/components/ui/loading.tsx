import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <svg
      className={cn("animate-spin text-accent", sizeStyles[size], className)}
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
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-body-sm text-text-tertiary">{message}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  count?: number;
}

export function LoadingCard({ count = 3 }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border-subtle bg-white p-6 animate-pulse"
        >
          <div className="h-4 bg-surface-neutral rounded w-3/4 mb-3" />
          <div className="h-3 bg-surface-neutral rounded w-1/2 mb-2" />
          <div className="h-3 bg-surface-neutral rounded w-2/3" />
        </div>
      ))}
    </>
  );
}
