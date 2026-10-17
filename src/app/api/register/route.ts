import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { limitByIp } from "@/lib/api";

export async function POST(req: Request) {
  const limited = await limitByIp("register", req);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  await db.user.create({
    data: { name, email, password: await hash(password, 12) },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
