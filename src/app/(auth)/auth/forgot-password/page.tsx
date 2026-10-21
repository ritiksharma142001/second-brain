"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devNote, setDevNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDevNote(data.devNote ?? "");
      setSentTo(email.trim());
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-10">
      <Card className="mx-auto w-full max-w-md">
        {sentTo ? (
          <>
            <CardHeader className="text-center">
              <MailCheck className="mx-auto mb-2 h-10 w-10 text-highlight" />
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                If an account exists for{" "}
                <span className="font-medium text-foreground">{sentTo}</span>,
                we&apos;ve sent a link to reset the password. It works for 1
                hour.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
              {devNote && (
                <p
                  role="note"
                  className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-left text-amber-800 dark:text-amber-300"
                >
                  <span className="font-medium">Development note: </span>
                  {devNote}
                </p>
              )}
              <p>
                Nothing there? Check your spam folder, or try again with another
                address.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSentTo(null)}
              >
                Use a different email
              </Button>
              <Link
                href="/auth/signin"
                className="block font-medium text-foreground underline"
              >
                Back to sign in
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Forgot your password?</CardTitle>
              <CardDescription>
                Enter your email and we&apos;ll send you a link to choose a new
                one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-foreground underline"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
