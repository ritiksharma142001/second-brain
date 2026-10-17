"use client";

import { useCallback, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive (red). */
  destructive?: boolean;
}

/**
 * In-app replacement for window.confirm().
 *
 *   const { confirm, dialog } = useConfirm();
 *   if (!(await confirm({ title: "Delete this?", destructive: true }))) return;
 *   ...
 *   return <>{dialog} ...</>;
 */
export function useConfirm() {
  const [pending, setPending] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ options, resolve })),
    []
  );

  const settle = (value: boolean) => {
    pending?.resolve(value);
    setPending(null);
  };

  const options = pending?.options;

  const dialog = (
    <Dialog.Root open={!!pending} onOpenChange={(open) => !open && settle(false)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
          <Dialog.Content className="window rise w-full max-w-sm focus:outline-none">
            <div className="window-bar">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="ml-2">{options?.destructive ? "are-you-sure.exe" : "confirm.exe"}</span>
            </div>
            <div className="space-y-5 p-6">
              <div className="space-y-1.5">
                <Dialog.Title className="text-lg font-bold leading-snug">{options?.title}</Dialog.Title>
                <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">
                  {options?.description ?? "This action can't be undone."}
                </Dialog.Description>
              </div>
              <div className="flex justify-end gap-2">
                {/* Cancel comes first so it receives focus: Enter never deletes by accident. */}
                <Button variant="outline" size="sm" onClick={() => settle(false)}>
                  {options?.cancelLabel ?? "Cancel"}
                </Button>
                <Button
                  size="sm"
                  variant={options?.destructive ? "destructive" : "default"}
                  onClick={() => settle(true)}
                >
                  {options?.confirmLabel ?? "Confirm"}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return { confirm, dialog };
}
