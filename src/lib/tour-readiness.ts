import { paidPickupAreas, pickupAddonCode } from "@/lib/pickup-areas";

export type TourReadinessStatus = "READY" | "NEEDS_ATTENTION" | "DRAFT";

export interface TourReadinessIssue {
  code: string;
  message: string;
}

export interface TourReadinessInput {
  published: boolean;
  pricingMode: "PER_PERSON" | "PER_VEHICLE";
  baseCostIdr: number | null;
  perPaxCostIdr: number | null;
  maxGroupSize: number;
  images: string[];
  imageAlts: string[];
  inclusions: string[];
  exclusions: string[];
  meetingPoint: string;
  cancellationPolicy: string;
  itinerary: Array<{ timeLabel: string; title: string; description: string }>;
  pricingTiers: Array<{ minPax: number; maxPax: number; perPersonIdr: number }>;
  addons: Array<{ code: string; costPriceIdr: number | null; active: boolean }>;
  variants: Array<{ isDefault: boolean; active: boolean }>;
  openDateCount: number;
}

function validImageUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function pricingCoversGroup(tiers: TourReadinessInput["pricingTiers"], maxGroupSize: number) {
  const ordered = tiers.toSorted((a, b) => a.minPax - b.minPax);
  return Boolean(
    ordered.length
      && ordered[0].minPax === 1
      && ordered.every((tier, index) => tier.maxPax >= tier.minPax && (index === 0 || tier.minPax === ordered[index - 1].maxPax + 1))
      && ordered.at(-1)!.maxPax >= maxGroupSize,
  );
}

export function evaluateTourReadiness(tour: TourReadinessInput) {
  const issues: TourReadinessIssue[] = [];
  const activeAddons = tour.addons.filter((addon) => addon.active);
  const activeVariants = tour.variants.filter((variant) => variant.active);

  if (!tour.images.length || tour.images.some((image) => !validImageUrl(image)) || tour.imageAlts.length !== tour.images.length || tour.imageAlts.some((alt) => !alt.trim())) {
    issues.push({ code: "IMAGES", message: "Add valid images with one description for each image" });
  }
  if (!tour.itinerary.length || tour.itinerary.some((stop) => !stop.timeLabel.trim() || !stop.title.trim() || !stop.description.trim())) {
    issues.push({ code: "ITINERARY", message: "Complete the route itinerary" });
  }
  if (!tour.inclusions.length || !tour.exclusions.length) {
    issues.push({ code: "INCLUSIONS", message: "List both inclusions and exclusions" });
  }
  if (!tour.meetingPoint.trim() || !tour.cancellationPolicy.trim()) {
    issues.push({ code: "TERMS", message: "Complete pickup and cancellation details" });
  }
  if (!pricingCoversGroup(tour.pricingTiers, tour.maxGroupSize)) {
    issues.push({ code: "PRICING", message: `Cover every group size from 1 to ${tour.maxGroupSize}` });
  }
  if (tour.baseCostIdr === null) {
    issues.push({ code: "BASE_COST", message: "Enter the driver or fixed supplier cost" });
  }
  if (tour.pricingMode === "PER_PERSON" && tour.perPaxCostIdr === null && activeVariants.length === 0) {
    issues.push({ code: "PAX_COST", message: "Enter the supplier cost per traveler" });
  }
  if (activeAddons.some((addon) => addon.costPriceIdr === null)) {
    issues.push({ code: "ADDON_COST", message: "Enter the internal cost for every active add-on" });
  }
  if (activeVariants.length && activeVariants.filter((variant) => variant.isDefault).length !== 1) {
    issues.push({ code: "DEFAULT_VARIANT", message: "Choose one default active package option" });
  }

  const configuredAddonCodes = new Set(tour.addons.map((addon) => addon.code));
  const missingPickupAreas = paidPickupAreas.filter((area) => !configuredAddonCodes.has(pickupAddonCode(area.code)));
  if (missingPickupAreas.length) {
    issues.push({ code: "PICKUP_RULES", message: `Set pickup rules for ${missingPickupAreas.map((area) => area.label).join(", ")}` });
  }
  if (tour.openDateCount === 0) {
    issues.push({ code: "AVAILABILITY", message: "Open at least one future booking date" });
  }

  const status: TourReadinessStatus = !tour.published ? "DRAFT" : issues.length ? "NEEDS_ATTENTION" : "READY";
  return { status, issues };
}
