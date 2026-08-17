import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, TourCategory, TourPricingMode, UserRole } from "../src/generated/prisma-build/client";
import { getMockAddons } from "../src/data/mock-addons";
import { getMockVariants } from "../src/data/mock-variants";
import { getTourDetail } from "../src/data/mock-tour-details";
import { allTours } from "../src/data/mock-tours";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL is required to seed the database");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 2 }) });

const categories: Record<string, TourCategory> = {
  Trekking: TourCategory.TREKKING,
  "Water Sports": TourCategory.WATER_SPORTS,
  "Cultural tour": TourCategory.CULTURAL_TOUR,
  "Cultural Tours": TourCategory.CULTURAL_TOUR,
  "Car Charter": TourCategory.CAR_CHARTER,
  "Multi-Day Trips": TourCategory.MULTI_DAY_TRIP,
  "Custom Tour": TourCategory.CUSTOM_TOUR,
  "Island Trips": TourCategory.ISLAND_TRIP,
  Nature: TourCategory.NATURE,
  "Experience Days": TourCategory.EXPERIENCE_DAY,
};

const launchPublishedSlugs = new Set([
  "private-car-charter-bali",
  "ubud-temples-rice-terraces",
  "sekumpul-waterfall-north-bali",
  "uluwatu-kecak-jimbaran-evening",
  "east-bali-water-palaces",
  "mount-batur-sunrise-trek",
  "ayung-river-rafting-ubud",
  "ubud-rafting-atv-adventure",
  "blue-lagoon-snorkeling-tenganan",
  "bali-safari-day-admission",
  "ancient-bali-tampaksiring",
  "penglipuran-besakih-cultural-route",
  "jatiluwih-bedugul-water-temples",
  "sidemen-weaving-besakih",
  "taman-ayun-tanah-lot-sunset",
  "nusa-penida-west-coast",
  "manta-point-snorkeling",
  "south-bali-surf-discovery",
  "ubud-atv-jungle-trail",
  "tegalalang-swing-coffee-route",
  "bali-zoo-general-admission",
  "waterbom-bali-single-day-pass",
  "bali-bird-park-batubulan-day",
  "ubud-market-cooking-class",
  "sidemen-cycling-village-lunch",
  "north-bali-overnight-escape",
  "bali-highlights-three-days",
  "bali-four-region-private-journey",
  "five-day-bali-private-driver-circuit",
]);

const launchFeaturedSlugs = new Set([
  "mount-batur-sunrise-trek",
  "ubud-temples-rice-terraces",
  "private-car-charter-bali",
  "ubud-rafting-atv-adventure",
]);

function bookableDates(days = 366) {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return Array.from({ length: days }, (_, index) => new Date(start.getTime() + index * 86_400_000));
}

function baseCostForTour(tour: (typeof allTours)[number]) {
  if (tour.category === "Multi-Day Trips") return Math.round(tour.durationHours / 24) * 500000;
  return 500000;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (adminEmail && adminPasswordHash) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash: adminPasswordHash, role: UserRole.ADMIN },
      create: { email: adminEmail, name: "BaliXperience Owner", passwordHash: adminPasswordHash, role: UserRole.ADMIN },
    });
  }

  const requestedSlugs = new Set((process.env.SEED_SLUGS ?? "").split(",").map((slug) => slug.trim()).filter(Boolean));
  const toursToSeed = requestedSlugs.size ? allTours.filter((tour) => requestedSlugs.has(tour.slug)) : allTours;
  if (requestedSlugs.size && toursToSeed.length !== requestedSlugs.size) {
    const known = new Set(toursToSeed.map((tour) => tour.slug));
    throw new Error(`Unknown SEED_SLUGS: ${[...requestedSlugs].filter((slug) => !known.has(slug)).join(", ")}`);
  }

  for (const mockTour of toursToSeed) {
    const detail = getTourDetail(mockTour);
    const tour = await prisma.tour.upsert({
      where: { slug: mockTour.slug },
      update: {
        title: mockTour.title,
        description: detail.summary,
        category: categories[mockTour.category] ?? TourCategory.CUSTOM_TOUR,
        durationMinutes: Math.round(mockTour.durationHours * 60),
        basePriceIdr: mockTour.priceIdr,
        baseCostIdr: baseCostForTour(mockTour),
        perPaxCostIdr: null,
        pricingMode: mockTour.pricingMode === "PER_VEHICLE" ? TourPricingMode.PER_VEHICLE : TourPricingMode.PER_PERSON,
        location: mockTour.location,
        cardNote: mockTour.note,
        images: detail.gallery.map((image) => image.src),
        imageAlts: detail.gallery.map((image) => image.alt),
        inclusions: detail.inclusions,
        exclusions: detail.exclusions,
        meetingPoint: detail.meetingPoint,
        cancellationPolicy: detail.cancellationPolicy,
        maxGroupSize: detail.maxGroupSize,
      },
      create: {
        title: mockTour.title,
        slug: mockTour.slug,
        description: detail.summary,
        category: categories[mockTour.category] ?? TourCategory.CUSTOM_TOUR,
        durationMinutes: Math.round(mockTour.durationHours * 60),
        basePriceIdr: mockTour.priceIdr,
        baseCostIdr: baseCostForTour(mockTour),
        perPaxCostIdr: null,
        pricingMode: mockTour.pricingMode === "PER_VEHICLE" ? TourPricingMode.PER_VEHICLE : TourPricingMode.PER_PERSON,
        location: mockTour.location,
        cardNote: mockTour.note,
        featured: launchFeaturedSlugs.has(mockTour.slug),
        images: detail.gallery.map((image) => image.src),
        imageAlts: detail.gallery.map((image) => image.alt),
        inclusions: detail.inclusions,
        exclusions: detail.exclusions,
        meetingPoint: detail.meetingPoint,
        cancellationPolicy: detail.cancellationPolicy,
        maxGroupSize: detail.maxGroupSize,
        published: launchPublishedSlugs.has(mockTour.slug),
      },
    });

    await prisma.$transaction([
      prisma.tourItineraryStop.deleteMany({ where: { tourId: tour.id } }),
      prisma.tourPricingTier.deleteMany({ where: { tourId: tour.id } }),
      prisma.tourAddon.deleteMany({ where: { tourId: tour.id, bookings: { none: {} } } }),
    ]);

    await prisma.tourItineraryStop.createMany({
      data: detail.itinerary.map((stop, position) => ({ tourId: tour.id, position, timeLabel: stop.time, title: stop.title, description: stop.description })),
    });
    await prisma.tourPricingTier.createMany({
      data: detail.pricingTiers.map((tier) => ({ tourId: tour.id, minPax: tier.minPax, maxPax: tier.maxPax, perPersonIdr: tier.perPersonIdr })),
    });
    for (const addon of getMockAddons(mockTour.category, mockTour.slug)) {
      await prisma.tourAddon.upsert({
        where: { tourId_code: { tourId: tour.id, code: addon.code } },
        update: { title: addon.title, description: addon.description, priceIdr: addon.priceIdr, costPriceIdr: addon.code === "local-lunch" ? 120000 : addon.code.startsWith("pickup-") ? 100000 : null, pricingMode: addon.pricingMode, active: true },
        create: { tourId: tour.id, ...addon, costPriceIdr: addon.code === "local-lunch" ? 120000 : addon…38286 tokens truncated…tion ?? ""}`).join("\n");

  return (
    <div className="space-y-8">
      {preview ? <p className="border-l-4 border-gold bg-frangipani p-4 text-sm leading-6 text-weathered"><strong className="text-charcoal">Read-only preview.</strong> The complete editor is visible, but saving activates only after Supabase and the admin account are connected.</p> : null}
      <form action={action}>
        <fieldset disabled={preview || pending} className="space-y-10 disabled:opacity-75">
          {tour.id ? <input type="hidden" name="id" value={tour.id} /> : null}
          <section aria-labelledby="tour-basics" className="border-t-2 border-charcoal pt-5">
            <div className="mb-6 grid grid-cols-[2rem_1fr] gap-3"><span className="font-serif text-2xl text-gold-dark">01</span><div><h2 id="tour-basics" className="font-serif text-2xl">Listing basics</h2><p className="text-sm text-weathered">The information guests scan before opening the itinerary.</p></div></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Tour title" name="title" required defaultValue={tour.title} containerClassName="sm:col-span-2" />
              <Input label="URL slug" name="slug" required defaultValue={tour.slug} hint="Lowercase words separated by hyphens." />
              <Select label="Category" name="category" required defaultValue={tour.category}>{categories.map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}</Select>
              <Input label="Area / location" name="location" required defaultValue={tour.location} hint="Shown on cards, for example Ubud or North Bali." />
              <Input label="Card caption" name="cardNote" required defaultValue={tour.cardNote} hint="A short practical detail, maximum 120 characters." />
              <Input label="Duration in minutes" name="durationMinutes" type="number" min={30} required defaultValue={tour.durationMinutes} />
              <Input label="Base price in IDR" name="basePriceIdr" type="number" min={0} step={5000} required defaultValue={tour.basePriceIdr} />
              <Select label="How the package is priced" name="pricingMode" required defaultValue={tour.pricingMode}>
                <option value="PER_PERSON">Per person</option>
                <option value="PER_VEHICLE">Per vehicle / booking</option>
              </Select>
              <Input label="Fixed internal cost in IDR" name="baseCostIdr" type="number" min={0} step={5000} defaultValue={tour.baseCostIdr ?? ""} hint="Per booking, such as the driver and vehicle. Private." />
              <Input label="Internal cost per traveler in IDR" name="perPaxCostIdr" type="number" min={0} step={5000} defaultValue={tour.perPaxCostIdr ?? ""} hint="Ticket or activity supplier cost for each guest. Private." />
              <Input label="Optional child price in IDR" name="childPriceIdr" type="number" min={0} step={5000} defaultValue={tour.childPriceIdr ?? ""} hint="Leave empty to charge the adult rate." />
              <Input label="Child age label" name="childAgeLabel" defaultValue={tour.childAgeLabel ?? ""} hint="For example: ages 3–12." />
              <Input label="Maximum group size" name="maxGroupSize" type="number" min={1} max={50} required defaultValue={tour.maxGroupSize} />
              <label className="flex min-h-12 items-center gap-3 border border-charcoal/25 bg-frangipani px-4 sm:self-end"><input type="checkbox" name="published" defaultChecked={tour.published} className="size-5 accent-terrace" /><span><strong className="block text-sm">Published</strong><span className="text-xs text-weathered">Visible and bookable on the public site</span></span></label>
              <label className="flex min-h-12 items-center gap-3 border border-charcoal/25 bg-frangipani px-4 sm:self-end"><input type="checkbox" name="featured" defaultChecked={tour.featured} className="size-5 accent-terrace" /><span><strong className="block text-sm">Top Pick</strong><span className="text-xs text-weathered">Prioritize this package on the homepage</span></span></label>
              <div className="sm:col-span-2"><FieldLabel htmlFor="description">Description</FieldLabel><textarea id="description" name="description" required rows={5} defaultValue={tour.description} className={textAreaClass} /></div>
            </div>
          </section>

          <section aria-labelledby="tour-route" className="border-t-2 border-charcoal pt-5">
            <div className="mb-6 grid grid-cols-[2rem_1fr] gap-3"><span className="font-serif text-2xl text-gold-dark">02</span><div><h2 id="tour-route" className="font-serif text-2xl">Route and guest expectations</h2><p className="text-sm text-weathered">One structured stop per line keeps the public timeline consistent.</p></div></div>
            <div className="space-y-5">
              <Input label="Meeting point" name="meetingPoint" required defaultValue={tour.meetingPoint} />
              <div><FieldLabel htmlFor="itinerary" hint="time | title | description">Itinerary</FieldLabel><textarea id="itinerary" name="itinerary" required rows={10} defaultValue={itinerary} className={`${textAreaClass} font-mono text-xs`} /></div>
              <div><FieldLabel htmlFor="inclusions" hint="one item per line">Inclusions</FieldLabel><textarea id="inclusions" name="inclusions" rows={6} defaultValue={tour.inclusions.join("\n")} className={textAreaClass} /></div>
              <div><FieldLabel htmlFor="exclusions" hint="one item per line">Exclusions</FieldLabel><textarea id="exclusions" name="exclusions" rows={5} defaultValue={tour.exclusions.join("\n")} className={textAreaClass} /></div>
              <div><FieldLabel htmlFor="cancellationPolicy">Cancellation policy</FieldLabel><textarea id="cancellationPolicy" name="cancellationPolicy" required rows={5} defaultValue={tour.cancellationPolicy} className={textAreaClass} /></div>
            </div>
          </section>

          <section aria-labelledby="tour-commerce" className="border-t-2 border-charcoal pt-5">
            <div className="mb-6 grid grid-cols-[2rem_1fr] gap-3"><span className="font-serif text-2xl text-gold-dark">03</span><div><h2 id="tour-commerce" className="font-serif text-2xl">Photos and pricing</h2><p className="text-sm text-weathered">URLs are CDN-ready. Pricing and extras are parsed into database rows, not stored as blobs.</p></div></div>
            <div className="space-y-5">
              <div><FieldLabel htmlFor="images" hint="one URL per line">Image URLs</FieldLabel><textarea id="images" name="images" required rows={6} defaultValue={tour.images.join("\n")} className={`${textAreaClass} font-mono text-xs`} /></div>
              <div><FieldLabel htmlFor="imageAlts" hint="one plain-language description per image, in the same order">Image descriptions</FieldLabel><textarea id="imageAlts" name="imageAlts" required rows={6} defaultValue={tour.imageAlts.join("\n")} className={textAreaClass} /></div>
              <div><FieldLabel htmlFor="pricingTiers" hint="min-max | price in IDR (uses the pricing method above)">Group pricing tiers</FieldLabel><textarea id="pricingTiers" name="pricingTiers" required rows={5} defaultValue={pricing} className={`${textAreaClass} font-mono text-xs`} /></div>
              <div><FieldLabel htmlFor="addons" hint="code | title | selling price | mode | internal cost | description">Optional add-ons</FieldLabel><textarea id="addons" name="addons" rows={6} defaultValue={addons} className={`${textAreaClass} font-mono text-xs`} /></div>
              <div><FieldLabel htmlFor="variants" hint="code | title | price adjustment per guest | supplier unit cost | guests per unit | odd guest cost | yes/no default | description">Package options</FieldLabel><textarea id="variants" name="variants" rows={6} defaultValue={variants} className={`${textAreaClass} font-mono text-xs`} /><p className="mt-2 text-xs leading-5 text-weathered">Use this for selectable versions such as standard/premium or solo/shared. Enter one default option. Supplier costs stay private.</p></div>
            </div>
          </section>

          <Feedback state={state} />
          <div className="sticky bottom-3 z-20 flex justify-end border border-charcoal/25 bg-frangipani/95 p-3 shadow-sun backdrop-blur"><Button type="submit" size="lg" loading={pending}><Save className="size-4" aria-hidden="true" /> {tour.id ? "Save tour" : "Create tour"}</Button></div>
        </fieldset>
      </form>

      {tour.id ? (
        <section className="border-t border-error/40 pt-6">
          <h2 className="font-serif text-2xl text-error">Danger area</h2>
          <p className="mt-2 text-sm text-weathered">Tours with any booking history cannot be deleted. Unpublish them instead.</p>
          <form action={deleteAction} className="mt-4 flex flex-wrap items-center gap-4">
            <input type="hidden" name="id" value={tour.id} />
            <Button type="submit" variant="outline" disabled={preview} loading={deleting} className="border-error text-error hover:bg-error"><Trash2 className="size-4" aria-hidden="true" /> Delete tour</Button>
            <Feedback state={deleteState} />
          </form>
        </section>
      ) : null}
    </div>
  );
}
