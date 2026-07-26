"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (session?.user?.id) {
      checkBookmark();
    }
  }, [session, postId]);

  const checkBookmark = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`);
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  const toggleBookmark = async () => {
    if (!session?.user?.id) {
      alert("Please sign in to bookmark posts");
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
