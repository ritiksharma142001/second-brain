import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Clock, Eye } from "lucide-react";

export const metadata = {
  title: "Blog",
  description: "Read our latest articles and insights",
};

async function getPosts() {
  const posts = await db.post.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      category: true,
      tags: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 20,
  });

  return posts;
}

export default async function BlogPage() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="mt-4 text-muted-foreground">No posts yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Insights, tutorials, and stories from our team
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              {post.coverImage && (
                <div className="aspect-video overflow-hidden rounded-t-xl">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                {post.category && (
                  <span className="text-sm font-medium text-primary">
                    {post.category.name}
                  </span>
                )}
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readingTime} min read
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views} views
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {post.publishedAt && formatDate(post.publishedAt)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
