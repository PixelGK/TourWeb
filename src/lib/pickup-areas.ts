export const pickupAreas = [
  { code: "ubud", label: "Ubud", included: true },
  { code: "kuta", label: "Kuta", included: false },
  { code: "canggu", label: "Canggu", included: false },
  { code: "uluwatu", label: "Uluwatu", included: false },
  { code: "seminyak", label: "Seminyak", included: false },
  { code: "sanur", label: "Sanur", included: false },
  { code: "nusa-dua", label: "Nusa Dua", included: false },
  { code: "jimbaran", label: "Jimbaran", included: false },
] as const;

export const pickupAreaCodes = pickupAreas.map((area) => area.code) as [
  (typeof pickupAreas)[number]["code"],
  ...(typeof pickupAreas)[number]["code"][],
];

export const paidPickupAreas = pickupAreas.filter((area) => !area.included);

export type PickupAreaCode = (typeof pickupAreas)[number]["code"];

export function pickupAddonCode(areaCode: PickupAreaCode) {
  return `pickup-${areaCode}`;
}

export function pickupAreaLabel(areaCode: PickupAreaCode) {
  return pickupAreas.find((area) => area.code === areaCode)?.label ?? areaCode;
}
