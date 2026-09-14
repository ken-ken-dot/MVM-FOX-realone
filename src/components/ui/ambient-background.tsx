"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  /** Icons to use as pattern elements — each is an SVG path */
  icons?: "tech" | "catering" | "mixed";
  /** Variant: light or dark background */
  variant?: "light" | "dark";
  /** Override className */
  className?: string;
}

/**
 * Curated icon set: line-style (outline) icons representing MVM FOX offerings.
 * 8 icons total — consistent stroke weight, no filled/solid variants.
 */
const iconPaths = {
  tech: [
    // Laptop
    "M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 12h12m-6 4v-4",
    // Phone
    "M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 18h4",
    // Code bracket
    "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    // Monitor
    "M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 12h12",
    // Shopping bag
    "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  ],
  catering: [
    // Fork & knife
    "M12 2v6m0 0a3 3 0 013 3v1a3 3 0 01-3 3 3 3 0 01-3-3V8a3 3 0 013-3zm-3 9v5m6-5v5",
    // Plate
    "M4 12a8 8 0 0116 0m-8-4v8m-4 0h8",
    // Glass
    "M8 2l-2 8h8l-2-8M6 10v6a2 2 0 002 2h4a2 2 0 002-2v-6",
    // Chef hat (simplified)
    "M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2M6 20h12M8 4a4 4 0 018 0",
    // Gift/package
    "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  ],
  mixed: [
    // Laptop
    "M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 12h12m-6 4v-4",
    // Fork
    "M12 2v6m0 0a3 3 0 013 3v1a3 3 0 01-3 3 3 3 0 01-3-3V8a3 3 0 013-3z",
    // Shopping bag
    "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
    // Phone
    "M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 18h4",
    // Code bracket
    "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  ],
};

interface IconPosition {
  x: number;
  y: number;
  size: number;
  rotation: number;
  icon: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
}

/**
 * Generate a loose, irregular scatter of icons.
 * - Biases placement toward edges/corners (clears center for content)
 * - Skips ~35% of grid cells to avoid uniform fill
 * - Varies size (16-40px), opacity (4%-10%), and drift parameters per icon
 */
function generatePositions(
  seed: number,
  iconCount: number,
  cols: number,
  rows: number,
): IconPosition[] {
  const positions: IconPosition[] = [];
  const totalCells = cols * rows;
  const skipRatio = 0.35;
  const centerX = 0.5;
  const centerY = 0.5;

  let placed = 0;
  for (let i = 0; i < totalCells && placed < iconCount; i++) {
    // Skip ~35% of cells randomly
    const h = (seed * (i + 1) * 7919) % 10000;
    if (h / 10000 < skipRatio) continue;

    const col = i % cols;
    const row = Math.floor(i / cols);

    // Base position within cell (0-1 range within the cell)
    const cellX = col / cols;
    const cellY = row / rows;
    const cellW = 1 / cols;
    const cellH = 1 / rows;

    // Randomized offset within cell
    const v = (seed * (i + 1) * 6271) % 10000;
    const w = (seed * (i + 1) * 3571) % 10000;
    const offsetX = (v / 10000) * cellW * 0.6 + cellW * 0.2;
    const offsetY = (w / 10000) * cellH * 0.6 + cellH * 0.2;

    let x = cellX + offsetX;
    let y = cellY + offsetY;

    // Bias toward edges: push icons away from center
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.25) {
      // Push outward by 15-25%
      const pushFactor = 1.15 + (h % 10) / 100;
      x = centerX + dx * pushFactor;
      y = centerY + dy * pushFactor;
      x = Math.max(0.02, Math.min(0.98, x));
      y = Math.max(0.02, Math.min(0.98, y));
    }

    // Size: 16-40px range
    const size = 16 + (h % 25);

    // Opacity: 4%-10% range (varies per icon for depth)
    const opacity = 0.04 + ((v % 60) / 1000);

    // Drift: small random offsets for sine-based animation
    const driftX = ((h % 20) - 10) * 0.3; // -3 to +3 px
    const driftY = ((v % 20) - 10) * 0.3; // -3 to +3 px
    const duration = 18 + ((w % 120) / 10); // 18-30s
    const delay = (placed * 0.7) % 8; // staggered start

    positions.push({
      x,
      y,
      size,
      rotation: (v % 360),
      icon: placed % iconPaths.mixed.length,
      opacity,
      driftX,
      driftY,
      duration,
      delay,
    });
    placed++;
  }
  return positions;
}

export function AmbientBackground({
  icons = "mixed",
  variant = "light",
  className,
}: AmbientBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);

    // Detect mobile for reduced icon count
    const mobileMq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mobileMq.matches);
    const mobileHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobileMq.addEventListener("change", mobileHandler);

    return () => {
      mq.removeEventListener("change", handler);
      mobileMq.removeEventListener("change", mobileHandler);
    };
  }, []);

  const paths = iconPaths[icons] || iconPaths.mixed;

  // Mobile: fewer icons (6-8), desktop: more (12-16)
  const iconCount = isMobile ? 7 : 14;
  const cols = isMobile ? 3 : 5;
  const rows = isMobile ? 3 : 4;

  const positions = useMemo(
    () => generatePositions(42, iconCount, cols, rows),
    [iconCount, cols, rows],
  );

  const strokeColor =
    variant === "light" ? "var(--accent-primary)" : "var(--text-on-dark-secondary)";

  return (
    <div
      ref={ref}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {positions.map((pos, i) => (
          <g
            key={i}
            transform={`translate(${pos.x * 1920}, ${pos.y * 1080}) rotate(${pos.rotation}, ${pos.size / 2}, ${pos.size / 2})`}
            opacity={pos.opacity}
            className={!reducedMotion ? "ambient-drift" : ""}
            style={
              !reducedMotion
                ? {
                    ["--drift-x" as string]: `${pos.driftX}px`,
                    ["--drift-y" as string]: `${pos.driftY}px`,
                    ["--ambient-duration" as string]: `${pos.duration}s`,
                    ["--ambient-delay" as string]: `${pos.delay}s`,
                  }
                : undefined
            }
          >
            <path
              d={paths[pos.icon]}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width={pos.size}
              height={pos.size}
              viewBox="0 0 24 24"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
