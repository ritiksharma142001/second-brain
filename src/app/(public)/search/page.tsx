"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, MessageCircle } from "lucide-react";
import { SearchBar } from "@/components/features/search/SearchBar";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  readingTime: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  _count: {
    comments: number;
  };
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("category", category);
        if (tag) params.set("tag", tag);

        const response = await fetch(`/api/search?${params}`);
        if (!response.ok) throw new Error("Search failed");
        
        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        setError("Failed to search posts");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query, category, tag]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-muted-foreground">
        Found {posts.length} {posts.length === 1 ? "result" : "results"}
        {query && ` for "${query}"`}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No posts found. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block space-y-3"
            >
              {post.coverImage && (
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}

              <div className="space-y-2">
                {post.categories.length > 0 && (
                  <Badge variant="outline">
                    {post.categories[0].category.name}
                  </Badge>
                )}

                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.publishedAt && formatDate(new Date(post.publishedAt))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {post._count.comments}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Search</h1>
      
      <div className="mb-8">
        <SearchBar />
      </div>

      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
