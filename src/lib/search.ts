import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { tokenize, scorePost, type SearchQuery } from "@/lib/search-query";

export * from "@/lib/search-query";

export const PAGE_SIZE = 9;
/** Relevance ranking scores at most this many matches (newest first), then pages through them. */
const RELEVANCE_WINDOW = 100;

function buildWhere(
  query: SearchQuery,
  terms: string[],
): Prisma.PostWhereInput {
  const and: Prisma.PostWhereInput[] = [];

  if (query.category) and.push({ category: { slug: query.category } });
  // Several tags narrow the results: a post must have all of them.
  for (const slug of query.tags) and.push({ tags: { some: { slug } } });

  // Every keyword must match at least one field.
  for (const term of terms) {
    const contains = { contains: term, mode: "insensitive" as const };
    and.push({
      OR: [
        { title: contains },
        { excerpt: contains },
        // Skip very short words in the body: they mostly match HTML markup.
        ...(term.length >= 3 ? [{ content: contains }] : []),
        { category: { name: contains } },
        { tags: { some: { name: contains } } },
        { author: { name: contains } },
      ],
    });
  }

  return { status: "PUBLISHED", AND: and };
}

const resultSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  readingTime: true,
  views: true,
  category: { select: { name: true, slug: true } },
  author: { select: { name: true, image: true } },
  tags: { select: { name: true, slug: true } },
} satisfies Prisma.PostSelect;

export async function searchPosts(query: SearchQuery) {
  const terms = tokenize(query.q);
  const where = buildWhere(query, terms);
  const total = await db.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  const skip = (page - 1) * PAGE_SIZE;

  if (query.sort === "relevance" && terms.length > 0) {
    const candidates = await db.post.findMany({
      where,
      select: { ...resultSelect, content: true },
      orderBy: { publishedAt: "desc" },
      take: RELEVANCE_WINDOW,
    });
    const ranked = candidates
      .map((post) => ({ post, score: scorePost(post, terms) }))
      .sort((a, b) => b.score - a.score || b.post.views - a.post.views)
      .slice(skip, skip + PAGE_SIZE)
      .map(({ post: { content: _content, ...post } }) => post);
    return { posts: ranked, total, page, totalPages, terms };
  }

  const orderBy: Prisma.PostOrderByWithRelationInput =
    query.sort === "popular"
      ? { views: "desc" }
      : query.sort === "oldest"
        ? { publishedAt: "asc" }
        : { publishedAt: "desc" };

  const posts = await db.post.findMany({
    where,
    select: resultSelect,
    orderBy,
    skip,
    take: PAGE_SIZE,
  });
  return { posts, total, page, totalPages, terms };
}

/** Categories and popular tags (with published-post counts) for the filter sidebar. */
export async function getFacets() {
  const publishedCount = {
    select: { posts: { where: { status: "PUBLISHED" as const } } },
  };

  const [categories, tags] = await Promise.all([
    db.category.findMany({
      select: { name: true, slug: true, _count: publishedCount },
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      where: { posts: { some: { status: "PUBLISHED" } } },
      select: { name: true, slug: true, _count: publishedCount },
      orderBy: { posts: { _count: "desc" } },
      take: 30,
    }),
  ]);

  return {
    categories: categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: c._count.posts,
    })),
    tags: tags.map((t) => ({
      name: t.name,
      slug: t.slug,
      count: t._count.posts,
    })),
  };
}
