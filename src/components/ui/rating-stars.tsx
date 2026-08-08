import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  reviewCount,
  size = "md",
  showValue = true,
  className,
}: RatingStarsProps) {
  const normalizedRating = Math.min(5, Math.max(0, rating));
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div
      className={cn("inline-flex items-center gap-2 text-charcoal", className)}
      aria-label={`${normalizedRating.toFixed(1)} out of 5 stars${reviewCount ? ` from ${reviewCount} reviews` : ""}`}
    >
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.min(1, Math.max(0, normalizedRating - index)) * 100;

          return (
            <span key={index} className={cn("relative block", iconSize)}>
              <Star className={cn("absolute inset-0 text-charcoal/25", iconSize)} strokeWidth={1.8} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <Star className={cn("fill-gold text-gold", iconSize)} strokeWidth={1.8} />
              </span>
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span className={cn("font-semibold tabular-nums", size === "sm" ? "text-xs" : "text-sm")}>
          {normalizedRating.toFixed(1)}
          {reviewCount !== undefined ? (
            <span className="font-normal text-weathered"> ({reviewCount})</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
