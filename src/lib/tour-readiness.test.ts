import assert from "node:assert/strict";
import test from "node:test";

import { paidPickupAreas, pickupAddonCode } from "@/lib/pickup-areas";
import { evaluateTourReadiness, type TourReadinessInput } from "@/lib/tour-readiness";

function completeTour(overrides: Partial<TourReadinessInput> = {}): TourReadinessInput {
  return {
    published: true,
    pricingMode: "PER_VEHICLE",
    baseCostIdr: 500_000,
    perPaxCostIdr: null,
    maxGroupSize: 6,
    images: ["https://images.example.com/bali.jpg"],
    imageAlts: ["Rice terraces near Ubud"],
    inclusions: ["Private vehicle"],
    exclusions: ["Personal expenses"],
    meetingPoint: "Hotel lobby",
    cancellationPolicy: "Cancel at least 24 hours before pickup.",
    itinerary: [{ timeLabel: "08:00", title: "Pickup", description: "Meet your driver in the lobby." }],
    pricingTiers: [{ minPax: 1, maxPax: 6, perPersonIdr: 950_000 }],
    addons: paidPickupAreas.map((area) => ({ code: pickupAddonCode(area.code), costPriceIdr: 100_000, active: true })),
    variants: [],
    openDateCount: 30,
    ...overrides,
  };
}

test("a complete published tour is ready", () => {
  assert.deepEqual(evaluateTourReadiness(completeTour()), { status: "READY", issues: [] });
});

test("a draft remains a draft while retaining actionable issues", () => {
  const result = evaluateTourReadiness(completeTour({ published: false, baseCostIdr: null }));
  assert.equal(result.status, "DRAFT");
  assert.ok(result.issues.some((issue) => issue.code === "BASE_COST"));
});

test("pricing gaps and missing pickup areas are reported", () => {
  const result = evaluateTourReadiness(completeTour({ pricingTiers: [{ minPax: 2, maxPax: 6, perPersonIdr: 950_000 }], addons: [] }));
  assert.equal(result.status, "NEEDS_ATTENTION");
  assert.ok(result.issues.some((issue) => issue.code === "PRICING"));
  assert.ok(result.issues.some((issue) => issue.code === "PICKUP_RULES"));
});
