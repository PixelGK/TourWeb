import assert from "node:assert/strict";
import test from "node:test";

import { checkoutRequestSchema } from "./checkout-validation";

function request(overrides: Record<string, unknown> = {}) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  return {
    tourSlug: "private-car-charter-bali",
    date: date.toISOString().slice(0, 10),
    pax: 2,
    adultCount: 2,
    childCount: 0,
    addonCodes: [],
    pickupArea: "ubud",
    termsAccepted: true,
    traveler: {
      name: "Ayu Traveler",
      email: "ayu@example.com",
      phone: "+62 812 555 0101",
      country: "Indonesia",
      hotelName: "Ubud hotel",
      notes: "",
    },
    ...overrides,
  };
}

test("free Ubud pickup does not require a surcharge add-on", () => {
  const result = checkoutRequestSchema.safeParse(request());
  assert.equal(result.success, true);
});

test("paid pickup area must match its surcharge add-on", () => {
  const missing = checkoutRequestSchema.safeParse(request({ pickupArea: "kuta" }));
  assert.equal(missing.success, false);

  const matched = checkoutRequestSchema.safeParse(request({ pickupArea: "kuta", addonCodes: ["pickup-kuta"] }));
  assert.equal(matched.success, true);
});

test("traveler counts must equal the total party size", () => {
  const result = checkoutRequestSchema.safeParse(request({ pax: 3 }));
  assert.equal(result.success, false);
});

test("duplicate add-ons are normalized before pricing", () => {
  const result = checkoutRequestSchema.parse(request({ addonCodes: ["local-lunch", "local-lunch"] }));
  assert.deepEqual(result.addonCodes, ["local-lunch"]);
});
