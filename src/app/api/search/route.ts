import { NextRequest, NextResponse } from "next/server";
import { jsonError, limitByIp } from "@/lib/api";
import { parseSearchParams, searchPosts } from "@/lib/search";

export async function GET(request: NextRequest) {
  const limited = await limitByIp("search", request);
  if (limited) return limited;

  try {
    const raw: Record<string, string | string[]> = {};
    for (const key of new Set(request.nextUrl.searchParams.keys())) {
      const values = request.nextUrl.searchParams.getAll(key);
      raw[key] = values.length > 1 ? values : values[0];
    }

    const { posts, total, page, totalPages } = await searchPosts(parseSearchParams(raw));
    return NextResponse.json({ posts, total, page, totalPages });
  } catch (error) {
    console.error("Search error:", error);
    return jsonError("Failed to search posts", 500);
  }
}
