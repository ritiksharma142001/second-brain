"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 2000;

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentForm({
  postId,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder = "Share your thoughts...",
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const text = content.trim();
    if (!text) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, parentId }),
      });

      if (!response.ok) {
        // Show the server's reason (too long, rate limited, session expired...).
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed to post comment. Please try again.");
        return;
      }

      setContent("");
      onCommentAdded();
      onCancel?.();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-3"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        maxLength={MAX_LENGTH}
        autoFocus={autoFocus}
        aria-label={parentId ? "Write a reply" : "Write a comment"}
        className="resize-none bg-background/60"
      />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Posting..." : parentId ? "Reply" : "Post comment"}
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        {content.length > MAX_LENGTH - 200 && (
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {content.length}/{MAX_LENGTH}
          </span>
        )}
      </div>
    </form>
  );
}
