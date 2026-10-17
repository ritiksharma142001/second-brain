/**
 * Browser-safe search helpers (no database imports) so client components can use them.
 * The database side lives in ./search.
 */

const MAX_TERMS = 6;
const MAX_TAG_FILTERS = 5;

export const SORTS = {
  relevance: "Best match",
  newest: "Newest",
  popular: "Most viewed",
  oldest: "Oldest",
} as const;
export type SortKey = keyof typeof SORTS;

export interface SearchQuery {
  q: string;
  category?: string;
  tags: string[];
  sort: SortKey;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;
const list = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v : v ? [v] : [];
const slugLike = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Turns untrusted URL params into a clean, bounded query. */
export function parseSearchParams(raw: RawParams): SearchQuery {
  const q = (first(raw.q) ?? "").trim().slice(0, 100);
  const category = first(raw.category);
  const tags = [
    ...new Set(list(raw.tag).filter((t) => slugLike.test(t))),
  ].slice(0, MAX_TAG_FILTERS);
  const sortParam = first(raw.sort) as SortKey | undefined;
  const sort: SortKey =
    sortParam && sortParam in SORTS ? sortParam : q ? "relevance" : "newest";
  const page = Math.max(
    1,
    Math.min(500, parseInt(first(raw.page) ?? "1", 10) || 1),
  );

  return {
    q,
    category: category && slugLike.test(category) ? category : undefined,
    tags,
    // "relevance" only makes sense with a keyword
    sort: sort === "relevance" && !q ? "newest" : sort,
    page,
  };
}

/** Lower-cased unique words of the query. Every word has to match somewhere. */
export function tokenize(q: string): string[] {
  return [
    ...new Set(
      q
        .toLowerCase()
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2),
    ),
  ].slice(0, MAX_TERMS);
}

/** Builds a /search URL from a query, applying overrides (and dropping defaults). */
export function buildSearchUrl(
  query: SearchQuery,
  overrides: Partial<SearchQuery> = {},
): string {
  const next = { ...query, ...overrides };
  // Changing any filter should send you back to page 1 unless a page is given explicitly.
  if (!("page" in overrides)) next.page = 1;

  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  next.tags.forEach((t) => params.append("tag", t));
  const defaultSort: SortKey = next.q ? "relevance" : "newest";
  if (next.sort !== defaultSort) params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

interface Scorable {
  title: string;
  excerpt: string | null;
  content?: string;
  category: { name: string } | null;
  tags: { name: string }[];
}

/** Higher = better match. Title and tags outweigh the body text. */
export function scorePost(post: Scorable, terms: string[]): number {
  const title = post.title.toLowerCase();
  const excerpt = (post.excerpt ?? "").toLowerCase();
  const content = (post.content ?? "").toLowerCase();
  const category = (post.category?.name ?? "").toLowerCase();
  const tags = post.tags.map((t) => t.name.toLowerCase());

  return terms.reduce((score, term) => {
    if (title.includes(term)) score += title === term ? 12 : 6;
    if (tags.some((t) => t === term)) score += 5;
    else if (tags.some((t) => t.includes(term))) score += 3;
    if (category.includes(term)) score += 3;
    if (excerpt.includes(term)) score += 2;
    if (content.includes(term)) score += 1;
    return score;
  }, 0);
}
