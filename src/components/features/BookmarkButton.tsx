"use client";

import { useState, useEffect } from "react";
import { toast } from "@/lib/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
}

export function BookmarkButton({ postId }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkBookmark = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`);
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      checkBookmark();
    }
  }, [session, postId]);

  const toggleBookmark = async () => {
    if (!session?.user?.id) {
      toast({ title: "Sign in to bookmark posts", description: "Create a free account to save posts for later." });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: isBookmarked ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size="sm"
      onClick={toggleBookmark}
      disabled={isLoading}
    >
      <Bookmark
        className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`}
      />
      {isBookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
