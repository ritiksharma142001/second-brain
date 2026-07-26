import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Clock, Eye, Calendar } from "lucide-react";
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

async function getPost(slug: string) {
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

  if (!post) return null;

  // Increment views
  await db.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  return post;
}

async function getRelatedPosts(postId: string, categoryId: string | null, limit: number = 3) {
  const where: any = {
    id: { not: postId },
    status: "PUBLISHED",
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const relatedPosts = await db.post.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      views: "desc",
    },
    take: limit,
  });

  return relatedPosts;
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

  const session = await getServerSession();
  const relatedPosts = await getRelatedPosts(post.id, post.categoryId);

  return (
    <article className="container mx-auto max-w-4xl px-4 py-16">
      {/* Hero Image */}
      {post.coverImage && (
        <div className="mb-8 aspect-video overflow-hidden rounded-2xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {post.category && (
          <span className="mb-4 inline-block text-sm font-medium text-primary">
            {post.category.name}
          </span>
        )}
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-xl text-muted-foreground">{post.excerpt}</p>
        )}

        {/* Metadata */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
              {post.author.image && (
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
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {post.publishedAt && formatDate(post.publishedAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.readingTime} min read
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.views} views
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-muted px-3 py-1 text-sm"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Share & Bookmark */}
      <div className="mt-8 flex items-center gap-4 pb-8 border-b">
        <BookmarkButton postId={post.id} />
        <ShareButtons
          url={`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/blog/${post.slug}`}
          title={post.title}
        />
      </div>

      {/* Comments Section */}
      <div className="mt-16 border-t pt-8">
        <CommentThread
          postId={post.id}
          currentUserId={session?.user?.id}
          isAdmin={session?.user?.role === "ADMIN"}
        />
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <RelatedPosts posts={relatedPosts} />
      )}
    </article>
  );
}
