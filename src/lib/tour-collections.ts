import type { PublicTourCard } from "@/types/public-tour";

export const tourCollections = [
  { id: "culture", label: "Culture & temples", description: "Villages, water temples and living traditions" },
  { id: "wellness", label: "Wellness days", description: "Spa, yoga, hot springs and slower private routes" },
  { id: "adventure", label: "Water & adventure", description: "Rafting, snorkeling, surfing and sunrise starts" },
  { id: "nature", label: "Nature & islands", description: "Waterfalls, highlands and days across the strait" },
  { id: "family", label: "Easy family days", description: "One main experience with private return transport" },
  { id: "driver", label: "Driver freedom", description: "Build a route or link several days together" },
] as const;

export type TourCollectionId = (typeof tourCollections)[number]["id"];

const wellnessSlugs = new Set(["ubud-purification-spa-day", "ubud-yoga-spa-slow-day", "batur-hot-springs-highlands"]);

export function collectionForTour(tour: Pick<PublicTourCard, "category" | "slug">): TourCollectionId {
  if (wellnessSlugs.has(tour.slug)) return "wellness";
  if (tour.category === "Cultural Tours" || tour.category === "Cultural tour") return "culture";
  if (["Trekking", "Water Sports"].includes(tour.category)) return "adventure";
  if (["Nature", "Island Trips"].includes(tour.category)) return "nature";
  if (tour.category === "Experience Days") return "family";
  return "driver";
}

export function matchesTourCollection(tour: Pick<PublicTourCard, "category" | "slug">, collection?: string) {
  return !collection || collectionForTour(tour) === collection;
}
