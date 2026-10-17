import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 characters").optional(),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters").optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

/**
 * Validates required environment variables. Throws in production so a
 * misconfigured deploy fails fast instead of failing on the first request.
 */
export function validateEnv() {
  const parsed = schema.safeParse(process.env);
  const problems = parsed.success
    ? []
    : parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);

  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    problems.push("AUTH_SECRET (or NEXTAUTH_SECRET) is required");
  }

  if (problems.length > 0) {
    const message = `Invalid environment configuration:\n - ${problems.join("\n - ")}`;
    if (process.env.NODE_ENV === "production") throw new Error(message);
    console.warn(message);
  }
}
