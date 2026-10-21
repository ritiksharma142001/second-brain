"use client";

import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** An 11x7 pixel-art eye, drawn as rows of [startX, endX] runs. */
const EYE: Array<Array<[number, number]>> = [
  [[3, 7]],
  [
    [1, 2],
    [8, 9],
  ],
  [
    [0, 0],
    [4, 6],
    [10, 10],
  ],
  [
    [0, 0],
    [4, 6],
    [10, 10],
  ],
  [
    [0, 0],
    [4, 6],
    [10, 10],
  ],
  [
    [1, 2],
    [8, 9],
  ],
  [[3, 7]],
];

/** The slash across a closed eye: one pixel per row, top-right to bottom-left. */
const SLASH: Array<[number, number]> = [
  [9, 0],
  [8, 1],
  [7, 2],
  [6, 3],
  [5, 4],
  [4, 5],
  [3, 6],
];

function PixelEye({ crossedOut }: { crossedOut: boolean }) {
  return (
    <svg
      viewBox="0 0 11 7"
      shapeRendering="crispEdges"
      aria-hidden
      className="h-[14px] w-[22px]"
    >
      {EYE.flatMap((runs, y) =>
        runs.map(([from, to]) => (
          <rect
            key={`${y}-${from}`}
            x={from}
            y={y}
            width={to - from + 1}
            height={1}
            fill="currentColor"
          />
        )),
      )}
      {crossedOut &&
        SLASH.map(([x, y]) => (
          <rect
            key={`s-${x}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill="var(--highlight)"
          />
        ))}
    </svg>
  );
}

/**
 * A password field with a show/hide button. The pixel eye shows what a click will do:
 * an open eye reveals the password, a crossed-out eye hides it again.
 */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<typeof Input>, "type">
>(({ className, ...props }, ref) => {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={shown ? "text" : "password"}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        title={shown ? "Hide password" : "Show password"}
        disabled={props.disabled}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      >
        <PixelEye crossedOut={shown} />
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
