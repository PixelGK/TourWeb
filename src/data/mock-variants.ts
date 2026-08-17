import type { PublicTourVariant } from "@/types/public-tour";

export const atvVariants: PublicTourVariant[] = [
  { code: "standard-solo", title: "Standard · solo ATV", description: "One standard ATV for each traveler.", priceAdjustmentIdr: 0, guestsPerUnit: 1, isDefault: true },
  { code: "standard-tandem", title: "Standard · shared ATV", description: "Two travelers share one standard ATV. Groups need at least two people.", priceAdjustmentIdr: -75_000, guestsPerUnit: 2, isDefault: false },
  { code: "premium-solo", title: "Premium · solo ATV", description: "One upgraded premium ATV for each traveler.", priceAdjustmentIdr: 350_000, guestsPerUnit: 1, isDefault: false },
  { code: "premium-tandem", title: "Premium · shared ATV", description: "Two travelers share one premium ATV. Groups need at least two people.", priceAdjustmentIdr: 175_000, guestsPerUnit: 2, isDefault: false },
];

export function getMockVariants(slug: string) {
  return slug === "ubud-atv-jungle-trail" ? atvVariants : [];
}
