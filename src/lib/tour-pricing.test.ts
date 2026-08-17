import assert from "node:assert/strict";
import test from "node:test";

import { calculatePackageTotal, calculateVariantSupplierCost } from "./tour-pricing";

const vehicleTier = [{ minPax: 1, maxPax: 6, perPersonIdr: 700_000 }];

test("vehicle pricing stays fixed from one through six guests", () => {
  assert.equal(calculatePackageTotal({ pricingMode: "PER_VEHICLE", pricingTiers: vehicleTier, pax: 1 }), 700_000);
  assert.equal(calculatePackageTotal({ pricingMode: "PER_VEHICLE", pricingTiers: vehicleTier, pax: 6 }), 700_000);
});

test("tandem supplier cost uses solo cost for an odd traveler", () => {
  assert.equal(calculateVariantSupplierCost({ supplierUnitCostIdr: 375_000, guestsPerUnit: 2, remainderCostIdr: 275_000 }, 2), 375_000);
  assert.equal(calculateVariantSupplierCost({ supplierUnitCostIdr: 375_000, guestsPerUnit: 2, remainderCostIdr: 275_000 }, 3), 650_000);
});

test("per-person pricing still multiplies the selected tier", () => {
  const tiers = [{ minPax: 1, maxPax: 6, perPersonIdr: 725_000 }];
  assert.equal(calculatePackageTotal({ pricingMode: "PER_PERSON", pricingTiers: tiers, pax: 3 }), 2_175_000);
});
