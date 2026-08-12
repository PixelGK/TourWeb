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
    summary: "Make Bali Safari the anchor of a private day rather than a ticket errand: hotel pickup, daytime admission, a driver waiting for you, and an easy coastal stop on the return route are all arranged together.",
    itinerary: [
      { time: "08:00", title: "Private hotel pickup", description: "Your driver collects your group and confirms the park voucher and return plan before departure." },
      { time: "09:30", title: "Bali Safari entry", description: "Use the included dated admission and begin with the safari journey or the most time-sensitive show on the venue schedule." },
      { time: "Late morning", title: "Wildlife areas at your pace", description: "Explore the daytime park without following a shared tour group. Your driver remains reachable while you are inside." },
      { time: "15:30", title: "Meet your driver", description: "Choose the pickup point and time on WhatsApp so you do not have to wait in the exit crowd." },
      { time: "16:00", title: "Keramas coast or direct return", description: "Pause for a drink or early meal near the coast, paid directly, or head back if the family has had enough." },
    ],
    inclusions: ["Private air-conditioned hotel transfer", "Dated Bali Safari daytime admission", "English-speaking local driver", "Parking and fuel", "Driver waiting and WhatsApp coordination", "Drinking water"],
    exclusions: ["Food and drinks", "Paid animal encounters or package upgrades", "Remote-area pickup supplement if applicable", "Personal travel insurance"],
    pricingTiers: [{ minPax: 1, maxPax: 1, perPersonIdr: 1450000 }, { minPax: 2, maxPax: 2, perPersonIdr: 1150000 }, { minPax: 3, maxPax: 4, perPersonIdr: 1050000 }, { minPax: 5, maxPax: 6, perPersonIdr: 950000 }],
    meetingPoint: "Your hotel or villa lobby",
    meetingNote: "The listed rate is a flat package rate per guest. Contact us before booking for infants, very young children, or pickup outside the main Bali service areas.",
    cancellationPolicy: "Cancel before the admission voucher is issued for a full refund. After issue, the admission portion follows the venue's rules and may be non-refundable; any refundable transport portion is returned. If the requested date cannot be confirmed, choose another date or receive a full refund.",
  },
  "bali-zoo-general-admission": {
    summary: "A low-friction family day with Bali Zoo admission, private return transport, and one optional Ubud-area stop chosen around the family's energy—not a long checklist after the zoo.",
    itinerary: [
      { time: "08:30", title: "Private hotel pickup", description: "Child-seat requirements and the zoo voucher are checked before your group leaves." },
      { time: "10:00", title: "Bali Zoo admission", description: "Enter with the included dated admission and plan the visit around the current animal and keeper schedule." },
      { time: "10:15", title: "Explore at the family's pace", description: "Stay together without a shared group timetable. Your driver waits nearby and remains reachable." },
      { time: "14:30", title: "Choose one local layer", description: "Add a short Celuk craft stop, an early Ubud meal, or go straight back—one realistic stop, not three rushed ones." },
      { time: "16:30", title: "Private hotel return", description: "Your driver returns by the clearest route for the afternoon traffic." },
    ],
    inclusions: ["Private air-conditioned hotel transfer", "Dated Bali Zoo general admission", "English-speaking local driver", "Parking and fuel", "One flexible Ubud-area stop", "Drinking water"],
    exclusions: ["Food and drinks", "Breakfast, animal encounters, and ticket upgrades", "Remote-area pickup supplement if applicable", "Personal travel insurance"],
    pricingTiers: [{ minPax: 1, maxPax: 1, perPersonIdr: 1100000 }, { minPax: 2, maxPax: 2, perPersonIdr: 775000 }, { minPax: 3, maxPax: 4, perPersonIdr: 675000 }, { minPax: 5, maxPax: 6, perPersonIdr: 600000 }],
    meetingPoint: "Your hotel or villa lobby",
    meetingNote: "The listed rate is a flat package rate per guest. Tell us the ages of children before booking so we can confirm suitable seating and any infant arrangements.",
    cancellationPolicy: "Cancel before the admission voucher is issued for a full refund. After issue, the admission portion follows Bali Zoo's rules and may be non-refundable; any refundable transport portion is returned. If the requested date cannot be confirmed, choose another date or receive a full refund.",
  },
  "waterbom-bali-single-day-pass": {
    summary: "Turn a Waterbom visit into an easy south-Bali day: dated park admission, private hotel transfers, a driver ready when you finish, and an optional Jimbaran sunset stop on the way back.",
    itinerary: [
      { time: "08:30", title: "Private hotel pickup", description: "Your driver confirms the Waterbom voucher and agrees where to meet when you are ready to leave." },
      { time: "09:30", title: "Waterbom Bali entry", description: "Enter with the included dated single-day pass and store your belongings using the park's current system." },
      { time: "Full day", title: "Slides, pools, and downtime", description: "Use the standard attractions included in the pass and set your own pace inside the park." },
      { time: "16:30", title: "Meet your driver", description: "Message when you have changed and are ready; your return is private, not tied to a shuttle timetable." },
      { time: "17:15", title: "Jimbaran sunset or direct return", description: "Stop at the beach for sunset and choose your own dinner budget, or return directly to the hotel." },
    ],
    inclusions: ["Private air-conditioned hotel transfer", "Dated Waterbom Bali single-day admission", "English-speaking local driver", "Parking and fuel", "Optional Jimbaran sunset stop", "Drinking water in the vehicle"],
    exclusions: ["Towel, locker, gazebo, FlowRider, spa, and in-park credit", "Food and drinks", "Remote-area pickup supplement if applicable", "Personal travel insurance"],
    pricingTiers: [{ minPax: 1, maxPax: 1, perPersonIdr: 1300000 }, { minPax: 2, maxPax: 2, perPersonIdr: 995000 }, { minPax: 3, maxPax: 4, perPersonIdr: 895000 }, { minPax: 5, maxPax: 6, perPersonIdr: 825000 }],
    meetingPoint: "Your hotel or villa lobby",
    meetingNote: "Waterbom can reach capacity in busy periods, so admission is confirmed before the voucher is issued. The package uses one flat guest rate; contact us for infants or special family arrangements.",
    cancellationPolicy: "Cancel before the Waterbom voucher is issued for a full refund. Once issued, the admission portion is non-refundable; any refundable transport portion is returned. If Waterbom cannot confirm the date, choose another date or receive a full refund.",
  },
  "bali-bird-park-batubulan-day": {
    summary: "Pair an unhurried Bali Bird Park visit with private transport and one nearby cultural stop in Batubulan or Celuk, keeping the route compact enough for families.",
    itinerary: [
      { time: "08:30", title: "Private hotel pickup", description: "Leave with the park voucher confirmed and child-seat needs arranged in advance." },
      { time: "10:00", title: "Bali Bird Park", description: "Enter with included admission and follow the current bird, feeding, and educational program at your own pace." },
      { time: "13:30", title: "Lunch where you choose", description: "Your driver suggests a few nearby options; you choose the style and pay the restaurant directly." },
      { time: "14:30", title: "Batubulan or Celuk stop", description: "Choose one compact local layer: stone carving, silver work, or a direct return if the children are tired." },
      { time: "16:30", title: "Private hotel return", description: "Head back without waiting for other guests or a fixed shuttle departure." },
    ],
    inclusions: ["Private air-conditioned hotel transfer", "Bali Bird Park admission", "English-speaking local driver", "Parking and fuel", "One nearby village stop", "Drinking water"],
    exclusions: ["Meals and personal purchases", "Paid premium encounters if offered", "Remote-area pickup supplement if applicable", "Personal travel insurance"],
    pricingTiers: [{ minPax: 1, maxPax: 1, perPersonIdr: 1200000 }, { minPax: 2, maxPax: 2, perPersonIdr: 875000 }, { minPax: 3, maxPax: 4, perPersonIdr: 775000 }, { minPax: 5, maxPax: 6, perPersonIdr: 700000 }],
    meetingPoint: "Your hotel or villa lobby",
    meetingNote: "The route stays within the Bird Park and Batubulan area. Tell us children's ages before booking so we can confirm seating and the correct venue arrangements.",
    cancellationPolicy: "Cancel before the admission voucher is issued for a full refund. After issue, the venue portion follows the supplier's rules; any refundable transport portion is returned.",
  },
  "uluwatu-kecak-jimbaran-evening": {
    summary: "A focused south-Bali evening timed around Uluwatu's cliff walk and Kecak performance, followed by a Jimbaran stop where you choose the restaurant and budget.",
    itinerary: [
      { time: "13:30", title: "Private hotel pickup", description: "Pickup is adjusted to your area so the route reaches Uluwatu before sunset queues build." },
      { time: "15:30", title: "Uluwatu Temple", description: "Walk the cliff path respectfully with sarong requirements and monkey-safety advice explained before entry." },
      { time: "17:30", title: "Kecak performance", description: "Use the included performance ticket for the confirmed show time, subject to venue scheduling." },
      { time: "19:15", title: "Jimbaran dinner stop", description: "Choose from a few clearly priced beachfront or local options and pay the restaurant directly." },
      { time: "21:00", title: "Private hotel return", description: "Travel back with no additional shopping or commission-led stops." },
    ],
    inclusions: ["Private air-conditioned vehicle", "English-speaking local driver", "Uluwatu Temple entrance", "Kecak performance ticket", "Parking and fuel", "Drinking water"],
    exclusions: ["Dinner and drinks", "Licensed temple guide", "Personal purchases", "Personal travel insurance"],
    meetingPoint: "Your hotel or villa lobby",
    meetingNote: "The driver provides route and practical help but is not represented as a licensed temple guide. Performance time and availability are confirmed before ticket issue.",
    cancellationPolicy: "Cancel before the Kecak tickets are issued for a full refund. After issue, non-refundable ticket costs are deducted and the remaining refundable tour portion is returned.",
  },
  "ubud-market-cooking-class": {
    summary: "Shop for ingredients with a local host, cook a Balinese menu in a small-group kitchen, and return privately—an experience-led Ubud day with a clear purpose.",
    itinerary: [
      { time: "07:30", title: "Private hotel pickup", description: "An early start keeps the market visit relevant and avoids the busiest central Ubud traffic." },
      { time: "09:00", title: "Market walk with the cooking host", description: "See common herbs, spices, and produce with the class host who can explain how they are used." },
      { time: "10:00", title: "Hands-on cooking class", description: "Prepare a set Balinese menu with vegetarian substitutions confirmed in advance." },
      { time: "12:30", title: "Share the meal", description: "Eat what the group has prepared and receive the class recipes where provided by the host." },
      { time: "14:00", title: "One flexible Ubud stop", description: "Choose a short craft, gallery, or coffee stop before the private return." },
    ],
    inclusions: ["Private hotel transfer", "Market visit with the class host", "Hands-on cooking class", "Ingredients and prepared meal", "One flexible Ubud stop", "Drinking water"],
    exclusions: ["Alcohol and extra drinks", "Personal market purchases", "Remote-area pickup supplement if applicable", "Personal travel insurance"],
    meetingPoint: "Your hotel or villa lobby",
    meetingNote: "Class location and menu are confirmed for the date. Share allergies and dietary requirements before payment; severe cross-contamination risks may not be suitable for every kitchen.",
    cancellationPolicy: "Cancel at least 48 hours before pickup for a full refund. Later cancellations are refundable only to the extent the cooking host releases the reserved class places.",
  },
  "blue-lagoon-snorkeling-tenganan": {
    summary: "Snorkel Blue Lagoon with a local boat team, shower and eat before visiting Tenganan village on the return—two East Bali experiences joined by one private driver.",
    itinerary: [
      { time: "07:00", title: "Private hotel pickup", description: "Leave early for Padangbai while the road and sea are usually calmer." },
      { time: "09:00", title: "Boat and safety briefing", description: "Fit mask, snorkel, fins, and life jacket, then review current water conditions with the local team." },
      { time: "09:30", title: "Two snorkeling areas", description: "Visit Blue Lagoon and a second suitable site chosen for the day's visibility and swell." },
      { time: "12:00", title: "Shower and included lunch", description: "Change at the base and have a simple local lunch before continuing inland." },
      { time: "14:00", title: "Tenganan village", description: "Walk through the village respectfully; local donations or specialist guiding are paid directly where required." },
      { time: "16:00", title: "Private hotel return", description: "Return by the clearest East Bali route for the day." },
    ],
    inclusions: ["Private hotel and activity transfers", "Local snorkeling boat and guide", "Mask, snorkel, fins, and life jacket", "Shower and changing facilities", "Simple Indonesian lunch", "Drinking water"],
    exclusions: ["Tenganan donations or specialist village guide", "Underwater camera", "Remote-area pickup supplement if applicable", "Personal travel insurance"],
    meetingPoint: "Your hotel or villa lobby",
    meetingNote: "This day depends on sea conditions. Non-swimmers and guests with medical concerns should contact us before booking so the activity team can assess suitability.",
    cancellationPolicy: "Cancel at least 24 hours before pickup for a full refund. If the local boat team cancels for unsafe sea conditions, reschedule or receive a full refund.",
  },
  "sidemen-cycling-village-lunch": {
    summary: "Ride quiet Sidemen lanes with a local cycling guide, stop where the landscape has context, and finish with a village lunch before your private transfer home.",
    itinerary: [
      { time: "07:30", title: "Private hotel pickup", description: "Travel east before the main day traffic and meet the cycling team in Sidemen." },
      { time: "09:30", title: "Bike fitting and route briefing", description: "Check the bicycle and helmet, then review gradients, road conditions, and support options." },
      { time: "10:00", title: "Guided village ride", description: "Follow quiet lanes between rice fields, irrigation channels, and working villages with regular stops." },
      { time: "12:30", title: "Included village lunch", description: "Sit down for a simple Balinese lunch with vegetarian options arranged in advance." },
      { time: "14:00", title: "Scenic stop or direct return", description: "Add one short viewpoint or weaving stop if the group still has energy, then return privately." },
    ],
    inclusions: ["Private hotel transfer", "Local cycling guide", "Bicycle and helmet", "Support assistance during the ride", "Balinese lunch", "Drinking water"],
    exclusions: ["E-bike upgrade unless arranged", "Personal purchases", "Remote-area pickup supplement if applicable", "Personal travel insurance"],
    meetingPoint: "Your hotel or villa lobby",
    meetingNote: "Share rider heights, ages, and confidence levels before the date. The route can be shortened, but it still uses public village roads and uneven surfaces.",
    cancellationPolicy: "Cancel at least 24 hours before pickup for a full refund. Unsafe weather may require a route change, reschedule, or full refund.",
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
  "Experience Days": [
    { time: "08:00", title: "Private hotel pickup", description: "Meet your driver with the main experience and date already confirmed." },
    { time: "Morning", title: "Your anchor experience", description: "Enjoy the activity or attraction at your own pace while your driver remains reachable." },
    { time: "Afternoon", title: "One local layer", description: "Add one nearby stop that suits the route and your energy, then return privately." },
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
  if (tour.slug === "bali-bird-park-batubulan-day") return [
    main,
    { src: imageLibrary.terraces, alt: "Working rice terraces near the villages north of Batubulan" },
    { src: imageLibrary.temple, alt: "Balinese architecture and tropical gardens in Gianyar" },
    { src: imageLibrary.jalan, alt: "A quiet Bali road between palms and rice fields" },
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
