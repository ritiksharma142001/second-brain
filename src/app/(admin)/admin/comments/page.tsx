"use client";

import { useState, useEffect } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CommentsPage() {
  const { confirm, dialog } = useConfirm();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const response = await fetch("/api/admin/comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete this comment?",
      description: "This can't be undone. Replies under it are removed too.",
      confirmLabel: "Delete comment",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
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
    <div className="space-y-6">
      {dialog}
      <div>
        <h1 className="text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground">
          Moderate and manage all comments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-4 p-4 border rounded-lg"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={comment.author.image || undefined} />
                    <AvatarFallback>
                      {getInitials(comment.author.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <p className="text-sm whitespace-pre-wrap mb-2">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/blog/${comment.post.slug}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {comment.post.title}
                      </Link>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
