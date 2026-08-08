import Image from "next/image";

import type { TourGalleryImage } from "@/data/mock-tour-details";

export function PhotoGallery({ images, title }: { images: TourGalleryImage[]; title: string }) {
  const visibleImages = images.slice(0, 4);
  if (visibleImages.length === 0) return null;

  return (
    <section aria-label={`Photo gallery for ${title}`} className="grid grid-cols-1 gap-px overflow-hidden border border-charcoal bg-charcoal sm:grid-cols-2">
        {visibleImages.map((image, index) => (
          <figure key={image.src} className="relative aspect-[4/3] overflow-hidden bg-charcoal">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-contain"
            />
            <figcaption className="absolute bottom-3 left-3 bg-charcoal/90 px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-frangipani">
              {String(index + 1).padStart(2, "0")} / {String(visibleImages.length).padStart(2, "0")}
            </figcaption>
          </figure>
        ))}
    </section>
  );
}
