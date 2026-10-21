import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { jsonError, limitByIp, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hashToken, resetIdentifier } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validations/auth";

const INVALID_LINK =
  "This reset link is invalid or has expired. Please request a new one.";

/** Sets a new password when given the emailed one-time token. */
export async function POST(request: Request) {
  const limited = await limitByIp("passwordReset", request);
  if (limited) return limited;

  const body = await parseBody(request, resetPasswordSchema);
  if ("error" in body) return body.error;
  const { email, token, password } = body.data;

  try {
    const identifier = resetIdentifier(email);
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: hashToken(token),
        expires: { gt: new Date() },
      },
      select: { token: true },
    });
    const user = record
      ? await prisma.user.findUnique({ where: { email }, select: { id: true } })
      : null;

    // Same message whether the token, the email or the expiry was wrong.
    if (!record || !user) return jsonError(INVALID_LINK, 400);

    // Change the password and burn every outstanding link in one step.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: await hash(password, 12) },
      }),
      prisma.verificationToken.deleteMany({ where: { identifier } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset failed:", error);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
