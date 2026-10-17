import { describe, expect, it } from "vitest";
import {
  buildSearchUrl,
  parseSearchParams,
  scorePost,
  tokenize,
} from "./search-query";

describe("parseSearchParams", () => {
  it("defaults to newest without a keyword and best match with one", () => {
    expect(parseSearchParams({}).sort).toBe("newest");
    expect(parseSearchParams({ q: "kyoto" }).sort).toBe("relevance");
  });

  it("ignores relevance sorting when there is no keyword", () => {
    expect(parseSearchParams({ sort: "relevance" }).sort).toBe("newest");
  });

  it("drops invalid slugs, unknown sorts and bad pages", () => {
    const q = parseSearchParams({
      category: "Bad Slug!",
      tag: ["ok-tag", "no way", "ok-tag"],
      sort: "evil",
      page: "-4",
    });
    expect(q.category).toBeUndefined();
    expect(q.tags).toEqual(["ok-tag"]);
    expect(q.sort).toBe("newest");
    expect(q.page).toBe(1);
  });

  it("trims and bounds the keyword", () => {
    expect(parseSearchParams({ q: `  ${"a".repeat(300)}  ` }).q).toHaveLength(
      100,
    );
  });
});

describe("tokenize", () => {
  it("splits on spaces/commas, lower-cases, de-duplicates and drops 1-letter words", () => {
    expect(tokenize("Kyoto, kyoto  FOOD a")).toEqual(["kyoto", "food"]);
  });
});

describe("buildSearchUrl", () => {
  const base = parseSearchParams({
    q: "bali",
    category: "travel",
    tag: "beach",
  });

  it("round-trips filters", () => {
    expect(buildSearchUrl(base)).toBe(
      "/search?q=bali&category=travel&tag=beach",
    );
  });

  it("resets to page 1 when a filter changes, but not for an explicit page", () => {
    const paged = { ...base, page: 3 };
    expect(buildSearchUrl(paged, { category: undefined })).not.toContain(
      "page=",
    );
    expect(buildSearchUrl(paged, { page: 4 })).toContain("page=4");
  });

  it("omits default values", () => {
    expect(buildSearchUrl(parseSearchParams({}))).toBe("/search");
    expect(buildSearchUrl(base, { sort: "popular" })).toContain("sort=popular");
  });
});

describe("scorePost", () => {
  const post = {
    title: "Street food in Kyoto",
    excerpt: "Where to eat",
    content: "<p>Kyoto has great food.</p>",
    category: { name: "Travel" },
    tags: [{ name: "japan" }, { name: "kyoto" }],
  };

  it("ranks title and tag matches above body-only matches", () => {
    const body = {
      ...post,
      title: "Notes",
      tags: [],
      category: null,
      excerpt: null,
    };
    expect(scorePost(post, ["kyoto"])).toBeGreaterThan(
      scorePost(body, ["kyoto"]),
    );
  });

  it("adds up across keywords and scores zero for no match", () => {
    expect(scorePost(post, ["kyoto", "food"])).toBeGreaterThan(
      scorePost(post, ["kyoto"]),
    );
    expect(scorePost(post, ["zzz"])).toBe(0);
  });
});
