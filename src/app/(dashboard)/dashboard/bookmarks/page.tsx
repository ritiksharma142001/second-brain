import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

export default async function BookmarksPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return null;
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bookmarks</h2>
        <p className="text-muted-foreground">
          Posts you've saved for later ({bookmarks.length})
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-lg text-muted-foreground">
            No bookmarks yet. Start saving posts you want to read later!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {bookmark.post.coverImage && (
                <Link
                  href={`/blog/${bookmark.post.slug}`}
                  className="shrink-0"
                >
                  <div className="w-32 h-24 rounded-lg overflow-hidden">
                    <img
                      src={bookmark.post.coverImage}
                      alt={bookmark.post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <Link
                    href={`/blog/${bookmark.post.slug}`}
                    className="group"
                  >
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {bookmark.post.title}
                    </h3>
                  </Link>
                </div>

                {bookmark.post.excerpt && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {bookmark.post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {bookmark.post.category && (
                    <Badge variant="outline" className="text-xs">
                      {bookmark.post.category.name}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {bookmark.post.publishedAt &&
                      formatDate(bookmark.post.publishedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {bookmark.post.readingTime} min
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
