"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AboutVideoHeroProps {
  videoSrc?: string;
  posterSrc: string;
  title: string;
  subtitle: string;
}

export function AboutVideoHero({
  videoSrc,
  posterSrc,
  title,
  subtitle,
}: AboutVideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!videoRef.current || reducedMotion || videoError) return;
    const video = videoRef.current;
    video.play().catch(() => {
      // Autoplay blocked — fall back to poster
      setVideoError(true);
    });
  }, [reducedMotion, videoError]);

  const showVideo = videoSrc && !reducedMotion && !videoError && videoLoaded;

  return (
    <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-bg-primary-dark">
      {/* Poster image (always rendered, serves as fallback) */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          showVideo ? "opacity-0" : "opacity-100",
        )}
      >
        <Image
          src={posterSrc}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      {/* Video (lazy, deferred) */}
      {videoSrc && !reducedMotion && (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
            showVideo ? "opacity-100" : "opacity-0",
          )}
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          poster={posterSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 container-mvm h-full flex flex-col justify-center">
        <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-4">
          {subtitle}
        </p>
        <h1 className="text-display md:text-[4.5rem] font-bold tracking-tight leading-[1.05] text-text-on-dark max-w-3xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
