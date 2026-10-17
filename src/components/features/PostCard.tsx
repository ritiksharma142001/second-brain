import Link from "next/link";
import { Clock, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Highlight } from "@/components/features/search/Highlight";

export interface PostCardData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  readingTime: number;
  views: number;
  category: { name: string } | null;
  author: { name: string | null; image: string | null };
  tags?: { name: string; slug: string }[];
}

/** Deterministic hue (0-359) from a string, so each post gets its own cover colour. */
export function hueFor(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 360;
  return hash;
}

export function PostCard({
  post,
  featured = false,
  terms = [],
}: {
  post: PostCardData;
  featured?: boolean;
  /** Search words to highlight in the title and excerpt. */
  terms?: string[];
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border bg-card/90 shadow-[3px_3px_0_0_var(--shadow-ink)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--shadow-ink)]",
        featured && "md:col-span-2 md:flex-row"
      )}
    >
      <div
        className={cn(
          "relative aspect-video shrink-0 overflow-hidden border-b",
          featured ? "md:aspect-auto md:w-1/2 md:border-b-0 md:border-r" : ""
        )}
      >
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="cover-fallback flex h-full w-full items-center justify-center"
            style={{ "--h": hueFor(post.title) } as React.CSSProperties}
            aria-hidden
          >
            <span className="font-display text-7xl font-bold text-foreground/25 transition-transform duration-500 group-hover:scale-110">
              {post.title.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {post.category && (
          <span className="sticker absolute left-3 top-3">{post.category.name}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className={cn(
            "line-clamp-2 font-bold leading-tight transition-colors group-hover:text-highlight",
            featured ? "text-2xl md:text-3xl" : "text-xl"
          )}
        >
          <Highlight text={post.title} terms={terms} />
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            <Highlight text={post.excerpt} terms={terms} />
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-highlight">
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag.slug}>#{tag.name}</span>
            ))}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 font-mono text-xs text-muted-foreground">
          {post.author.name && <span className="text-foreground">{post.author.name}</span>}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.views}
          </span>
        </div>
      </div>
    </Link>
  );
}
