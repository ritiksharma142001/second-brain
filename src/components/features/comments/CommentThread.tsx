"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { countComments, type CommentData } from "@/lib/comments";
import { Comment } from "./Comment";
import { CommentForm } from "./CommentForm";

interface CommentThreadProps {
  postId: string;
  postAuthorId: string;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function CommentThread({ postId, postAuthorId, currentUserId, isAdmin }: CommentThreadProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      setComments(await response.json());
      setError("");
    } catch {
      setError("We couldn't load the comments.");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const total = countComments(comments);

  return (
    <section aria-labelledby="comments-heading" className="space-y-8">
      <div>
        <p className="eyebrow mb-2">{"// the discussion"}</p>
        <h2 id="comments-heading" className="text-2xl font-bold">
          Comments{!isLoading && !error && <span className="ml-2 font-mono text-lg text-muted-foreground">{total}</span>}
        </h2>
      </div>

      {currentUserId ? (
        <CommentForm postId={postId} onCommentAdded={fetchComments} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card/80 p-4 shadow-[3px_3px_0_0_var(--shadow-ink)]">
          <p className="text-sm text-muted-foreground">Sign in to join the conversation.</p>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/auth/signin">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup">Create account</Link>
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
          <Button size="sm" variant="outline" onClick={fetchComments}>
            Try again
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center">
          <MessagesSquare className="h-8 w-8 text-highlight" />
          <p className="font-medium">No comments yet</p>
          <p className="text-sm text-muted-foreground">Be the first to share what you think.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onCommentAdded={fetchComments}
              onCommentDeleted={fetchComments}
            />
          ))}
        </div>
      )}
    </section>
  );
}
