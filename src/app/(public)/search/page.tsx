import { Suspense } from "react";
import Link from "next/link";
import { Plane, SearchX, X } from "lucide-react";
import { PostCard } from "@/components/features/PostCard";
import { Pagination } from "@/components/features/search/Pagination";
import { SearchControls } from "@/components/features/search/SearchControls";
import { Button } from "@/components/ui/button";
import { getFacets, parseSearchParams, searchPosts } from "@/lib/search";
import { buildSearchUrl, type SearchQuery } from "@/lib/search-query";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Search",
  description: "Search posts by keyword, category, tag or destination.",
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const chip =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors";
const chipOff = "bg-card/80 hover:bg-accent";
const chipOn =
  "border-[color:var(--shadow-ink)] bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--highlight)]";

function FilterPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={`Remove filter ${label}`}
      className="sticker hover:bg-accent"
    >
      {label} <X className="h-3 w-3" />
    </Link>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query: SearchQuery = parseSearchParams(await searchParams);
  const [{ posts, total, page, totalPages, terms }, facets] = await Promise.all(
    [searchPosts(query), getFacets()],
  );

  const activeCategory = facets.categories.find(
    (c) => c.slug === query.category,
  );
  const activeTags = query.tags.map(
    (slug) => facets.tags.find((t) => t.slug === slug)?.name ?? slug,
  );
  const hasFilters = !!query.category || query.tags.length > 0;
  const hasAnything = hasFilters || !!query.q;
  // Travel first: it's a headline section of the site.
  const categories = [...facets.categories].sort(
    (a, b) =>
      Number(b.slug === "travel") - Number(a.slug === "travel") ||
      a.name.localeCompare(b.name),
  );

  return (
    <div className="container py-12 sm:py-16">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow rise mb-3">{"// find anything"}</p>
        <h1
          className="rise text-4xl font-bold sm:text-5xl"
          style={{ "--d": 1 } as React.CSSProperties}
        >
          Search the <span className="marker">notebook</span>
        </h1>
        <p
          className="rise mt-3 text-muted-foreground"
          style={{ "--d": 2 } as React.CSSProperties}
        >
          Look up a topic, a destination, a tag or an author, then narrow it
          down with filters.
        </p>
      </header>

      <Suspense
        fallback={<div className="h-12 rounded-md border bg-card/60" />}
      >
        <SearchControls q={query.q} sort={query.sort} />
      </Suspense>

      <div className="mt-10 grid gap-8 lg:grid-cols-[17rem_1fr]">
        {/* ───────── Filters ───────── */}
        <aside>
          <details
            open
            className="group rounded-xl border bg-card/80 backdrop-blur-sm lg:[&>summary]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium">
              Filters
              {hasFilters && (
                <span className="sticker">
                  {(query.category ? 1 : 0) + query.tags.length} active
                </span>
              )}
            </summary>
            <div className="space-y-6 border-t p-4 lg:border-t-0">
              <section>
                <h2 className="eyebrow mb-3">Category</h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const active = c.slug === query.category;
                    return (
                      <Link
                        key={c.slug}
                        href={buildSearchUrl(query, {
                          category: active ? undefined : c.slug,
                        })}
                        scroll={false}
                        aria-pressed={active}
                        className={cn(
                          chip,
                          active ? chipOn : chipOff,
                          c.count === 0 && !active && "opacity-60",
                        )}
                      >
                        {c.slug === "travel" && (
                          <Plane className="h-3.5 w-3.5" />
                        )}
                        {c.name}
                        <span className="font-mono text-xs opacity-70">
                          {c.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {facets.tags.length > 0 && (
                <section>
                  <h2 className="eyebrow mb-3">Tags &amp; destinations</h2>
                  <div className="flex flex-wrap gap-2">
                    {facets.tags.map((t) => {
                      const active = query.tags.includes(t.slug);
                      const next = active
                        ? query.tags.filter((s) => s !== t.slug)
                        : [...query.tags, t.slug];
                      return (
                        <Link
                          key={t.slug}
                          href={buildSearchUrl(query, { tags: next })}
                          scroll={false}
                          aria-pressed={active}
                          className={cn(
                            chip,
                            "font-mono text-xs",
                            active ? chipOn : chipOff,
                          )}
                        >
                          #{t.name}
                          <span className="opacity-70">{t.count}</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {hasFilters && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link
                    href={buildSearchUrl(query, {
                      category: undefined,
                      tags: [],
                    })}
                    scroll={false}
                  >
                    Clear filters
                  </Link>
                </Button>
              )}
            </div>
          </details>
        </aside>

        {/* ───────── Results ───────── */}
        <section aria-live="polite">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <p className="mr-2 font-mono text-sm text-muted-foreground">
              {total} {total === 1 ? "result" : "results"}
              {query.q && (
                <>
                  {" "}
                  for <span className="text-foreground">“{query.q}”</span>
                </>
              )}
            </p>
            {activeCategory && (
              <FilterPill
                href={buildSearchUrl(query, { category: undefined })}
                label={activeCategory.name}
              />
            )}
            {query.tags.map((slug, i) => (
              <FilterPill
                key={slug}
                href={buildSearchUrl(query, {
                  tags: query.tags.filter((s) => s !== slug),
                })}
                label={`#${activeTags[i]}`}
              />
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="window">
              <div className="window-bar">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
                <span className="ml-2">no-matches.log</span>
              </div>
              <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
                <SearchX className="h-10 w-10 text-highlight" />
                <div>
                  <p className="text-lg font-bold">Nothing found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hasAnything
                      ? "Try fewer words, check the spelling, or remove a filter."
                      : "There are no published posts yet."}
                  </p>
                </div>
                {hasFilters && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={buildSearchUrl(query, {
                        category: undefined,
                        tags: [],
                      })}
                    >
                      Clear filters
                    </Link>
                  </Button>
                )}
                {facets.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <span className="w-full font-mono text-xs text-muted-foreground">
                      popular right now
                    </span>
                    {facets.tags.slice(0, 6).map((t) => (
                      <Link
                        key={t.slug}
                        href={buildSearchUrl(
                          { ...query, q: "", category: undefined, tags: [] },
                          { tags: [t.slug] },
                        )}
                        className={cn(chip, chipOff, "font-mono text-xs")}
                      >
                        #{t.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} terms={terms} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                hrefFor={(n) => buildSearchUrl(query, { page: n })}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
