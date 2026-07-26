"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Reply, Trash2 } from "lucide-react";
import { CommentForm } from "./CommentForm";

interface CommentData {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    replies: number;
  };
  replies?: CommentData[];
}

interface CommentProps {
  comment: CommentData;
  postId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
  depth?: number;
}

export function Comment({
  comment,
  postId,
  currentUserId,
  isAdmin,
  onCommentAdded,
  onCommentDeleted,
  depth = 0,
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment._count.likes);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = currentUserId && (currentUserId === comment.author.id || isAdmin);

  const handleLike = async () => {
    if (!currentUserId) return;

    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (err) {
      console.error("Failed to like comment");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onCommentDeleted();
      }
    } catch (err) {
      console.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={depth > 0 ? "ml-8 mt-4" : ""}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author.image || undefined} />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">
                {comment.author.name || "Anonymous"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!currentUserId}
              className="h-8 px-2"
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-xs">{likeCount}</span>
            </Button>

            {currentUserId && depth < 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-8 px-2"
              >
                <Reply className="h-4 w-4 mr-1" />
                <span className="text-xs">Reply</span>
              </Button>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="text-xs">Delete</span>
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onCommentAdded={() => {
                  onCommentAdded();
                  setShowReplyForm(false);
                }}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  postId={postId}
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
    </div>
  );
}
