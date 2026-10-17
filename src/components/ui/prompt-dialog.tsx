"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PromptOptions {
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  /** Return an error message to block submitting, or null when the value is fine. */
  validate?: (value: string) => string | null;
  /** Allow submitting an empty value (e.g. to remove a link). */
  allowEmpty?: boolean;
}

/**
 * In-app replacement for window.prompt().
 *
 *   const { prompt, dialog } = usePrompt();
 *   const url = await prompt({ title: "Add a link", label: "URL" });   // string | null (cancelled)
 *   ...
 *   return <>{dialog} ...</>;
 */
export function usePrompt() {
  const [pending, setPending] = useState<{
    options: PromptOptions;
    resolve: (value: string | null) => void;
  } | null>(null);

  const prompt = useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => setPending({ options, resolve })),
    [],
  );

  const settle = (value: string | null) => {
    pending?.resolve(value);
    setPending(null);
  };

  const dialog = pending ? (
    <PromptDialog options={pending.options} onSettle={settle} />
  ) : null;
  return { prompt, dialog };
}

function PromptDialog({
  options,
  onSettle,
}: {
  options: PromptOptions;
  onSettle: (value: string | null) => void;
}) {
  const [value, setValue] = useState(options.defaultValue ?? "");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Radix focuses the first control; make sure it's the input, with any existing text selected.
    const id = requestAnimationFrame(() => inputRef.current?.select());
    return () => cancelAnimationFrame(id);
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed && !options.allowEmpty) {
      setError("Please enter a value.");
      return;
    }
    const problem = trimmed ? options.validate?.(trimmed) : null;
    if (problem) {
      setError(problem);
      return;
    }
    onSettle(trimmed);
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onSettle(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
          <Dialog.Content className="window rise w-full max-w-md focus:outline-none">
            <div className="window-bar">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="ml-2">input.exe</span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-4 p-6"
            >
              <div className="space-y-1.5">
                <Dialog.Title className="text-lg font-bold leading-snug">
                  {options.title}
                </Dialog.Title>
                {options.description && (
                  <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">
                    {options.description}
                  </Dialog.Description>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt-input">{options.label}</Label>
                <Input
                  id="prompt-input"
                  ref={inputRef}
                  value={value}
                  placeholder={options.placeholder}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError("");
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? "prompt-error" : undefined}
                  autoComplete="off"
                />
                {error && (
                  <p
                    id="prompt-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {error}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSettle(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {options.confirmLabel ?? "OK"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
