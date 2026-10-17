import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit, type LimitName } from "@/lib/rate-limit";

export function jsonError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export const unauthorized = () => jsonError("Unauthorized", 401);
export const forbidden = () => jsonError("Forbidden", 403);
export const notFound = (what = "Not found") => jsonError(what, 404);

/** Parses a JSON request body with a zod schema. */
export async function parseBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S
): Promise<{ data: z.infer<S> } | { error: NextResponse }> {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { error: jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400) };
  }
  return { data: parsed.data };
}

/** Returns a 429 response when `key` is over the limit, otherwise null. */
export async function limitOrResponse(
  name: LimitName,
  key: string
): Promise<NextResponse | null> {
  const result = await rateLimit(name, key);
  if (result.ok) return null;
  return jsonError("Too many requests. Please try again later.", 429, {
    "Retry-After": String(result.retryAfter),
  });
}

export const limitByIp = (name: LimitName, request: Request) =>
  limitOrResponse(name, getClientIp(request.headers));

/** Handles Prisma "record not found" / "unique constraint" errors uniformly. */
export function prismaErrorResponse(error: unknown): NextResponse | null {
  const code = (error as { code?: string })?.code;
  if (code === "P2025") return notFound();
  if (code === "P2002") return jsonError("Already exists", 409);
  return null;
}
