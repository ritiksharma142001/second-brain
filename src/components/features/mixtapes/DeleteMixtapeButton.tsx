"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/hooks/use-toast";

export function DeleteMixtapeButton({
  id,
  title,
  redirectTo,
}: {
  id: string;
  title: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { confirm, dialog } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete "${title}"?`,
      description:
        "The tape and its track list will be erased. This can't be undone.",
      confirmLabel: "Delete tape",
      destructive: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/mixtapes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      toast({
        title: "Couldn't delete the tape",
        description: "Please try again.",
        variant: "destructive",
      });
      setBusy(false);
    }
  };

  return (
    <>
      {dialog}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={busy}
      >
        <Trash2 /> {busy ? "Deleting..." : "Delete"}
      </Button>
    </>
  );
}
