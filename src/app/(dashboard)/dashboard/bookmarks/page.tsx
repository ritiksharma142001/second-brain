import Link from "next/link";
import { Bookmark, Clock } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LibraryRow } from "@/components/features/dashboard/LibraryRow";
import { RemoveBookmarkButton } from "@/components/features/dashboard/LibraryButtons";

export const metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  // Only published posts: a bookmarked post that was unpublished or deleted would otherwise be a dead link.
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id, post: { status: "PUBLISHED" } },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          readingTime: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookmarks</h2>
        <p className="mt-1 text-muted-foreground">
          Posts you&apos;ve saved for later{bookmarks.length > 0 && ` · ${bookmarks.length}`}
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="window">
          <div className="window-bar">
            <span className="dot" /><span className="dot" /><span className="dot" />
            <span className="ml-2">bookmarks.md</span>
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <Bookmark className="h-10 w-10 text-highlight" />
            <div>
              <p className="text-lg font-bold">Nothing saved yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap Bookmark on any post to keep it here for later.
              </p>
            </div>
            <Button asChild>
              <Link href="/blog">Browse posts</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map(({ id, createdAt, post }) => (
            <LibraryRow
              key={id}
              post={post}
              action={<RemoveBookmarkButton postId={post.id} />}
              meta={
                <>
                  <span>saved {formatDate(createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingTime} min read
                  </span>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
