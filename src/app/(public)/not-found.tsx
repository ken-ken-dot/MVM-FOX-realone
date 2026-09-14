import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { AmbientBackground } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <AmbientBackground icons="mixed" variant="light" />

      <div className="relative z-10">
        <div className="mb-6">
          <span className="text-[8rem] md:text-[10rem] font-bold leading-none text-accent/10 select-none tracking-tighter">
            404
          </span>
        </div>

        <div className="inline-flex p-3 rounded-xl bg-accent/10 mb-6">
          <Search size={28} className="text-accent" />
        </div>

        <h1 className="text-h1 md:text-display font-bold tracking-tight mb-4">
          Page Not Found
        </h1>

        <p className="text-body-lg text-text-secondary max-w-md mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-7 rounded-md bg-accent text-text-on-accent text-body font-medium hover:bg-accent-hover transition-colors"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-7 rounded-md border border-border-default text-text-primary text-body font-medium hover:bg-surface-neutral transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
