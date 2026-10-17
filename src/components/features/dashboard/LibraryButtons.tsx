"use client";

import { useTransition } from "react";
import { BookmarkX, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { clearHistory, removeBookmark, removeFromHistory } from "@/lib/actions/library";

export function RemoveBookmarkButton({ postId }: { postId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => start(async () => void (await removeBookmark(postId)))}
    >
      <BookmarkX /> {pending ? "Removing..." : "Remove"}
    </Button>
  );
}

export function RemoveHistoryButton({ postId }: { postId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      aria-label="Remove from history"
      title="Remove from history"
      disabled={pending}
      onClick={() => start(async () => void (await removeFromHistory(postId)))}
    >
      <X />
    </Button>
  );
}

export function ClearHistoryButton() {
  const [pending, start] = useTransition();
  const { confirm, dialog } = useConfirm();

  const handleClear = async () => {
    const confirmed = await confirm({
      title: "Clear your reading history?",
      description: "Every post will be removed from your history. Your bookmarks aren't affected.",
      confirmLabel: "Clear history",
      destructive: true,
    });
    if (confirmed) start(async () => void (await clearHistory()));
  };

  return (
    <>
      {dialog}
      <Button variant="outline" size="sm" disabled={pending} onClick={handleClear}>
        <Trash2 /> {pending ? "Clearing..." : "Clear history"}
      </Button>
    </>
  );
}
