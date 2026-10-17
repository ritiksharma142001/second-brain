import { db } from "@/lib/db";
import Link from "next/link";
import { Plane, Search } from "lucide-react";
import { PostCard } from "@/components/features/PostCard";
import { Pagination } from "@/components/features/search/Pagination";
import { getFacets } from "@/lib/search";

export const metadata = {
  title: "Blog",
  description: "Read our latest articles and insights",
};

// Page 1 holds 8 posts (one featured card spans two grid cells, so the grid fills 3 rows);
// later pages hold 9.
const FIRST_PAGE_SIZE = 8;
const PAGE_SIZE = 9;

async function getPosts(requestedPage: number) {
  const where = { status: "PUBLISHED" as const };
  const total = await db.post.count({ where });
  const totalPages =
    total <= FIRST_PAGE_SIZE
      ? 1
      : 1 + Math.ceil((total - FIRST_PAGE_SIZE) / PAGE_SIZE);
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  const posts = await db.post.findMany({
    where,
    include: {
      author: { select: { name: true, image: true } },
      category: { select: { name: true } },
      tags: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
    skip: page === 1 ? 0 : FIRST_PAGE_SIZE + (page - 2) * PAGE_SIZE,
    take: page === 1 ? FIRST_PAGE_SIZE : PAGE_SIZE,
  });

  return { posts, total, page, totalPages };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = parseInt((await searchParams).page ?? "1", 10) || 1;
  const [{ posts, total, page, totalPages }, { categories }] =
    await Promise.all([getPosts(requestedPage), getFacets()]);
  // Travel first: it's a headline section of the site.
  const browse = [...categories]
    .filter((c) => c.count > 0 || c.slug === "travel")
    .sort((a, b) => Number(b.slug === "travel") - Number(a.slug === "travel"));

  return (
    <div className="container py-16">
      <header className="mb-12 max-w-2xl">
        <p className="eyebrow rise mb-3">{"// the notebook"}</p>
        <h1
          className="rise text-4xl font-bold sm:text-6xl"
          style={{ "--d": 1 } as React.CSSProperties}
        >
          All <span className="marker">posts</span>
        </h1>
        <p
          className="rise mt-4 text-lg text-muted-foreground"
          style={{ "--d": 2 } as React.CSSProperties}
        >
          Ideas, tutorials and stories.{" "}
          {total > 0 &&
            `${total} ${total === 1 ? "entry" : "entries"} and counting.`}
        </p>

        <form
          action="/search"
          role="search"
          className="rise relative mt-6 max-w-md"
          style={{ "--d": 3 } as React.CSSProperties}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search posts, places, tags..."
            aria-label="Search posts"
            className="h-11 w-full rounded-md border border-input bg-card/90 pl-10 pr-3 text-sm shadow-[2px_2px_0_0_var(--border)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </form>

        {browse.length > 0 && (
          <div
            className="rise mt-4 flex flex-wrap items-center gap-2"
            style={{ "--d": 4 } as React.CSSProperties}
          >
            <span className="mr-1 font-mono text-xs text-muted-foreground">
              browse
            </span>
            {browse.map((c) => (
              <Link
                key={c.slug}
                href={`/search?category=${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1 text-sm transition-colors hover:bg-accent"
              >
                {c.slug === "travel" && <Plane className="h-3.5 w-3.5" />}
                {c.name}
                <span className="font-mono text-xs opacity-70">{c.count}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {posts.length === 0 ? (
        <div className="window mx-auto max-w-lg">
          <div className="window-bar">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="ml-2">empty.md</span>
          </div>
          <div className="p-10 text-center">
            <p className="font-mono text-sm text-muted-foreground caret">
              No posts yet. Check back soon
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              featured={
                page === 1 &&
                index === 0 &&
                posts.length > 2 &&
                (posts.length + 1) % 3 === 0
              }
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefFor={(n) => (n > 1 ? `/blog?page=${n}` : "/blog")}
      />
    </div>
  );
}
