"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

const SLIDE_INTERVAL = 8000;
const TRANSITION_DURATION = 700;

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 50);
      }, TRANSITION_DURATION / 2);
    },
    [current, isTransitioning],
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || isTransitioning) return;
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, isTransitioning, next]);

  // Respect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (slides.length === 0) return null;

  const slide = slides[current];

  // Parse title for two-line display
  const titleParts = slide.title.split("\n");

  return (
    <section
      className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-bg-primary-dark"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background images with Ken Burns */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0",
          )}
          style={{
            transitionDuration: `${TRANSITION_DURATION}ms`,
            transitionTimingFunction: "ease-in-out",
          }}
        >
          <Image
            src={s.imageUrl}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            className={cn(
              "object-cover",
              !reducedMotion && "ken-burns",
              i === current && "ken-burns-active",
            )}
            style={{
              animationDuration: `${SLIDE_INTERVAL}ms`,
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary-dark/90 via-bg-primary-dark/50 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 container-mvm h-full flex items-center">
        <div
          className={cn(
            "max-w-2xl transition-all",
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
          )}
          style={{
            transitionDuration: `${TRANSITION_DURATION}ms`,
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p className="text-accent text-body-sm font-medium tracking-wider uppercase mb-4">
            {slide.subtitle}
          </p>
          <h1 className="text-display md:text-[4.5rem] font-bold tracking-tight leading-[1.05] text-text-on-dark mb-6">
            {titleParts.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {i === titleParts.length - 1 ? (
                  <span className="text-accent">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>
          <p className="text-body-lg text-text-on-dark-secondary max-w-xl mb-8">
            {slide.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={slide.ctaLink}
              className="inline-flex items-center justify-center h-12 px-7 rounded-md bg-accent text-text-on-accent text-body font-medium hover:bg-accent-hover transition-colors"
            >
              {slide.ctaText}
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows (desktop) */}
      <div className="hidden md:flex absolute inset-y-0 left-0 right-0 z-30 items-center justify-between px-6 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={prev}
          className="p-3 rounded-full bg-bg-primary-dark/50 text-text-on-dark hover:bg-bg-primary-dark/80 transition-colors backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={next}
          className="p-3 rounded-full bg-bg-primary-dark/50 text-text-on-dark hover:bg-bg-primary-dark/80 transition-colors backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current
                ? "w-8 bg-accent"
                : "w-1.5 bg-text-on-dark-secondary/40 hover:bg-text-on-dark-secondary/60",
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
