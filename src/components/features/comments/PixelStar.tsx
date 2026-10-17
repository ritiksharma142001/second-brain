import { cn } from "@/lib/utils";

/** A 9x9 pixel-art star, drawn as rows of [startX, endX] runs. */
const ROWS: Array<Array<[number, number]>> = [
  [[4, 4]],
  [[3, 5]],
  [[3, 5]],
  [[0, 8]],
  [[1, 7]],
  [[2, 6]],
  [[2, 6]],
  [[1, 3], [5, 7]],
  [[0, 1], [7, 8]],
];

/** 8-bit star. Filled in the highlight colour when `filled`, a faint outline-ish tone otherwise. */
export function PixelStar({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 9 9"
      shapeRendering="crispEdges"
      aria-hidden
      className={cn("h-[18px] w-[18px]", className)}
    >
      {ROWS.flatMap((runs, y) =>
        runs.map(([from, to]) => (
          <rect
            key={`${y}-${from}`}
            x={from}
            y={y}
            width={to - from + 1}
            height={1}
            fill={filled ? "var(--highlight)" : "currentColor"}
            fillOpacity={filled ? 1 : 0.28}
          />
        ))
      )}
    </svg>
  );
}
