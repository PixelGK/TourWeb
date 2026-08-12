import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Booking Terms",
  description: "The booking, payment, cancellation, supplier, and guest terms for BaliXperience tours and experiences.",
};

const sections = [
  {
    title: "1. Who these terms cover",
    paragraphs: [
      "These terms apply when you browse, reserve, or take part in a tour, driver charter, activity, or hosted experience arranged through BaliXperience. The person making the booking confirms that they are at least 18 and have authority to accept these terms for everyone included in the booking.",
      "BaliXperience is currently a business name used by a Bali-based independent operator and is not yet an incorporated Indonesian PT. Some parts of an experience—such as attraction entry, rafting, vehicle hire, meals, or specialist guiding—may be delivered by an independent local supplier.",
    ],
  },
  {
    title: "2. Booking and confirmation",
    paragraphs: [
      "Submitting traveler details or reaching a payment page does not by itself confirm a booking. A booking is confirmed only after the payment provider reports a successful payment to BaliXperience and you receive a confirmation from us.",
      "Some activities and attraction-inclusive days require a separate supplier check. If the selected date cannot be fulfilled after payment, we will offer a reasonable alternative date or experience, or refund the affected amount.",
      "Please check names, date, traveler count, pickup area, and contact details before paying. Contact us promptly if anything is wrong.",
    ],
  },
  {
    title: "3. Prices and payment",
    paragraphs: [
      "The checkout charge and settlement currency is Indonesian rupiah (IDR). Any USD amount is an estimate for comparison and may differ from your bank's converted amount or fees.",
      "Card and supported payment details are entered on Midtrans's hosted checkout. BaliXperience does not receive or store raw card numbers. We keep the provider transaction identifier, amount, and payment status needed to manage the booking.",
      "The inclusions shown on the tour page at the time of booking form part of your booking. Personal meals, optional stops, gratuities, and other items are excluded unless expressly listed as included.",
    ],
  },
  {
    title: "4. Changes, cancellations, and refunds",
    paragraphs: [
      "The cancellation policy shown on the selected tour or experience applies to that booking. Supplier-issued tickets, vouchers, or limited-capacity activities may become non-refundable or date-restricted once issued; we will identify material restrictions before payment where they apply.",
      "A request to change a date, route, pickup, or traveler count is subject to availability and may change the price. A change is accepted only when confirmed by BaliXperience in writing or on WhatsApp.",
      "If BaliXperience or a supplier must cancel a material part of the booking, we may offer a comparable alternative, a new date, or a refund for the affected service. Approved refunds are initiated within 2–3 business days; your bank or payment provider may take longer to return the funds. We are not responsible for separate flights, hotels, visas, or other costs you arranged independently.",
    ],
  },
  {
    title: "5. Pickup, timing, and itinerary changes",
    paragraphs: [
      "You must be ready at the confirmed pickup point and time. Significant lateness or an unreachable guest may shorten the itinerary or be treated as a no-show where the service can no longer reasonably operate.",
      "Bali traffic, weather, ceremonies, road access, attraction queues, and supplier operations can change without notice. The driver, guide, or activity operator may adjust the sequence, timing, or a stop when reasonably necessary for safety or to keep the day workable. A comparable stop may be offered where practical.",
    ],
  },
  {
    title: "6. Guest responsibilities and safety",
    paragraphs: [
      "Tell us before booking about relevant mobility needs, medical conditions, pregnancy, ages of children, dietary needs, or other circumstances that may affect safe participation. Activity suppliers may apply age, weight, health, footwear, or conduct rules.",
      "Follow reasonable safety instructions from drivers, guides, venues, and activity staff. A supplier or BaliXperience may refuse or stop participation where behavior creates a safety risk, is unlawful, or seriously disrupts others; a refund may not be available in that situation.",
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
      "Neither party is responsible for failure caused by events that could not reasonably be controlled, such as severe weather, natural disaster, government action, epidemic, road closure, civil disruption, or a widespread transport interruption. We will try to reschedule or find a fair practical solution, taking into account costs already committed to suppliers.",
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
        aside={<p className="text-sm leading-6 text-weathered"><strong className="block text-charcoal">Last updated</strong>12 August 2026</p>}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20">
        <aside className="lg:col-span-3">
          <div className="border-l-4 border-gold bg-frangipani p-5 text-sm leading-6 text-weathered lg:sticky lg:top-6">
            <strong className="block text-charcoal">Plain-language summary</strong>
            Your tour page and confirmation contain the booking-specific price, inclusions, and cancellation policy. These general terms cover the rest. If something looks inconsistent, contact us before paying.
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
