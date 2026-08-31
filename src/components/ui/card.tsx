import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  className,
  children,
  dark = false,
  padding = "md",
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border",
        dark
          ? "bg-surface-card-dark border-border-dark"
          : "bg-surface-card border-border-subtle shadow-sm",
        paddingStyles[padding],
        hover && [
          "transition-shadow duration-[var(--motion-base)] ease-out",
          "hover:shadow-[var(--shadow-raised)]",
        ],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
  as?: "h2" | "h3" | "h4";
}

export function CardTitle({ className, children, as: Tag = "h3" }: CardTitleProps) {
  return (
    <Tag className={cn("text-h4 font-semibold", className)}>
      {children}
    </Tag>
  );
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn("text-body-sm text-text-secondary", className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn(className)}>{children}</div>;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn("mt-4 flex items-center gap-3", className)}>
      {children}
    </div>
  );
}
