import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

/** Previous / numbered / next links (works without JavaScript). */
export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Window of up to 5 numbers around the current page.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => start + i,
  );
  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 font-mono text-sm transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className={cn(base, "bg-card hover:bg-accent")}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : null}
      {pages.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          aria-current={n === page ? "page" : undefined}
          className={cn(
            base,
            n === page
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-accent",
          )}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className={cn(base, "bg-card hover:bg-accent")}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </nav>
  );
}
