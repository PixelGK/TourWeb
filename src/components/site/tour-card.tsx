import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/ui/price-tag";
import type { PublicTourCard } from "@/types/public-tour";

interface TourCardPromotion {
  name: string;
  percentOff: number;
  exactForSelectedDate: boolean;
}

export function TourCard({ tour, priority = false, bookingQuery, promotion }: { tour: PublicTourCard; priority?: boolean; bookingQuery?: string; promotion?: TourCardPromotion | null }) {
  const href = bookingQuery ? `/tours/${tour.slug}?${bookingQuery}` : `/tours/${tour.slug}`;

  return (
    <article className="group h-full border border-charcoal/20 bg-frangipani transition-[border-color,box-shadow,transform] duration-base hover:-translate-y-1 hover:border-charcoal/50 hover:shadow-sun-raised">
      <Link href={href} className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
        <div className="relative aspect-[4/3] overflow-hidden bg-terrace">
          <Image
            src={tour.image}
            alt={tour.imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 84vw, (max-width: 1024px) 44vw, 360px"
            className="object-cover transition-transform duration-slow group-hover:scale-[1.025]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
            <Badge tone="neutral" className="bg-frangipani/95">{tour.category}</Badge>
            <span className="flex size-10 items-center justify-center rounded-control bg-charcoal text-frangipani transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/90 to-transparent px-4 pb-4 pt-10 text-xs font-semibold text-frangipani">
            {tour.note}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-weathered">
            <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-3.5 text-clay" />{tour.location}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-3.5 text-clay" />{tour.duration}</span>
          </div>
          <h3 className="mt-3 font-serif text-[1.65rem] leading-[1.08] text-charcoal">{tour.title}</h3>
          <div className="mt-auto pt-6">
            {promotion ? (
              <p className="mb-3 border-l-3 border-gold pl-3 text-xs font-bold leading-5 text-terrace">
                {promotion.exactForSelectedDate ? "Your selected date qualifies" : `${promotion.name} · ${promotion.percentOff}% off selected dates`}
              </p>
            ) : null}
            <PriceTag
              idr={tour.priceIdr}
              usdApprox={tour.priceUsd}
              size="sm"
              discount={promotion?.exactForSelectedDate ? { label: promotion.name, percentOff: promotion.percentOff } : undefined}
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
