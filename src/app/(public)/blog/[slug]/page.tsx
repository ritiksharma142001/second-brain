import { db } from "@/lib/db";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { after } from "next/server";
import { siteConfig } from "@/config/site";
import { sanitizeHTML } from "@/lib/security";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { CommentThread } from "@/components/features/comments/CommentThread";
import { BookmarkButton } from "@/components/features/BookmarkButton";
import { ShareButtons } from "@/components/features/ShareButtons";
import { RelatedPosts } from "@/components/features/RelatedPosts";

interface Props {
  params: Promise<{ slug: string }>;
}

// Cached per request so generateMetadata and the page share one query.
const getPost = cache(async (slug: string) => {
  const post = await db.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: true,
      category: true,
      tags: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return post;
});

/**
 * Related posts, ranked by relevance: same category counts most, then shared tags.
 * If fewer than `limit` posts are related, the list is topped up with the newest posts
 * so the section is never empty or near-empty.
 */
async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  tagIds: string[],
  limit: number = 3,
) {
  const include = {
    category: { select: { name: true } },
    author: { select: { name: true, image: true } },
  } satisfies Prisma.PostInclude;
  const base: Prisma.PostWhereInput = {
    id: { not: postId },
    status: "PUBLISHED",
  };

  const related: Prisma.PostWhereInput[] = [];
  if (categoryId) related.push({ categoryId });
  if (tagIds.length > 0)
    related.push({ tags: { some: { id: { in: tagIds } } } });

  const candidates =
    related.length > 0
      ? await db.post.findMany({
          where: { ...base, OR: related },
          include: { ...include, tags: { select: { id: true } } },
          orderBy: { publishedAt: "desc" },
          take: 20,
        })
      : [];

  const score = (post: (typeof candidates)[number]) =>
    (post.categoryId && post.categoryId === categoryId ? 3 : 0) +
    post.tags.filter((tag) => tagIds.includes(tag.id)).length;

  const ranked = candidates
    .sort((x, y) => score(y) - score(x) || y.views - x.views)
    .slice(0, limit)
    .map(({ tags: _tags, ...post }) => post);

  if (ranked.length >= limit) return ranked;

  const filler = await db.post.findMany({
    where: { ...base, id: { notIn: [postId, ...ranked.map((p) => p.id)] } },
    include,
    orderBy: { publishedAt: "desc" },
    take: limit - ranked.length,
  });
  return [...ranked, ...filler];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name || ""],
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const [session, relatedPosts] = await Promise.all([
    getServerSession(),
    getRelatedPosts(
      post.id,
      post.categoryId,
      post.tags.map((tag) => tag.id),
    ),
  ]);

  // After the response is sent: count the view and, for signed-in readers, record reading history.
  after(async () => {
    try {
      await db.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
      if (session?.user?.id) {
        await db.viewHistory.upsert({
          where: {
            userId_postId: { userId: session.user.id, postId: post.id },
          },
          update: { viewedAt: new Date() },
          create: { userId: session.user.id, postId: post.id },
        });
      }
    } catch (error) {
      console.error("Failed to record view:", error);
    }
  });

  return (
    <>
      <article className="container max-w-3xl py-12 sm:py-16">
        <div className="read-progress" aria-hidden />

        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> all posts
        </Link>

        {/* Header */}
        <header className="mb-10">
          {post.category && (
            <Link
              href={`/category/${post.category.slug}`}
              className="sticker mb-5 hover:bg-accent"
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-5 text-xl leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-y py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border-[1.5px] border-[color:var(--shadow-ink)] bg-muted">
                {post.author.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author.image}
                    alt={post.author.name || ""}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <span className="font-medium text-foreground">
                {post.author.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Calendar className="h-3.5 w-3.5" />
              {post.publishedAt && formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min read
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Eye className="h-3.5 w-3.5" />
              {post.views} views
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {post.coverImage && (
          <div className="mb-10 aspect-video overflow-hidden rounded-xl border-[1.5px] shadow-[4px_4px_0_0_var(--shadow-ink)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="sticker hover:bg-accent"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Share & Bookmark */}
        <div className="mt-10 flex items-center gap-4 border-b pb-8">
          <BookmarkButton postId={post.id} />
          <ShareButtons
            url={`${siteConfig.url}/blog/${post.slug}`}
            title={post.title}
          />
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentThread
            postId={post.id}
            postAuthorId={post.authorId}
            currentUserId={session?.user?.id}
            isAdmin={session?.user?.role === "ADMIN"}
          />
        </div>
      </article>

      {/* Outside the narrow reading column so the cards have room */}
      <RelatedPosts posts={relatedPosts} />
    </>
  );
}
