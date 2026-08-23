import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PriceTag } from "@/components/ui/price-tag";
import type { PublicTourCard } from "@/types/public-tour";

interface TourCardPromotion {
  name: string;
  percentOff: number;
  exactForSelectedDate: boolean;
}

export function TourCard({ tour, priority = false, bookingQuery, promotion, layout = "standard" }: { tour: PublicTourCard; priority?: boolean; bookingQuery?: string; promotion?: TourCardPromotion | null; layout?: "standard" | "wide" }) {
  const href = bookingQuery ? `/tours/${tour.slug}?${bookingQuery}` : `/tours/${tour.slug}`;
  const isWide = layout === "wide";

  return (
    <article className="group h-full bg-frangipani">
      <Link href={href} className={`grid h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus ${isWide ? "md:grid-cols-[1.2fr_0.8fr]" : "grid-rows-[auto_1fr]"}`}>
        <div className={`relative overflow-hidden bg-terrace ${isWide ? "aspect-[16/10] md:aspect-auto md:min-h-[27rem]" : "aspect-[16/10]"}`}>
          <Image
            src={tour.image}
            alt={tour.imageAlt}
            fill
            priority={priority}
            sizes={isWide ? "(max-width: 768px) 100vw, 42vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 38vw"}
            className="object-cover transition-transform duration-slow group-hover:scale-[1.025]"
          />
        </div>

        <div className={`flex flex-1 flex-col border border-charcoal/20 ${isWide ? "border-t-0 p-5 md:border-l-0 md:border-t md:p-7 lg:p-8" : "border-t-0 p-5 sm:p-6"}`}>
          <div className="flex items-center justify-between gap-4 text-xs font-semibold text-weathered">
            <span className="text-clay">{tour.category}</span>
            <span>Private vehicle</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-weathered">
            <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-3.5 text-clay" />{tour.location}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-3.5 text-clay" />{tour.duration}</span>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <h3 className={`font-serif font-normal leading-[1.04] text-charcoal ${isWide ? "text-3xl lg:text-4xl" : "text-[1.75rem]"}`}>{tour.title}</h3>
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-charcoal/30 text-charcoal transition-colors group-hover:border-terrace group-hover:bg-terrace group-hover:text-frangipani"><ArrowUpRight aria-hidden="true" className="size-4" /></span>
          </div>
          <p className="mt-4 text-sm leading-6 text-weathered">{tour.note}</p>
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
              suffix={tour.pricingMode === "PER_VEHICLE" ? "per vehicle · up to 6 guests" : "per person"}
              discount={promotion?.exactForSelectedDate ? { label: promotion.name, percentOff: promotion.percentOff } : undefined}
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
