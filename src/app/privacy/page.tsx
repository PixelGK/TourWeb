import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How BaliXperience collects, uses, shares, and protects booking, payment-status, communication, and website data.",
};

const privacySections = [
  ["1. Information we collect", [
    "Booking details such as your name, email, phone number, country, travel date, party size, pickup area, hotel information you choose to provide, traveler ages where relevant, add-ons, and notes about the trip.",
    "The current booking-request flow does not collect payment. If online payment is enabled later, we may keep records such as the amount, currency, payment provider, provider transaction identifier, and payment status. Card or banking credentials would be entered with the hosted payment provider; BaliXperience does not receive or store raw card numbers.",
    "Messages and support information you send by email, WhatsApp, or through a booking form, plus technical records needed to secure and operate the website, such as IP address, timestamps, browser information, and rate-limit events.",
  ]],
  ["2. Why we use it", [
    "We use personal information to answer enquiries, check availability, create and manage bookings, coordinate pickup and suppliers, verify payment status, send confirmations and service updates, provide support, prevent abuse and fraud, keep required transaction records, and improve the reliability of the service.",
    "Depending on where you live and what the law requires, we process this information because it is needed to take steps at your request or perform the booking contract, because we have legitimate operational and security needs, because the law requires it, or because you have given consent.",
  ]],
  ["3. Who receives it", [
    "We share only what is reasonably needed with drivers, guides, activity operators, attractions, restaurants, or other suppliers involved in your booked day. For example, an activity operator may need traveler names, date, party size, and relevant age or safety information.",
    "We also use service providers to run the business: Midtrans for hosted payment and payment status, Supabase for database infrastructure, Vercel for website hosting and operational logs, Resend for transactional email, and WhatsApp/Meta when you choose to message us there. Those providers handle data under their own terms and privacy notices.",
    "Information may also be disclosed where required by law, to protect safety or legal rights, or in connection with a genuine business reorganization. We do not sell personal information or provide it to data brokers.",
  ]],
  ["4. International processing", [
    "You may be visiting from another country, and our technology and supplier providers may process information in Indonesia and other regions where they operate. We use established providers and take reasonable steps to protect information when it is processed across borders, as required by applicable law.",
  ]],
  ["5. How long we keep it", [
    "We keep booking, payment-status, and communication records only as long as reasonably needed to provide the trip, handle support or disputes, prevent fraud, and meet accounting, tax, and legal obligations. When information is no longer needed, we delete it or remove identifying details. A legal requirement or active dispute may require a longer period.",
  ]],
  ["6. Security", [
    "We use access controls, environment-managed secrets, hosted payment entry, and other technical and organizational safeguards appropriate to a small booking operation. No internet service can promise absolute security. Please do not send card details, passport scans, or unnecessary sensitive information through WhatsApp or email.",
  ]],
  ["7. Your choices and rights", [
    "Subject to applicable law, you may ask whether we hold personal information about you, request access or correction, ask for deletion or restriction, withdraw consent, object to certain uses, or request a portable copy. Some requests may be limited where records must be retained for a booking, legal obligation, fraud prevention, or a dispute.",
    "You can also complain to the relevant data protection authority. Contact us first if you can—we would like the opportunity to understand and resolve the concern.",
  ]],
  ["8. Cookies and analytics", [
    "The public website does not currently use advertising cookies. Essential cookies or similar storage may be used for security, administration login, and core site operation. Hosting systems may record standard request logs. If we add non-essential analytics or advertising tools, we will update this notice and provide any consent controls required by law.",
  ]],
  ["9. Children", [
    "Bookings must be made by an adult. We collect a child's age or other limited details only when needed for transport, pricing, entry, or activity safety. Do not send additional information about a child unless it is necessary for the booking.",
  ]],
  ["10. WhatsApp and external links", [
    "When you open WhatsApp, a payment page, or another external site, that service receives information according to its own privacy notice. WhatsApp conversations may include booking details, so use the same care you would with email and avoid sending payment credentials or unnecessary identity documents.",
  ]],
  ["11. Changes to this notice", [
    "We may update this notice when the website, suppliers, or legal requirements change. The latest version will remain on this page with its updated date. Material changes affecting an active booking will be communicated where appropriate.",
  ]],
] as const;

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <PageIntro
        eyebrow="Privacy"
        title="Your trip details are for running your trip."
        description="This notice explains what BaliXperience collects, why it is needed, which booking partners receive it, and the choices available to you."
        aside={<p className="text-sm leading-6 text-weathered"><strong className="block text-charcoal">Last updated</strong>15 August 2026</p>}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20">
        <aside className="lg:col-span-3">
          <div className="space-y-4 border border-charcoal/25 bg-frangipani p-5 text-sm leading-6 text-weathered lg:sticky lg:top-6">
            <p><strong className="block text-charcoal">The short version</strong>We collect what is needed to answer you, book and operate the trip, confirm payment status, and keep the service secure.</p>
            <p><strong className="block text-charcoal">We do not store</strong>Raw card numbers or online banking credentials.</p>
            <p><strong className="block text-charcoal">We do not sell</strong>Your personal information or travel details.</p>
          </div>
        </aside>
        <div className="space-y-10 lg:col-span-8 lg:col-start-5">
          {privacySections.map(([title, paragraphs]) => {
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <section key={title} aria-labelledby={id}>
                <h2 id={id} className="font-serif text-3xl text-charcoal">{title}</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-weathered">
                  {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            );
          })}
          <section className="border-t border-charcoal/20 pt-8" aria-labelledby="privacy-contact">
            <h2 id="privacy-contact" className="font-serif text-3xl">Privacy contact</h2>
            <p className="mt-4 leading-7 text-weathered">Email <a className="font-semibold text-terrace underline underline-offset-4" href="mailto:jonbalitour7@gmail.com">jonbalitour7@gmail.com</a> with “Privacy request” in the subject, or use our <Link className="font-semibold text-terrace underline underline-offset-4" href="/contact">contact page</Link>. We may need to verify your identity before providing or changing booking records.</p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
