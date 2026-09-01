"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Use fill mode for container-sized images (parent must have position: relative) */
  fill?: boolean;
  /** Explicit width in pixels (required if not using fill) */
  width?: number;
  /** Explicit height in pixels (required if not using fill) */
  height?: number;
  /** Responsive sizes attribute */
  sizes?: string;
  /** Load eagerly (above the fold) */
  priority?: boolean;
  /** Object fit style */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /** Aspect ratio class for container */
  aspectRatio?: string;
}

/**
 * Optimized image component wrapping Next.js <Image>.
 * Handles responsive sizing, lazy loading, smooth fade-in, and modern format delivery.
 *
 * Usage:
 *   <OptimizedImage src="..." alt="..." fill objectFit="cover" />
 *   <OptimizedImage src="..." alt="..." width={400} height={300} />
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  objectFit = "cover",
  aspectRatio,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);

  // Default responsive sizes if not provided
  const responsiveSizes =
    sizes ||
    (fill
      ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      : undefined);

  const containerClass = cn("img-loading overflow-hidden", className);

  if (fill) {
    return (
      <div
        className={containerClass}
        data-loaded={loaded ? "true" : "false"}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={responsiveSizes}
          priority={priority}
          className="object-cover"
          style={{ objectFit }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={containerClass}
      data-loaded={loaded ? "true" : "false"}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={width || 800}
        height={height || 600}
        sizes={responsiveSizes}
        priority={priority}
        style={{ objectFit }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
