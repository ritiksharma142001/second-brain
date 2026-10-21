import { NextResponse } from "next/server";
import { limitByIp, limitOrResponse, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/mail";
import {
  RESET_TOKEN_TTL_MS,
  buildResetUrl,
  createResetToken,
  resetIdentifier,
  siteBaseUrl,
} from "@/lib/password-reset";
import { forgotPasswordSchema } from "@/lib/validations/auth";

/**
 * Starts a password reset. The answer is always the same ("if that account exists, we've sent
 * a link") so this endpoint cannot be used to find out which emails have accounts.
 */
export async function POST(request: Request) {
  const limited = await limitByIp("passwordReset", request);
  if (limited) return limited;

  const body = await parseBody(request, forgotPasswordSchema);
  if ("error" in body) return body.error;
  const { email } = body.data;

  // Also limit per address, so one inbox cannot be flooded from many IPs.
  const limitedEmail = await limitOrResponse("passwordReset", `email:${email}`);
  if (limitedEmail) return limitedEmail;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (user) {
      const { token, hash } = createResetToken();
      const identifier = resetIdentifier(email);

      // Only the newest link works.
      await prisma.$transaction([
        prisma.verificationToken.deleteMany({ where: { identifier } }),
        prisma.verificationToken.create({
          data: {
            identifier,
            token: hash,
            expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
          },
        }),
      ]);

      await sendPasswordResetEmail(
        email,
        buildResetUrl(siteBaseUrl(), token, email),
      );
    }
  } catch (error) {
    // Never tell the caller: a failure here must look the same as success.
    console.error("Password reset request failed:", error);
  }

  // Development only, and identical for every address, so it reveals nothing about accounts.
  const devNote =
    process.env.NODE_ENV !== "production" && !isEmailConfigured()
      ? "Email isn't set up yet, so no email was sent. In development the reset link is printed in the terminal running the server. Add the EMAIL_* settings to .env to send real emails."
      : undefined;

  return NextResponse.json({ ok: true, ...(devNote && { devNote }) });
}
