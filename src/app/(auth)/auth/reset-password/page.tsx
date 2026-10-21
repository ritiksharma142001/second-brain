"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkProblem, setLinkProblem] = useState(!token || !email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");

    setIsLoading(true);
    try {
      const response = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // A bad or expired link can't be fixed by retyping: send them to ask for a new one.
        if (response.status === 400 && /link/i.test(data.error ?? ""))
          setLinkProblem(true);
        else setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/auth/signin?reset=1");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (linkProblem) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto mb-2 h-10 w-10 text-highlight" />
          <CardTitle className="text-2xl">
            This link doesn&apos;t work
          </CardTitle>
          <CardDescription>
            Reset links expire after 1 hour and can only be used once. Request a
            fresh one and try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">Request a new link</Link>
          </Button>
          <Link
            href="/auth/signin"
            className="block text-center text-sm font-medium underline"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
        <CardDescription>
          for <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoFocus
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save new password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full px-4 py-10">
      <Suspense
        fallback={
          <div className="mx-auto h-64 w-full max-w-md rounded-xl border bg-card/60" />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
