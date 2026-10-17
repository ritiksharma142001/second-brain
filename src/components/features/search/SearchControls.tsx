"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SORTS, type SortKey } from "@/lib/search-query";

/** The keyword box and sort menu. Keeps every other filter in the URL untouched. */
export function SearchControls({ q, sort }: { q: string; sort: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(q);
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep the box in sync with back/forward navigation.
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    setSyncedQ(q);
    setValue(q);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const update = (changes: { q?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (changes.q !== undefined) {
      if (changes.q.trim()) params.set("q", changes.q.trim());
      else params.delete("q");
    }
    if (changes.sort !== undefined) params.set("sort", changes.sort);
    params.delete("page");
    // Without a keyword there is nothing to rank, so drop a stale "relevance" sort.
    if (!params.get("q") && params.get("sort") === "relevance")
      params.delete("sort");
    const qs = params.toString();
    start(() =>
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }),
    );
  };

  const onType = (next: string) => {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ q: next }), 350);
  };

  const sortOptions = (Object.keys(SORTS) as SortKey[]).filter(
    (key) => key !== "relevance" || value.trim(),
  );

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(timer.current);
        update({ q: value });
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(e) => onType(e.target.value)}
          placeholder="Search posts, places, tags, authors..."
          aria-label="Search"
          autoComplete="off"
          className="h-12 bg-card/90 pl-11 pr-11 text-base"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {pending ? (
            <Loader2
              className="h-4 w-4 animate-spin text-muted-foreground"
              aria-label="Searching"
            />
          ) : (
            value && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setValue("");
                  clearTimeout(timer.current);
                  update({ q: "" });
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        sort
        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="h-12 rounded-md border border-input bg-card/90 px-3 font-sans text-sm text-foreground shadow-[2px_2px_0_0_var(--border)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {sortOptions.map((key) => (
            <option key={key} value={key}>
              {SORTS[key]}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
