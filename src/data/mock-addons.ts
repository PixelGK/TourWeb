export interface MockAddon {
  code: string;
  title: string;
  description: string;
  priceIdr: number;
  pricingMode: "PER_PERSON" | "PER_BOOKING";
}

const activityAddons: MockAddon[] = [
  { code: "weather-jacket", title: "Weather jacket rental", description: "A clean outer layer sized for each traveler—useful for early mountain starts.", priceIdr: 75000, pricingMode: "PER_PERSON" },
  { code: "local-lunch", title: "Lunch included", description: "A pre-arranged Indonesian lunch with vegetarian options, reserved so the day keeps moving.", priceIdr: 180000, pricingMode: "PER_PERSON" },
];

const roadTripAddons: MockAddon[] = [
  { code: "child-seat", title: "Child safety seat", description: "Age-appropriate seat fitted before pickup. We’ll confirm the child’s age and weight.", priceIdr: 100000, pricingMode: "PER_BOOKING" },
  { code: "local-lunch", title: "Lunch included", description: "A pre-arranged Indonesian lunch with vegetarian options at a vetted local stop.", priceIdr: 180000, pricingMode: "PER_PERSON" },
];

const childSeatAddon: MockAddon = { code: "child-seat", title: "Child safety seat", description: "Age-appropriate seat fitted before pickup. We’ll confirm the child’s age and weight.", priceIdr: 100000, pricingMode: "PER_BOOKING" };
const lunchAddon: MockAddon = { code: "local-lunch", title: "Lunch included", description: "A pre-arranged Indonesian lunch with vegetarian options at a vetted local stop.", priceIdr: 180000, pricingMode: "PER_PERSON" };
const childSeatOnlySlugs = new Set([
  "waterbom-bali-single-day-pass",
  "uluwatu-kecak-jimbaran-evening",
  "ubud-market-cooking-class",
  "blue-lagoon-snorkeling-tenganan",
  "sidemen-cycling-village-lunch",
]);

export function getMockAddons(category: string, slug?: string) {
  if (slug && childSeatOnlySlugs.has(slug)) return [childSeatAddon];
  if (category === "Experience Days") {
    return [childSeatAddon, lunchAddon];
  }
  return category === "Trekking" || category === "Water Sports" || category === "Island Trips" ? activityAddons : roadTripAddons;
}
