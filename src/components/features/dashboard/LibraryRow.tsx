import Link from "next/link";
import { cn } from "@/lib/utils";
import { hueFor } from "@/components/features/PostCard";

interface LibraryRowProps {
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    category: { name: string } | null;
  };
  /** Small mono line under the title, e.g. date and reading time. */
  meta: React.ReactNode;
  /** Right-hand action (a client button). */
  action: React.ReactNode;
}

/** One post in the dashboard's Bookmarks / History lists. */
export function LibraryRow({ post, meta, action }: LibraryRowProps) {
  return (
    <div className="flex gap-4 rounded-xl border bg-card/90 p-3 shadow-[3px_3px_0_0_var(--shadow-ink)] backdrop-blur-sm transition-transform hover:-translate-y-0.5 sm:p-4">
      <Link
        href={`/blog/${post.slug}`}
        className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border sm:h-24 sm:w-36"
        tabIndex={-1}
        aria-hidden
      >
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div
            className="cover-fallback flex h-full w-full items-center justify-center"
            style={{ "--h": hueFor(post.title) } as React.CSSProperties}
          >
            <span className="font-display text-4xl font-bold text-foreground/25">
              {post.title.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {post.category && <span className="sticker mb-1.5">{post.category.name}</span>}
            <Link href={`/blog/${post.slug}`} className="group block">
              <h3 className="line-clamp-2 text-lg font-bold leading-tight transition-colors group-hover:text-highlight">
                {post.title}
              </h3>
            </Link>
          </div>
          <div className="shrink-0">{action}</div>
        </div>
        {post.excerpt && (
          <p className="mt-1.5 line-clamp-2 hidden text-sm text-muted-foreground sm:block">{post.excerpt}</p>
        )}
        <div className={cn("mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 font-mono text-xs text-muted-foreground")}>
          {meta}
        </div>
      </div>
    </div>
  );
}
