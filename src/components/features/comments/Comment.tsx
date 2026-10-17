"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Reply, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MAX_COMMENT_DEPTH, type CommentData } from "@/lib/comments";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/hooks/use-toast";
import { CommentForm } from "./CommentForm";
import { PixelStar } from "./PixelStar";

interface CommentProps {
  comment: CommentData;
  postId: string;
  /** Used to mark the post's author in the thread. */
  postAuthorId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
  depth?: number;
}

const getInitials = (name: string | null) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

export function Comment({
  comment,
  postId,
  postAuthorId,
  currentUserId,
  isAdmin,
  onCommentAdded,
  onCommentDeleted,
  depth = 0,
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.likedByMe);
  const [likeCount, setLikeCount] = useState(comment._count.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm, dialog } = useConfirm();

  const canDelete = !!currentUserId && (currentUserId === comment.author.id || isAdmin);
  const canReply = !!currentUserId && depth < MAX_COMMENT_DEPTH;
  const isPostAuthor = comment.author.id === postAuthorId;

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;

    // Optimistic update, then reconcile with the server's exact count.
    const wasLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!wasLiked);
    setLikeCount(previousCount + (wasLiked ? -1 : 1));
    setIsLiking(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: wasLiked ? "DELETE" : "POST",
      });
      if (!response.ok) throw new Error("like failed");
      const data = await response.json();
      setIsLiked(data.liked);
      setLikeCount(data.likes);
    } catch {
      setIsLiked(wasLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    const hasReplies = (comment.replies?.length ?? 0) > 0;
    const confirmed = await confirm({
      title: hasReplies ? "Delete this comment and its replies?" : "Delete this comment?",
      description: hasReplies
        ? "Every reply under it will be removed too. This can't be undone."
        : "This can't be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      if (response.ok) {
        onCommentDeleted();
      } else {
        toast({ title: "Couldn't delete the comment", description: "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Check your connection and try again.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3">
      {dialog}
      <Avatar className="h-9 w-9 shrink-0 border-[1.5px] border-[color:var(--shadow-ink)]">
        <AvatarImage src={comment.author.image || undefined} alt="" />
        <AvatarFallback className="text-xs">{getInitials(comment.author.name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="rounded-xl border bg-card/90 p-3.5 shadow-[2px_2px_0_0_var(--shadow-ink)]">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold">{comment.author.name || "Anonymous"}</span>
            {isPostAuthor && <span className="sticker !py-0 text-[0.65rem]">author</span>}
            <time
              className="font-mono text-xs text-muted-foreground"
              dateTime={new Date(comment.createdAt).toISOString()}
              title={new Date(comment.createdAt).toLocaleString()}
            >
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </time>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{comment.content}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            disabled={!currentUserId || isLiking}
            aria-pressed={isLiked}
            aria-label={isLiked ? "Remove kudos" : "Give kudos"}
            title={currentUserId ? (isLiked ? "Remove kudos" : "Give kudos") : "Sign in to give kudos"}
            className={cn(
              "mr-1 inline-flex h-7 items-center gap-1.5 rounded-full border-[1.5px] border-[color:var(--shadow-ink)] bg-card px-2.5 font-mono text-xs shadow-[2px_2px_0_0_var(--shadow-ink)] transition-all",
              "hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--shadow-ink)] active:translate-x-px active:translate-y-px active:shadow-none",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
              isLiked && "bg-accent"
            )}
          >
            <span key={String(isLiked)} className={cn(isLiked && "pop")}>
              <PixelStar filled={isLiked} />
            </span>
            {likeCount}
          </button>

          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm((open) => !open)}
              className="h-8 gap-1.5 px-2"
            >
              <Reply className="h-4 w-4" />
              <span className="text-xs">Reply</span>
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 gap-1.5 px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-xs">{isDeleting ? "Deleting..." : "Delete"}</span>
            </Button>
          )}
        </div>

        {showReplyForm && (
          <div className="pt-1">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              autoFocus
              onCommentAdded={onCommentAdded}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.author.name || "this comment"}...`}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-4 border-l-2 border-dashed pl-4">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                postId={postId}
                postAuthorId={postAuthorId}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onCommentAdded={onCommentAdded}
                onCommentDeleted={onCommentDeleted}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
