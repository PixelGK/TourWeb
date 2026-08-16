export interface PublicTourCard {
  slug: string;
  title: string;
  category: string;
  location: string;
  duration: string;
  durationHours: number;
  image: string;
  imageAlt: string;
  priceIdr: number;
  priceUsd: number;
  pricingMode?: TourPricingMode;
  rating: number;
  reviewCount: number;
  note: string;
  featured?: boolean;
}

export type TourPricingMode = "PER_PERSON" | "PER_VEHICLE";

export interface TourGalleryImage {
  src: string;
  alt: string;
}

export interface ItineraryStop {
  time: string;
  title: string;
  description: string;
}

export interface PricingTier {
  minPax: number;
  maxPax: number;
  perPersonIdr: number;
}

export interface PublicTourAddon {
  code: string;
  title: string;
  description: string;
  priceIdr: number;
  pricingMode: "PER_PERSON" | "PER_BOOKING";
}

export interface PublicTourDetail extends PublicTourCard {
  summary: string;
  gallery: TourGalleryImage[];
  itinerary: ItineraryStop[];
  inclusions: string[];
  exclusions: string[];
  pricingTiers: PricingTier[];
  meetingPoint: string;
  meetingNote: string;
  cancellationPolicy: string;
  maxGroupSize: number;
  childPriceIdr: number | null;
  childAgeLabel: string | null;
  addons: PublicTourAddon[];
}
