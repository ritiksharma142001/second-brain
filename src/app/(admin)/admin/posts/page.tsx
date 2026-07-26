import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

async function getPosts() {
  const posts = await db.post.findMany({
    include: {
      author: true,
      category: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return posts;
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
          <p className="text-muted-foreground">
            Manage your blog posts
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No posts yet. Create your first post!
              </p>
            ) : (
              <div className="divide-y">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-4">
                    <div className="flex-1">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {post.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{post.status.toLowerCase()}</span>
                        {post.category && (
                          <span>{post.category.name}</span>
                        )}
                        <span>{post.views} views</span>
                        <span>{post._count.comments} comments</span>
                        {post.createdAt && (
                          <span>{formatDate(post.createdAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.slug}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
