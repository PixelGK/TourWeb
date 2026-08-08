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

export function getMockAddons(category: string) {
  return category === "Trekking" || category === "Water Sports" || category === "Island Trips" ? activityAddons : roadTripAddons;
}
