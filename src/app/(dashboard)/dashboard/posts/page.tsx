import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeletePostButton } from "@/components/features/DeletePostButton";

export default async function MyPostsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  const posts = await db.post.findMany({
    where: { authorId: session.user.id },
    include: { _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Posts</h2>
          <p className="text-muted-foreground">Write, publish and manage your articles</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Write a post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              You haven&apos;t written anything yet. Start your first post!
            </p>
          ) : (
            <div className="divide-y">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/posts/${post.id}/edit`}
                      className="block truncate font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="capitalize">{post.status.toLowerCase()}</span>
                      <span>{post.views} views</span>
                      <span>{post._count.comments} comments</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {post.status === "PUBLISHED" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.slug}`}>View</Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/posts/${post.id}/edit`}>Edit</Link>
                    </Button>
                    <DeletePostButton id={post.id} title={post.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
