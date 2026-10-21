import { LABEL_COLORS, type LabelColor, type Side } from "@/lib/mixtape";
import { cn } from "@/lib/utils";

interface CassetteProps {
  title: string;
  dedication?: string | null;
  color: string;
  tapeLength: number;
  side?: Side;
  /** Spin the reels (while "playing"). */
  spinning?: boolean;
  className?: string;
}

const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

/** A cassette tape drawn in SVG, with a hand-written label. */
export function Cassette({
  title,
  dedication,
  color,
  tapeLength,
  side = "A",
  spinning = false,
  className,
}: CassetteProps) {
  const palette =
    LABEL_COLORS[(color in LABEL_COLORS ? color : "sunset") as LabelColor];
  const gradientId = `tape-label-${color}`;

  const reel = (cx: number) => (
    <g className="reel">
      <circle cx={cx} cy={80} r={12} fill="#f3ead8" />
      <circle cx={cx} cy={80} r={5} fill="#2e2925" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <rect
          key={angle}
          x={cx - 1.2}
          y={80 - 10}
          width={2.4}
          height={4}
          fill="#2e2925"
          transform={`rotate(${angle} ${cx} 80)`}
        />
      ))}
    </g>
  );

  return (
    <svg
      viewBox="0 0 240 152"
      role="img"
      aria-label={`Cassette: ${title}`}
      className={cn(
        "h-auto w-full drop-shadow-[4px_4px_0_var(--shadow-ink)]",
        spinning && "spinning",
        className,
      )}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.from} />
          <stop offset="1" stopColor={palette.to} />
        </linearGradient>
      </defs>

      {/* shell */}
      <rect
        x={2}
        y={2}
        width={236}
        height={148}
        rx={12}
        fill="#2e2925"
        stroke="#1c1916"
        strokeWidth={2}
      />
      {[
        [12, 12],
        [228, 12],
        [12, 140],
        [228, 140],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill="#6b625a" />
      ))}

      {/* label */}
      <rect
        x={16}
        y={12}
        width={208}
        height={90}
        rx={6}
        fill={`url(#${gradientId})`}
      />
      <line x1={46} y1={40} x2={214} y2={40} stroke="#00000026" />
      <line x1={46} y1={58} x2={214} y2={58} stroke="#00000026" />
      <circle
        cx={31}
        cy={28}
        r={10}
        fill="#ffffffaa"
        stroke="#2b2118"
        strokeWidth={1.2}
      />
      <text
        x={31}
        y={32.5}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fontSize={12}
        fill="#2b2118"
      >
        {side}
      </text>
      <text
        x={214}
        y={26}
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize={9}
        fill="#2b2118"
        opacity={0.75}
      >
        C{tapeLength}
      </text>
      <text
        x={48}
        y={37}
        fontFamily="var(--font-marker)"
        fontSize={15}
        fill="#2b2118"
      >
        {clip(title, 22)}
      </text>
      {dedication && (
        <text
          x={48}
          y={55}
          fontFamily="var(--font-marker)"
          fontSize={10.5}
          fill="#2b2118"
          opacity={0.85}
        >
          {clip(`for ${dedication}`, 32)}
        </text>
      )}

      {/* window with the tape and reels */}
      <rect
        x={58}
        y={64}
        width={124}
        height={32}
        rx={16}
        fill="#1a1715"
        stroke="#00000066"
      />
      <circle cx={88} cy={80} r={15} fill="#5a3b25" />
      <circle cx={152} cy={80} r={13} fill="#5a3b25" />
      {reel(88)}
      {reel(152)}

      {/* bottom edge */}
      <path
        d="M58 150 L72 116 H168 L182 150 Z"
        fill="#25211e"
        stroke="#1c1916"
        strokeWidth={1.5}
      />
      <circle cx={100} cy={134} r={4} fill="#111" />
      <circle cx={140} cy={134} r={4} fill="#111" />
      <rect x={116} y={128} width={8} height={8} fill="#111" />
    </svg>
  );
}
