import { cn } from "@/lib/utils";

interface AmbientIconFieldProps {
  /** Which icon set to use */
  icons?: ("phone" | "laptop" | "plate" | "cart" | "package" | "monitor")[];
  /** Section background variant — controls opacity */
  variant?: "light" | "dark";
  /** "low" = exactly 8 icons, "medium" = exactly 14 icons */
  density?: "low" | "medium";
  /** Optional className override */
  className?: string;
}

/**
 * AmbientIconField (v12)
 *
 * Absolutely-positioned decorative icon layer behind section content.
 * Uses fixed {top,left} percentage coordinates and a shared CSS keyframe
 * animation with per-icon duration variation. Fully deterministic — no
 * randomisation, no algorithmic scatter.
 */

// ── Fixed icon SVG paths (outline/stroke style, 24×24 viewBox) ──────────
const iconPaths: Record<string, string> = {
  phone:
    "M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 18h4",
  laptop:
    "M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 12h12m-6 4v-4",
  plate: "M4 12a8 8 0 0116 0m-8-4v8m-4 0h8",
  cart: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  package:
    "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  monitor:
    "M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 12h12",
};

// ── Hardcoded position arrays (percentage coordinates) ───────────────────
// Edges/corners — avoids centre ~40% where content sits
const LOW_POSITIONS: { top: string; left: string }[] = [
  { top: "8%", left: "5%" },
  { top: "12%", left: "88%" },
  { top: "28%", left: "3%" },
  { top: "22%", left: "92%" },
  { top: "68%", left: "4%" },
  { top: "75%", left: "90%" },
  { top: "88%", left: "8%" },
  { top: "85%", left: "86%" },
];

const MEDIUM_POSITIONS: { top: string; left: string }[] = [
  { top: "6%", left: "4%" },
  { top: "5%", left: "35%" },
  { top: "8%", left: "62%" },
  { top: "6%", left: "90%" },
  { top: "22%", left: "2%" },
  { top: "18%", left: "93%" },
  { top: "42%", left: "3%" },
  { top: "38%", left: "95%" },
  { top: "62%", left: "2%" },
  { top: "68%", left: "94%" },
  { top: "82%", left: "6%" },
  { top: "78%", left: "36%" },
  { top: "85%", left: "64%" },
  { top: "90%", left: "90%" },
];

// ── Animation durations cycled per icon index ────────────────────────────
const DURATION_CYCLE = [8, 10, 12, 14] as const;

export function AmbientIconField({
  icons = ["phone", "laptop", "plate", "cart", "package", "monitor"],
  variant = "light",
  density = "low",
  className,
}: AmbientIconFieldProps) {
  const positions = density === "medium" ? MEDIUM_POSITIONS : LOW_POSITIONS;
  const iconCount = positions.length; // 8 or 14

  // Fixed opacity per variant spec
  const opacity = variant === "light" ? 0.06 : 0.08;

  // Stroke colour: muted gray token via currentColor
  const strokeColor =
    variant === "light"
      ? "var(--text-tertiary)"
      : "var(--text-on-dark-secondary)";

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 overflow-hidden pointer-events-none",
        className,
      )}
      aria-hidden="true"
    >
      {positions.map((pos, i) => {
        const iconKey = icons[i % icons.length];
        const path = iconPaths[iconKey];
        const duration = DURATION_CYCLE[i % DURATION_CYCLE.length];

        return (
          <svg
            key={i}
            className="ambient-drift-v12 absolute"
            style={{
              top: pos.top,
              left: pos.left,
              width: 28,
              height: 28,
              opacity,
              color: strokeColor,
              ["--ambient-duration" as string]: `${duration}s`,
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={path} />
          </svg>
        );
      })}
    </div>
  );
}
