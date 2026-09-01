"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface HeroSlide {
  src: string;
  alt: string;
  caption: string;
  objectPosition: string;
}

interface HeroGalleryProps {
  slides: readonly HeroSlide[];
}

const advanceIntervalMs = 6_500;

export function HeroGallery({ slides }: HeroGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryReady, setGalleryReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!galleryReady || reduceMotion || isPaused || !pageVisible || slides.length < 2) return;
    const timeout = window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, advanceIntervalMs);
    return () => window.clearTimeout(timeout);
  }, [currentIndex, galleryReady, isPaused, pageVisible, reduceMotion, slides.length]);

  if (!slides.length) return null;

  const showPrevious = () => setCurrentIndex((index) => (index - 1 + slides.length) % slides.length);
  const showNext = () => setCurrentIndex((index) => (index + 1) % slides.length);
  return (
    <div
      className="relative h-full min-h-48 overflow-hidden bg-terrace sm:min-h-[22rem] lg:min-h-[34rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Bali scenes"
    >
      {slides.map((slide, index) => {
        if (index > 0 && !galleryReady) return null;
        const active = index === currentIndex;
        return (
          <Image
            key={slide.src}
            src={slide.src}
            alt={active ? slide.alt : ""}
            fill
            priority={index === 0}
            loading={index === 0 ? undefined : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            sizes="(max-width: 1023px) 100vw, 58vw"
            onLoad={() => {
              if (index === 0) setGalleryReady(true);
            }}
            className={`object-cover brightness-[0.86] saturate-[0.92] transition-[opacity,transform] duration-[1100ms] ease-out motion-reduce:transition-none ${
              active ? "scale-100 opacity-100" : "pointer-events-none scale-[1.015] opacity-0"
            }`}
            style={{ objectPosition: slide.objectPosition }}
            aria-hidden={!active}
          />
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" aria-hidden="true" />

      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
        <div className="max-w-[70%] text-frangipani">
          <p className="text-[0.6875rem] font-bold tracking-[0.12em] text-gold">
            {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
          <div className="relative mt-1 min-h-10" aria-live="off">
            {slides.map((slide, index) => (
              <p
                key={slide.caption}
                className={`absolute inset-0 text-sm font-semibold leading-5 transition-[opacity,transform] duration-500 motion-reduce:transition-none ${index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
                aria-hidden={index !== currentIndex}
              >
                {slide.caption}
              </p>
            ))}
          </div>
        </div>

        {slides.length > 1 ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={showPrevious}
              className="inline-flex size-11 items-center justify-center border border-frangipani/55 bg-charcoal/72 text-frangipani transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus"
              aria-label="Show previous Bali scene"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="inline-flex size-11 items-center justify-center border border-frangipani/55 bg-charcoal/72 text-frangipani transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus"
              aria-label="Show next Bali scene"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

