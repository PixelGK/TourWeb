import type { MockTour } from "@/data/mock-tours";

export interface TourGalleryImage {
  src: string;
  alt: string;
}

export interface ItineraryStop {
  time: string;
  title: string;
  description: string;
}

export interface PricingTier {
  minPax: number;
  maxPax: number;
  perPersonIdr: number;
}

export interface TourReview {
  author: string;
  country: string;
  rating: number;
  date: string;
  body: string;
}

export interface MockTourDetail extends MockTour {
  summary: string;
  gallery: TourGalleryImage[];
  itinerary: ItineraryStop[];
  inclusions: string[];
  exclusions: string[];
  pricingTiers: PricingTier[];
  meetingPoint: string;
  meetingNote: string;
  cancellationPolicy: string;
  maxGroupSize: number;
  reviews: TourReview[];
}

const imageLibrary = {
  baturRidge: "https://images.unsplash.com/photo-1761566688762-d4c3259899af?auto=format&fit=crop&w=1400&q=82",
  baturSilhouette: "https://images.unsplash.com/photo-1489493459015-55d3e7ddda71?auto=format&fit=crop&w=1400&q=82",
  baturClouds: "https://images.unsplash.com/photo-1698937609220-24e06a0bcf47?auto=format&fit=crop&w=1400&q=82",
  terraces: "https://images.unsplash.com/photo-1557093793-d149a38a1be8?auto=format&fit=crop&w=1400&q=82",
  jalan: "https://images.unsplash.com/photo-1729591793272-2d4ae68d6255?auto=format&fit=crop&w=1400&q=82",
  temple: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=82",
  tanahLot: "https://images.unsplash.com/photo-1555865138-193ba536d7e0?auto=format&fit=crop&w=1400&q=82",
  waterfall: "https://images.unsplash.com/photo-1554931670-4ebfabf6e7a9?auto=format&fit=crop&w=1400&q=82",
  nusa: "https://images.unsplash.com/photo-1559279603-792f90ea70d8?auto=format&fit=crop&w=1400&q=82",
  surf: "https://images.unsplash.com/photo-1598580420420-a553ba1f442c?auto=format&fit=crop&w=1400&q=82",
  snorkel: "https://images.unsplash.com/photo-1756312091180-b591dd1559de?auto=format&fit=crop&w=1400&q=82",
  raftingAction: "https://images.unsplash.com/photo-1760904652241-36ad6b4e752f?auto=format&fit=crop&w=1400&q=82",
  raftingTeam: "https://images.unsplash.com/photo-1760904591523-b70b6bceeb1e?auto=format&fit=crop&w=1400&q=82",
  atv: "https://images.unsplash.com/photo-1506797848948-339596317992?auto=format&fit=crop&w=1400&q=82",
  coffee: "https://images.unsplash.com/photo-1754164257813-4cb6c35968e6?auto=format&fit=crop&w=1400&q=82",
  terracesWide: "https://images.unsplash.com/photo-1746932715288-649222986ea9?auto=format&fit=crop&w=1400&q=82",
  safari: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=82",
  elephant: "https://images.unsplash.com/photo-1757343652094-16e82e7eb086?auto=format&fit=crop&w=1400&q=82",
  lion: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1400&q=82",
  giraffe: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1400&q=82",
  waterpark: "https://images.unsplash.com/photo-1708157730402-67cc5b19e335?auto=format&fit=crop&w=1400&q=82",
  waterparkAerial: "https://images.unsplash.com/photo-1763051338904-e2434c7dd20a?auto=format&fit=crop&w=1400&q=82",
};

interface TourContentOverride {
  summary: string;
  itinerary: ItineraryStop[];
  inclusions: string[];
  exclusions: string[];
  pricingTiers?: PricingTier[];
  meetingPoint?: string;
  meetingNote?: string;
  cancellationPolicy?: string;
}

const tourContentOverrides: Record<string, TourContentOverride> = {
  "ayung-river-rafting-ubud": {
    summary: "Paddle a scenic section of the Ayung with a trained rafting team, then shower and change before your private transfer back—an active half-day without a shared hotel shuttle.",
    itinerary: [
      { time: "08:00", title: "Private hotel pickup", description: "Meet your driver and travel directly to the rafting base near Ubud." },
      { time: "09:30", title: "Equipment and river briefing", description: "Change, fit your helmet and life jacket, then cover paddle commands and river safety with the rafting team." },
      { time: "10:00", title: "Ayung River descent", description: "Paddle through forested gorge scenery with guided breaks along the route." },
      { time: "12:15", title: "Shower, change and return", description: "Use the base facilities, choose the included-lunch add-on or eat where you prefer, then return by private car." },
    ],
    inclusions: ["Private hotel transfer", "Rafting guide and river equipment", "Helmet and life jacket", "Shower and changing facilities", "Towel", "Drinking water"],
    exclusions: ["Lunch unless selected as an add-on", "Personal travel insurance", "Waterproof phone case", "Gratuities"],
  },
  "ubud-atv-jungle-trail": {
    summary: "Ride a guided ATV route through forest and village tracks outside Ubud, with private hotel transfers and time to clean up before heading back.",
    itinerary: [
      { time: "08:00", title: "Private hotel pickup", description: "Travel to the ATV base at a time adjusted to your pickup area." },
      { time: "09:30", title: "Practice track and safety check", description: "Fit a helmet, learn the controls, and complete a short practice before joining the trail." },
      { time: "10:00", title: "Guided ATV trail", description: "Follow the activity guide through varied outdoor terrain at a pace suited to the group." },
      { time: "12:15", title: "Shower and flexible lunch", description: "Clean up, then take the included-lunch option or let your driver suggest a restaurant where you pay directly." },
    ],
    inclusions: ["Private hotel transfer", "Solo or tandem ATV as booked", "Activity guide", "Helmet and safety briefing", "Shower and changing facilities", "Drinking water"],
    exclusions: ["Lunch unless selected as an add-on", "Personal travel insurance", "Replacement clothing", "Gratuities"],
  },
  "ubud-rafting-atv-adventure": {
    summary: "Combine an Ayung rafting run and a guided ATV trail in one well-paced Ubud day, with one private driver coordinating the transfers between both bases.",
    itinerary: [
      { time: "07:30", title: "Private hotel pickup", description: "Leave early enough to complete both activities without rushing the safety briefings." },
      { time: "09:00", title: "Ayung River rafting", description: "Gear up and paddle the guided river section before showering and changing at the base." },
      { time: "12:00", title: "Lunch and activity transfer", description: "Have the pre-arranged lunch or choose another stop, then continue by private car to the ATV base." },
      { time: "14:00", title: "Guided ATV trail", description: "Complete a practice lap, then follow the guide through the afternoon trail route." },
      { time: "16:30", title: "Shower and hotel return", description: "Clean up and travel directly back to your accommodation." },
    ],
    inclusions: ["Private hotel and activity transfers", "Rafting guide and equipment", "ATV and activity guide", "Required helmets and life jacket", "Shower facilities and towel", "Drinking water"],
    exclusions: ["Lunch unless selected as an add-on", "Personal travel insurance", "Waterproof phone case", "Gratuities"],
  },
  "tegalalang-swing-coffee-route": {
    summary: "See Tegalalang before the busiest hours, choose a swing experience only if it suits you, and visit a small coffee garden without commission-led pressure to buy.",
    itinerary: [
      { time: "07:30", title: "Private hotel pickup", description: "Start early to reach Tegalalang while the paths are cooler and quieter." },
      { time: "08:45", title: "Tegalalang terrace walk", description: "Explore viewpoints and selected paths with enough time for photos and the working landscape." },
      { time: "10:45", title: "Optional Bali swing", description: "Choose a swing package after seeing the published price, or skip it and spend longer around the terraces." },
      { time: "12:15", title: "Coffee garden and tasting", description: "Walk through the plants and try a standard tasting. No civet handling or animal photo session is included." },
      { time: "14:00", title: "Flexible Ubud stop and return", description: "Add one realistic Ubud stop or return early, depending on your pace." },
    ],
    inclusions: ["Private air-conditioned vehicle", "English-speaking local driver", "Hotel pickup and drop-off", "Parking and fuel", "Standard coffee and tea tasting", "Drinking water"],
    exclusions: ["Rice-terrace entrance or local donations", "Swing admission", "Premium coffee purchases", "Meals", "Gratuities"],
  },
  "tegalalang-terraces-coffee-morning": {
    summary: "A shorter private morning for travelers who want Tegalalang and a coffee-garden visit without filling the day with extra stops or animal encounters.",
    itinerary: [
      { time: "07:30", title: "Private hotel pickup", description: "Your driver times the start around your hotel and morning traffic." },
      { time: "08:30", title: "Tegalalang terrace walk", description: "Take an unhurried look at the terraces before the main day-tour groups arrive." },
      { time: "10:30", title: "Coffee plants and tasting", description: "See how coffee and spices grow, followed by a standard tasting with no civet handling." },
      { time: "12:00", title: "Hotel or Ubud drop-off", description: "Return to your accommodation or finish near central Ubud by prior arrangement." },
    ],
    inclusions: ["Private air-conditioned vehicle", "English-speaking local driver", "Hotel pickup or Ubud drop-off", "Parking and fuel", "Standard coffee and tea tasting", "Drinking water"],
    exclusions: ["Rice-terrace entrance or local donations", "Premium coffee purchases", "Meals", "Personal travel insurance", "Gratuities"],
  },
  "bali-safari-day-admission": {
    summary: "Reserve dated daytime admission for Taman Safari Bali, with your e-ticket confirmation sent by email and WhatsApp. Add a private hotel transfer if you want BaliXperience to arrange the whole journey.",
    itinerary: [
      { time: "Before your visit", title: "Receive the confirmed e-ticket", description: "BaliXperience checks the selected date with the supplier and sends the final voucher and entry instructions." },
      { time: "09:00", title: "Present your voucher at entry", description: "Arrive at the Gianyar park and follow the redemption instructions shown on your confirmed ticket." },
      { time: "Morning", title: "Safari and wildlife areas", description: "Explore the daytime park and join the included safari experience for the package named on your voucher." },
      { time: "Afternoon", title: "Shows and remaining exhibits", description: "Plan the rest of the visit around the venue schedule, weather, and animal-welfare requirements." },
      { time: "Before closing", title: "Meet your driver or depart", description: "Use your pre-arranged private transfer or make your own way from the park." },
    ],
    inclusions: ["Dated Bali Safari admission for the package shown on your final voucher", "Digital voucher and redemption instructions", "Supplier availability confirmation", "BaliXperience support by WhatsApp"],
    exclusions: ["Hotel transfer unless selected as an add-on", "Food and drinks", "Paid animal encounters or package upgrades", "Personal travel insurance"],
    pricingTiers: [{ minPax: 1, maxPax: 6, perPersonIdr: 750000 }],
    meetingPoint: "Taman Safari Bali entrance, Gianyar",
    meetingNote: "Bring the confirmed e-ticket and the identification requested on the voucher. Opening hours and included activities can change by date.",
    cancellationPolicy: "Your request is fully refundable before the supplier confirms and issues the e-ticket. Once issued, the venue ticket is non-refundable unless the final voucher states otherwise.",
  },
  "bali-zoo-general-admission": {
    summary: "Book dated general admission for Bali Zoo and receive the confirmed e-ticket by email and WhatsApp. A private return transfer is optional, so you can choose ticket-only or a door-to-door day.",
    itinerary: [
      { time: "Before your visit", title: "Receive the confirmed e-ticket", description: "BaliXperience checks the date and sends the final voucher with the supplier’s redemption instructions." },
      { time: "Opening time", title: "Enter Bali Zoo", description: "Present the voucher at the entrance in Singapadu and follow any identification requirements shown on it." },
      { time: "Morning", title: "Explore the animal habitats", description: "Walk the main zoo areas at your own pace and check the daily venue schedule on arrival." },
      { time: "Afternoon", title: "Continue or meet your driver", description: "Stay until you are ready to leave, then use the optional private transfer or your own transport." },
    ],
    inclusions: ["Dated Bali Zoo general-admission e-ticket", "Digital voucher and redemption instructions", "Supplier availability confirmation", "BaliXperience support by WhatsApp"],
    exclusions: ["Hotel transfer unless selected as an add-on", "Food and drinks", "Breakfast, animal encounters, and other ticket upgrades", "Personal travel insurance"],
    pricingTiers: [{ minPax: 1, maxPax: 6, perPersonIdr: 395000 }],
    meetingPoint: "Bali Zoo entrance, Singapadu",
    meetingNote: "Bring the confirmed voucher and any identification named in the redemption instructions. Package inclusions follow the final e-ticket.",
    cancellationPolicy: "Your request is fully refundable before the supplier confirms and issues the e-ticket. Once issued, the venue ticket follows the supplier’s cancellation and rescheduling rules shown on the voucher.",
  },
  "waterbom-bali-single-day-pass": {
    summary: "Reserve a dated Waterbom Bali single-day pass for access to the park, slides, and pools. The confirmed e-ticket and redemption instructions are sent by email and WhatsApp.",
    itinerary: [
      { time: "Before your visit", title: "Receive the confirmed e-ticket", description: "BaliXperience checks date capacity and sends the final voucher after supplier confirmation." },
      { time: "Opening time", title: "Enter Waterbom Bali", description: "Present the dated voucher at the Kuta entrance and exchange it for the required entry access." },
      { time: "Full day", title: "Slides, pools, and park time", description: "Use the standard slides and pools included with the single-day pass, subject to venue operations and safety rules." },
      { time: "Before closing", title: "Depart at your own pace", description: "Collect your belongings and use your arranged transfer or make your own way from the park." },
    ],
    inclusions: ["Dated Waterbom Bali single-day admission", "Access to standard park slides and pools", "Digital voucher and redemption instructions", "BaliXperience support by WhatsApp"],
    exclusions: ["Hotel transfer unless selected as an add-on", "Towel, locker, gazebo, FlowRider, spa, and in-park credit", "Food and drinks", "Personal travel insurance"],
    pricingTiers: [{ minPax: 1, maxPax: 6, perPersonIdr: 630000 }],
    meetingPoint: "Waterbom Bali entrance, Kuta",
    meetingNote: "The ticket is valid only for the confirmed visit date. Bring the voucher and any identification required for the selected market rate.",
    cancellationPolicy: "Waterbom single-day admission is non-refundable after the supplier confirms and issues the e-ticket. If the requested date cannot be confirmed, you may choose another date or receive a full refund.",
  },
};

const categoryItineraries: Record<string, ItineraryStop[]> = {
  Trekking: [
    { time: "02:00", title: "Private hotel pickup", description: "Meet your driver in the hotel lobby. Pickup time is adjusted to your area so you reach the trail before the crowds." },
    { time: "03:30", title: "Trail briefing at Toya Bungkah", description: "Meet the local trekking guide, collect a head torch and walking stick, and review the route and weather." },
    { time: "04:00", title: "Begin the ascent", description: "Climb at a steady private-group pace with breaks whenever you need them. The ascent normally takes 90–120 minutes." },
    { time: "05:50", title: "Sunrise breakfast at the summit", description: "Find a quieter viewpoint while your guide prepares a simple warm breakfast and hot drink." },
    { time: "07:15", title: "Crater rim and descent", description: "Walk part of the volcanic rim, see the steam vents, and descend by the safest route for the day’s conditions." },
    { time: "09:00", title: "Natural hot springs", description: "Change, soak, and recover in the lakeside pools. Towels and changing facilities are included." },
    { time: "11:00", title: "Coffee stop or direct return", description: "Choose a short plantation tasting or head straight back. Typical hotel return is between 12:30 and 14:00." },
  ],
  "Water Sports": [
    { time: "07:00", title: "Hotel pickup", description: "Your driver confirms sea conditions and takes you directly to the departure beach." },
    { time: "08:30", title: "Safety briefing and equipment", description: "Meet the activity team, check equipment fit, and review the route and water conditions." },
    { time: "09:00", title: "First water session", description: "Enter with your guide and move at the group’s pace, with breaks for orientation and photos." },
    { time: "11:30", title: "Lunch and reset", description: "A relaxed local lunch break before the afternoon session or coastal stop." },
    { time: "13:00", title: "Second activity or beach time", description: "Continue to the next spot if conditions allow, or enjoy extra time on shore." },
    { time: "16:00", title: "Private return transfer", description: "Change into dry clothes and return directly to your accommodation." },
  ],
  "Cultural Tours": [
    { time: "08:00", title: "Hotel pickup", description: "Meet your driver and review the route, dress requirements, and any timing preferences." },
    { time: "09:15", title: "First temple visit", description: "Arrive before peak groups and explore with time for context, questions, and respectful photography." },
    { time: "11:00", title: "Village and landscape stop", description: "Continue through working rice fields and small villages rather than rushing between landmarks." },
    { time: "12:30", title: "Lunch with a view", description: "Choose from a few vetted local options; lunch is paid directly so you control the budget." },
    { time: "14:00", title: "Water temple or palace", description: "Spend the afternoon at the route’s main cultural site with flexible time to explore." },
    { time: "16:30", title: "Sunset or hotel return", description: "Finish at the planned sunset stop, or return earlier if you prefer a shorter day." },
  ],
  Nature: [
    { time: "06:30", title: "Early hotel pickup", description: "Leave before day-trip traffic and drive north through Bali’s highlands." },
    { time: "09:00", title: "Village trail briefing", description: "Meet the local guide and prepare for the waterfall trail and changing conditions." },
    { time: "09:30", title: "Waterfall descent", description: "Walk through forest and working farms, stopping at viewpoints before reaching the falls." },
    { time: "12:00", title: "Local lunch", description: "Refuel at a small family-run restaurant near the trail." },
    { time: "13:30", title: "Highland lake and temple", description: "Continue through the cooler central highlands with a flexible final stop." },
    { time: "16:00", title: "Return to your hotel", description: "Travel back by the clearest route for the day’s traffic." },
  ],
  "Island Trips": [
    { time: "06:00", title: "Hotel pickup and harbor transfer", description: "Your driver takes you to Sanur with enough time for check-in without rushing." },
    { time: "07:30", title: "Fast boat to Nusa Penida", description: "Board the morning crossing; your island driver meets you at arrival." },
    { time: "09:00", title: "Clifftop viewpoints", description: "Visit the west-coast viewpoints in a route ordered around traffic rather than a fixed checklist." },
    { time: "12:00", title: "Local lunch", description: "Pause at a vetted restaurant with vegetarian options available." },
    { time: "13:30", title: "Beach or snorkeling time", description: "Choose a relaxed beach stop or a pre-arranged water activity." },
    { time: "16:30", title: "Boat and hotel return", description: "Return to Sanur where your original driver is waiting for the hotel transfer." },
  ],
  "Car Charter": [
    { time: "08:00", title: "Meet your private driver", description: "Start at your hotel and confirm the day’s priorities before setting off." },
    { time: "09:00", title: "First chosen stop", description: "Visit the place that matters most while the day is cooler and quieter." },
    { time: "11:30", title: "Flexible second stop", description: "Your driver adjusts the route for traffic, weather, and how long you want to stay." },
    { time: "13:00", title: "Lunch recommendation", description: "Choose local, scenic, or quick—there is no commission-driven restaurant stop." },
    { time: "14:30", title: "Afternoon route", description: "Continue to one or two realistic stops without spending the day inside the car." },
    { time: "18:00", title: "Hotel drop-off", description: "Return to your hotel or finish at a dinner area by prior arrangement." },
  ],
  "Custom Tour": [
    { time: "08:00", title: "Your day begins", description: "Pickup is arranged around your hotel, preferred pace, and first planned stop." },
    { time: "09:00", title: "Priority experience", description: "Start with the place or activity you care about most, before adding optional stops." },
    { time: "12:30", title: "Lunch your way", description: "Choose the style and budget; recommendations are shared before the day." },
    { time: "14:00", title: "Flexible afternoon", description: "Adjust the route based on weather, energy, and what you enjoyed in the morning." },
    { time: "17:00", title: "Sunset or early return", description: "Finish with a planned viewpoint or head back when you have had enough." },
  ],
  "Multi-Day Trips": [
    { time: "Day 1 · 08:00", title: "Central Bali and highlands", description: "Leave the busy south, explore a balanced cultural route, and finish near the next day’s starting point." },
    { time: "Day 2 · 07:30", title: "North or east Bali", description: "Use the overnight location to reach waterfalls, temples, or coast before day-trip traffic." },
    { time: "Day 3 · 08:00", title: "Unhurried return route", description: "Choose the final stops around your onward hotel, airport plans, and energy level." },
  ],
  "Attraction Tickets": [
    { time: "Before your visit", title: "Receive your confirmed voucher", description: "The dated e-ticket and redemption details are sent after supplier confirmation." },
    { time: "On the day", title: "Present the e-ticket", description: "Follow the identification and redemption instructions shown on the final voucher." },
    { time: "During opening hours", title: "Enjoy the attraction", description: "Use the inclusions shown on the selected package and follow the venue’s safety rules." },
  ],
};

function roundToFiftyThousand(value: number) {
  return Math.round(value / 50000) * 50000;
}

function buildPricing(basePrice: number): PricingTier[] {
  return [
    { minPax: 1, maxPax: 1, perPersonIdr: roundToFiftyThousand(basePrice * 1.35) },
    { minPax: 2, maxPax: 2, perPersonIdr: basePrice },
    { minPax: 3, maxPax: 4, perPersonIdr: roundToFiftyThousand(basePrice * 0.88) },
    { minPax: 5, maxPax: 6, perPersonIdr: roundToFiftyThousand(basePrice * 0.78) },
  ];
}

function galleryFor(tour: MockTour): TourGalleryImage[] {
  const main = { src: tour.image.replace("w=1200", "w=1600"), alt: tour.imageAlt };

  if (tour.slug === "ayung-river-rafting-ubud" || tour.slug === "ubud-rafting-atv-adventure") return [
    main,
    { src: imageLibrary.raftingAction, alt: "A rafting team paddling through a rocky river section" },
    { src: imageLibrary.raftingTeam, alt: "Travelers working together in a white-water raft" },
    { src: imageLibrary.atv, alt: "A rider navigating an ATV on an outdoor trail" },
  ];
  if (tour.slug === "ubud-atv-jungle-trail") return [
    main,
    { src: imageLibrary.atv, alt: "A rider navigating an ATV on an outdoor trail" },
    { src: imageLibrary.terraces, alt: "Working rice terraces and tropical greenery near Ubud" },
    { src: imageLibrary.jalan, alt: "A quiet route between palms and Bali rice fields" },
  ];
  if (tour.slug === "tegalalang-swing-coffee-route" || tour.slug === "tegalalang-terraces-coffee-morning") return [
    main,
    { src: imageLibrary.terracesWide, alt: "Green rice terraces cascading down a Tegalalang hillside" },
    { src: imageLibrary.terraces, alt: "Layered working rice terraces in Ubud" },
    { src: imageLibrary.coffee, alt: "Coffee cherries growing among glossy green leaves" },
  ];
  if (tour.slug === "bali-safari-day-admission" || tour.slug === "bali-zoo-general-admission") return [
    main,
    { src: imageLibrary.safari, alt: "Zebras seen during a safari-style wildlife visit" },
    { src: imageLibrary.lion, alt: "A lion resting in a wildlife park" },
    { src: imageLibrary.giraffe, alt: "A giraffe standing against an open sky" },
  ];
  if (tour.slug === "waterbom-bali-single-day-pass") return [
    main,
    { src: imageLibrary.waterpark, alt: "A water park pool and slide area" },
    { src: imageLibrary.waterparkAerial, alt: "An aerial view of pools and water slides" },
    { src: imageLibrary.surf, alt: "Tropical water and palms in Bali" },
  ];

  if (tour.category === "Trekking") return [
    main,
    { src: imageLibrary.baturRidge, alt: "Hikers moving along a misty volcanic ridge at sunrise" },
    { src: imageLibrary.baturClouds, alt: "Warm sunrise light above clouds at Mount Batur" },
    { src: imageLibrary.baturSilhouette, alt: "Silhouette of Mount Batur beneath a bright morning sky" },
  ];
  if (tour.category === "Water Sports" || tour.category === "Island Trips") return [
    main,
    { src: imageLibrary.nusa, alt: "Steep green cliffs and turquoise sea at Nusa Penida" },
    { src: imageLibrary.snorkel, alt: "Travelers snorkeling in clear blue water near Bali" },
    { src: imageLibrary.surf, alt: "Surfers waiting beyond the break off Bali" },
  ];
  if (tour.category === "Cultural Tours") return [
    main,
    { src: imageLibrary.temple, alt: "Balinese temple buildings reflected in still water" },
    { src: imageLibrary.tanahLot, alt: "Tanah Lot temple on its rocky coastal island" },
    { src: imageLibrary.terraces, alt: "Layered rice terraces in Ubud" },
  ];
  return [
    main,
    { src: imageLibrary.waterfall, alt: "Tall waterfall surrounded by dense Bali forest" },
    { src: imageLibrary.terraces, alt: "Working rice terraces in Bali" },
    { src: imageLibrary.jalan, alt: "A quiet road between palms and rice fields" },
  ];
}

export function getTourDetail(tour: MockTour): MockTourDetail {
  const isTrek = tour.category === "Trekking";
  const contentOverride = tourContentOverrides[tour.slug];
  const categoryItinerary = categoryItineraries[tour.category] ?? categoryItineraries["Custom Tour"];
  const defaultItinerary = tour.category === "Multi-Day Trips" && tour.durationHours <= 48
    ? categoryItinerary.slice(0, 2)
    : categoryItinerary;

  return {
    ...tour,
    summary: contentOverride?.summary ?? (isTrek
      ? "Climb Mount Batur with a private local guide, watch sunrise from a quieter summit viewpoint, then recover in the lakeside hot springs before your private transfer home."
      : `Spend ${tour.duration.toLowerCase()} around ${tour.location} with a private driver. We confirm the pickup time on WhatsApp, and you can adjust optional stops before the day.`),
    gallery: galleryFor(tour),
    itinerary: contentOverride?.itinerary ?? defaultItinerary,
    inclusions: contentOverride?.inclusions ?? (isTrek
      ? ["Private air-conditioned hotel transfer", "Licensed local trekking guide", "Head torch and walking stick", "Simple summit breakfast and hot drink", "Hot-spring entry and towel", "Drinking water"]
      : ["Private air-conditioned vehicle", "English-speaking local driver", "Hotel pickup and drop-off", "Parking and fuel", "Drinking water", "Route planning by WhatsApp"]),
    exclusions: contentOverride?.exclusions ?? (isTrek
      ? ["Lunch after the hot springs", "Personal travel insurance", "Optional coffee purchases", "Gratuities"]
      : ["Attraction entrance tickets unless stated", "Meals and personal purchases", "Personal travel insurance", "Gratuities"]),
    pricingTiers: contentOverride?.pricingTiers ?? buildPricing(tour.priceIdr),
    meetingPoint: contentOverride?.meetingPoint ?? "Your hotel or villa lobby",
    meetingNote: contentOverride?.meetingNote ?? `Pickup is included in the main Bali service areas. The exact time for ${tour.location} is confirmed by WhatsApp the evening before. Remote pickups may require a clearly quoted supplement.`,
    cancellationPolicy: contentOverride?.cancellationPolicy ?? "Cancel at least 24 hours before pickup for a full refund. Cancellations within 24 hours are non-refundable. If unsafe weather or local restrictions prevent the tour from operating, you may reschedule or receive a full refund.",
    maxGroupSize: 6,
    reviews: [
      { author: "Maya R.", country: "Australia", rating: 5, date: "July 2026", body: "The pickup instructions were exact and we never felt rushed. Our guide found a quieter place for sunrise and checked in with us throughout the climb." },
      { author: "Jonas K.", country: "Germany", rating: 5, date: "June 2026", body: "Clear price, quick WhatsApp replies, and a very comfortable drive back. It felt much more personal than the large groups around us." },
      { author: "Priya S.", country: "Singapore", rating: 4.8, date: "May 2026", body: "A long day, but the pacing was good and every inclusion matched the listing. The hot springs after the activity were the right finish." },
    ],
  };
}
