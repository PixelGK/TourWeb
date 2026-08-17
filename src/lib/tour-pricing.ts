import type { PricingTier, PublicTourVariant, TourPricingMode } from "@/types/public-tour";

export function getTierPrice(tiers: PricingTier[], pax: number) {
  return tiers.find((tier) => pax >= tier.minPax && pax <= tier.maxPax)?.perPersonIdr
    ?? tiers.at(-1)?.perPersonIdr
    ?? 0;
}

export function calculateVariantPriceAdjustment(variant: Pick<PublicTourVariant, "priceAdjustmentIdr"> | null | undefined, pax: number) {
  return (variant?.priceAdjustmentIdr ?? 0) * pax;
}

export function calculateVariantSupplierCost(variant: { supplierUnitCostIdr: number; guestsPerUnit: number; remainderCostIdr: number }, pax: number) {
  const fullUnits = Math.floor(pax / variant.guestsPerUnit);
  const remainder = pax % variant.guestsPerUnit;
  return fullUnits * variant.supplierUnitCostIdr + (remainder ? variant.remainderCostIdr : 0);
}

export function calculatePackageTotal({
  pricingMode,
  pricingTiers,
  pax,
  adultCount = pax,
  childCount = 0,
  childPriceIdr = null,
}: {
  pricingMode: TourPricingMode;
  pricingTiers: PricingTier[];
  pax: number;
  adultCount?: number;
  childCount?: number;
  childPriceIdr?: number | null;
}) {
  const tierPrice = getTierPrice(pricingTiers, pax);
  if (pricingMode === "PER_VEHICLE") return tierPrice;
  return tierPrice * adultCount + (childPriceIdr ?? tierPrice) * childCount;
}
