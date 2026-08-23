"use client";

import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { TourGalleryImage } from "@/types/public-tour";

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
      <section aria-label={`Photo gallery for ${title}`} className="bg-[#fbfaf6] py-5 sm:py-8">
        <div className="site-shell max-w-[90rem] grid auto-cols-[86%] grid-flow-col gap-3 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-color:var(--color-gold)_transparent] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          <GalleryButton image={visibleImages[0]} index={0} count={visibleImages.length} priority onOpen={setActiveIndex} className="aspect-[16/10] lg:col-span-3" />
          {visibleImages.length > 1 ? (
            <div className="contents">
              {visibleImages.slice(1).map((image, offset) => (
                <GalleryButton key={image.src} image={image} index={offset + 1} count={visibleImages.length} onOpen={setActiveIndex} className="aspect-[16/10]" />
              ))}
            </div>
          ) : null}
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

function GalleryButton({ image, index, count, priority = false, onOpen, className }: { image: TourGalleryImage; index: number; count: number; priority?: boolean; onOpen: (index: number) => void; className: string }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Open photo ${index + 1} of ${count}: ${image.alt}`}
      className={`group relative snap-start overflow-hidden bg-limestone text-left focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-gold ${className}`}
    >
      <Image src={image.src} alt={image.alt} fill priority={priority} sizes={index === 0 ? "(max-width: 1024px) 86vw, 90rem" : "(max-width: 1024px) 86vw, 30vw"} className="object-cover transition-transform duration-base group-hover:scale-[1.015]" />
      <span className="absolute right-3 top-3 flex min-h-10 items-center gap-2 bg-charcoal/82 px-3 text-xs font-semibold text-frangipani opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        {index + 1} / {count} <Maximize2 aria-hidden="true" className="size-3.5" />
      </span>
    </button>
  );
}
