"use client";

import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { TourGalleryImage } from "@/data/mock-tour-details";

export function PhotoGallery({ images, title }: { images: TourGalleryImage[]; title: string }) {
  const visibleImages = images.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeIndex]);

  if (visibleImages.length === 0) return null;

  return (
    <>
      <section aria-label={`Photo gallery for ${title}`} className="border-y border-charcoal bg-charcoal p-1">
        <div className="mx-auto grid max-w-[1600px] auto-cols-[84%] grid-flow-col gap-1 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-color:var(--color-gold)_transparent] sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {visibleImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Open photo ${index + 1} of ${visibleImages.length}: ${image.alt}`}
              className="group relative aspect-[4/3] snap-start overflow-hidden bg-limestone text-left focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-gold"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 84vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-base group-hover:scale-[1.025]"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-charcoal/90 to-transparent px-4 pb-3 pt-12 text-frangipani">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em]">
                  {String(index + 1).padStart(2, "0")} / {String(visibleImages.length).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-90">
                  View full photo <Maximize2 aria-hidden="true" className="size-3.5" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${activeIndex + 1} of ${visibleImages.length} for ${title}`}
          className="fixed inset-0 z-[100] grid place-items-center bg-charcoal/95 p-3 sm:p-6"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative h-[min(78vh,52rem)] w-[min(94vw,86rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={visibleImages[activeIndex].src}
              alt={visibleImages[activeIndex].alt}
              fill
              sizes="94vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            autoFocus
            className="absolute right-4 top-4 inline-flex min-h-11 items-center gap-2 border border-frangipani/35 bg-charcoal px-4 text-sm font-semibold text-frangipani hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold sm:right-6 sm:top-6"
          >
            Close <X aria-hidden="true" className="size-4" />
          </button>
          <p className="absolute bottom-4 left-1/2 w-[min(90vw,48rem)] -translate-x-1/2 text-center text-sm text-frangipani/80 sm:bottom-6">
            {visibleImages[activeIndex].alt}
          </p>
        </div>
      ) : null}
    </>
  );
}
