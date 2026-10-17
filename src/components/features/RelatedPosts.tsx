import { PostCard, type PostCardData } from "@/components/features/PostCard";

interface RelatedPostsProps {
  posts: PostCardData[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="container pb-8 pt-4">
      <div className="mb-8 border-t pt-12">
        <p className="eyebrow mb-2">{"// keep reading"}</p>
        <h2 id="related-heading" className="text-2xl font-bold sm:text-3xl">
          You might also like
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
