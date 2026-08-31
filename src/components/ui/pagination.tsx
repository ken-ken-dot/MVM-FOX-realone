"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show (max 5 around current)
  const getPages = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2;

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (rangeStart > 2) {
      pages.push("ellipsis");
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (rangeEnd < totalPages - 1) {
      pages.push("ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-body-sm text-text-secondary">
        Showing {startItem}–{endItem} of {totalItems}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            "p-2 rounded-md transition-colors",
            currentPage <= 1
              ? "text-text-tertiary cursor-not-allowed"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-neutral"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {getPages().map((page, idx) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-body-sm text-text-tertiary"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={cn(
                "h-8 min-w-8 px-2 rounded-md text-body-sm font-medium transition-colors",
                page === currentPage
                  ? "bg-accent text-text-on-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-neutral"
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            "p-2 rounded-md transition-colors",
            currentPage >= totalPages
              ? "text-text-tertiary cursor-not-allowed"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-neutral"
          )}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
