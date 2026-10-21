import nodemailer from "nodemailer";

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

export function isEmailConfigured(): boolean {
  return !!(
    process.env.EMAIL_SERVER_HOST &&
    process.env.EMAIL_SERVER_USER &&
    process.env.EMAIL_SERVER_PASSWORD
  );
}

function createTransport() {
  const host = process.env.EMAIL_SERVER_HOST;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.EMAIL_SERVER_PORT || 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Sends the password-reset email. Works with any SMTP service (Resend, Gmail, SendGrid...).
 *
 * With no email settings, development prints the link in the server console so the flow can be
 * tested; production throws so the problem is logged instead of silently dropping the email.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<"sent" | "logged"> {
  const transport = createTransport();

  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Email is not configured (set EMAIL_SERVER_HOST, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD).",
      );
    }
    console.log(
      `\n[auth] Password reset link for ${to} (email is not configured, so it is shown here):\n${resetUrl}\n`,
    );
    return "logged";
  }

  const safeUrl = escapeHtml(resetUrl);
  await transport.sendMail({
    from: process.env.EMAIL_FROM || "Second Brain <noreply@localhost>",
    to,
    subject: "Reset your Second Brain password",
    text:
      `Someone asked to reset the password for your Second Brain account.\n\n` +
      `Choose a new password here (the link works for 1 hour):\n${resetUrl}\n\n` +
      `If you didn't ask for this, you can ignore this email. Your password won't change.`,
    html:
      `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#2b2118">` +
      `<h2 style="margin:0 0 12px">Reset your password</h2>` +
      `<p>Someone asked to reset the password for your Second Brain account.</p>` +
      `<p><a href="${safeUrl}" style="display:inline-block;background:#2b2118;color:#faf3e6;padding:10px 18px;border-radius:8px;text-decoration:none">Choose a new password</a></p>` +
      `<p style="font-size:13px;color:#6b5d4f">The link works for 1 hour. If the button doesn't work, paste this into your browser:<br>${safeUrl}</p>` +
      `<p style="font-size:13px;color:#6b5d4f">If you didn't ask for this, ignore this email. Your password won't change.</p></div>`,
  });
  return "sent";
}
