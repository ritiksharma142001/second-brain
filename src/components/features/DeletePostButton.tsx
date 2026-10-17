"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { deletePost } from "@/lib/actions/post";
import { toast } from "@/lib/hooks/use-toast";

export function DeletePostButton({ id, title }: { id: string; title?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { confirm, dialog } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: title ? `Delete "${title}"?` : "Delete this post?",
      description: "The post and all of its comments will be removed. This can't be undone.",
      confirmLabel: "Delete post",
      destructive: true,
    });
    if (!confirmed) return;

    setIsLoading(true);
    const result = await deletePost(id);
    setIsLoading(false);
    if (result.error) {
      toast({ title: "Couldn't delete the post", description: result.error, variant: "destructive" });
    } else {
      router.refresh();
    }
  };

  return (
    <>
      {dialog}
      <Button variant="outline" size="sm" onClick={handleDelete} disabled={isLoading}>
        {isLoading ? "Deleting..." : "Delete"}
      </Button>
    </>
  );
}
