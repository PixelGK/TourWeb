import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Booking Terms",
  description: "The booking, payment, cancellation, supplier, and guest terms for BaliXperience driver and experience packages.",
};

const sections = [
  {
    title: "1. Who these terms cover",
    paragraphs: [
      "These terms apply when you browse, reserve, or take part in a private driver day, driver charter, activity package, or attraction-inclusive experience arranged through BaliXperience. The person making the booking confirms that they are at least 18 and have authority to accept these terms for everyone included in the booking.",
      "BaliXperience is currently a business name used by a Bali-based independent operator and is not yet an incorporated Indonesian PT. BaliXperience provides experienced local drivers and coordinates package arrangements. We do not represent drivers as licensed tour guides. Attractions, activities, meals, and any required certified guide or trained instructor are delivered by independent specialist suppliers.",
    ],
  },
  {
    title: "2. Booking and confirmation",
    paragraphs: [
      "Submitting a booking request does not confirm a booking or hold capacity. No online payment is taken at this stage. We send a BaliXperience reference, check the driver and any included supplier arrangements, and contact you on WhatsApp or email.",
      "We aim to accept or decline each request within 12 hours. A booking is confirmed only when BaliXperience sends written confirmation. If the selected package is unavailable, we may offer a reasonable alternative, which you are never required to accept.",
      "Online checkout closes 12 hours before the package's expected pickup time. Later requests may be discussed on WhatsApp, but are not accepted until BaliXperience confirms availability and price.",
      "Please check names, date, traveler count, pickup area, and contact details before submitting. Contact us promptly if anything is wrong.",
    ],
  },
  {
    title: "3. Prices and payment",
    paragraphs: [
      "Prices are quoted in Indonesian rupiah (IDR). Any USD amount is an estimate for comparison and may differ from the rate used by your bank or payment service.",
      "The current website request flow does not collect payment. If online payment is enabled later, card and supported payment details will be entered only on a hosted payment provider page. BaliXperience will not receive or store raw card numbers.",
      "The inclusions shown on the tour page at the time of booking form part of your booking. Personal meals, optional stops, gratuities, and other items are excluded unless expressly listed as included.",
    ],
  },
  {
    title: "4. Changes, cancellations, and refunds",
    paragraphs: [
      "You may cancel for a full refund until 24 hours before the confirmed pickup time. Customer-requested cancellations within 24 hours of pickup are non-refundable. The timing of an admission voucher being issued does not reduce this cancellation right.",
      "A request to change a date, route, pickup, or traveler count is subject to availability and may change the price. A change is accepted only when confirmed by BaliXperience in writing or on WhatsApp.",
      "If BaliXperience or a supplier cannot provide a confirmed material part of the package, you may choose a comparable alternative, a new date, or a full refund. Approved refunds are initiated within 2–3 business days; your bank or payment provider may take longer to return the funds. We are not responsible for separate flights, hotels, visas, or other costs you arranged independently.",
    ],
  },
  {
    title: "5. Pickup, timing, and itinerary changes",
    paragraphs: [
      "You must be ready at the confirmed pickup point and time. Significant lateness or an unreachable guest may shorten the itinerary or be treated as a no-show where the service can no longer reasonably operate.",
      "Bali traffic, weather, ceremonies, road access, attraction queues, and supplier operations can change without notice. The driver or specialist activity operator may adjust the sequence, timing, or a stop when reasonably necessary for safety or to keep the day workable. A comparable stop may be offered where practical.",
    ],
  },
  {
    title: "6. Guest responsibilities and safety",
    paragraphs: [
      "Tell us before booking about relevant mobility needs, medical conditions, pregnancy, ages of children, dietary needs, or other circumstances that may affect safe participation. Activity suppliers may apply age, weight, health, footwear, or conduct rules.",
      "Follow reasonable safety instructions from drivers, venue staff, certified supplier guides, and activity instructors. A supplier or BaliXperience may refuse or stop participation where behavior creates a safety risk, is unlawful, or seriously disrupts others; a refund may not be available in that situation.",
      "Travel carries ordinary risks, including changing weather, uneven ground, water activities, traffic, and wildlife. Appropriate travel insurance, including activity and medical cover, is strongly recommended.",
    ],
  },
  {
    title: "7. Independent suppliers",
    paragraphs: [
      "We select and coordinate local suppliers, but those suppliers remain responsible for the services they operate and for their staff, equipment, venue rules, and safety procedures. Their reasonable participation and cancellation rules also apply where communicated to you.",
    ],
  },
  {
    title: "8. Liability",
    paragraphs: [
      "To the extent allowed by applicable law, BaliXperience is responsible for direct loss caused by our failure to provide a confirmed service with reasonable care, but not for indirect or consequential loss or events outside reasonable control. Nothing in these terms excludes liability that cannot lawfully be excluded, including liability for fraud or deliberate misconduct.",
    ],
  },
  {
    title: "9. Events outside reasonable control",
    paragraphs: [
      "Neither party is responsible for failure caused by events that could not reasonably be controlled, such as severe weather, natural disaster, government action, epidemic, road closure, civil disruption, Nyepi transport restrictions, or a widespread transport interruption. Official Nyepi dates are unavailable for driver transport. If an unexpected event affects a confirmed booking, we will offer rescheduling or a full refund for the package we cannot deliver.",
    ],
  },
  {
    title: "10. Website content and acceptable use",
    paragraphs: [
      "Tour descriptions, photographs, branding, and website content may not be copied or commercially reused without permission. You must not misuse the site, interfere with booking or administration systems, submit false details, or attempt unauthorized access.",
    ],
  },
  {
    title: "11. Law, concerns, and contact",
    paragraphs: [
      "These terms are governed by the laws of Indonesia, subject to any consumer rights that must apply in your place of residence. If a problem occurs, contact us promptly so we can try to resolve it in good faith before formal proceedings.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <main>
      <SiteHeader />
      <PageIntro
        eyebrow="Booking terms"
        title="The practical rules behind your booking."
        description="These terms explain when a booking is confirmed, what your price covers, how changes work, and where independent activity or attraction suppliers are involved."
        aside={<p className="text-sm leading-6 text-weathered"><strong className="block text-charcoal">Last updated</strong>15 August 2026</p>}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20">
        <aside className="lg:col-span-3">
          <div className="border-l-4 border-gold bg-frangipani p-5 text-sm leading-6 text-weathered lg:sticky lg:top-6">
            <strong className="block text-charcoal">Plain-language summary</strong>
            Your tour page and confirmation contain the booking-specific price, inclusions, and cancellation policy. These general terms cover the rest. If something looks inconsistent, contact us before you commit.
          </div>
        </aside>
        <div className="space-y-10 lg:col-span-8 lg:col-start-5">
          {sections.map((section) => (
            <section key={section.title} aria-labelledby={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
              <h2 id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="font-serif text-3xl text-charcoal">{section.title}</h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-weathered">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
          <section className="border-t border-charcoal/20 pt-8" aria-labelledby="terms-contact">
            <h2 id="terms-contact" className="font-serif text-3xl">Contact</h2>
            <p className="mt-4 leading-7 text-weathered">Email <a className="font-semibold text-terrace underline underline-offset-4" href="mailto:jonbalitour7@gmail.com">jonbalitour7@gmail.com</a>, use our <Link className="font-semibold text-terrace underline underline-offset-4" href="/contact">contact page</Link>, or reply in your booking WhatsApp conversation.</p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
