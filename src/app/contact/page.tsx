import { Clock3, Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact BaliXperience on WhatsApp or email to ask about Bali tours, pickup areas, dates, and custom routes.",
  alternates: { canonical: "/contact" },
};

const details = [
  ["Your date", "Include alternatives if your day is flexible."],
  ["Hotel or pickup area", "The area is enough—you do not need to send a room number."],
  ["Number of travelers", "Mention children and their ages for seats and activity rules."],
  ["Your must-do", "Tell us the one place or experience the route should be built around."],
] as const;

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <PageIntro
        eyebrow="Contact"
        title="Ask a local before you commit."
        description="Not sure whether two stops fit in one day, whether pickup is available from your hotel, or which activity suits your group? Send the details and we will help you narrow it down."
        aside={<p className="text-sm leading-6 text-weathered"><strong className="block text-charcoal">Bali time: WITA (UTC+8)</strong> Messages are answered as soon as practical. Current guests and same-day pickup questions are prioritised.</p>}
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20">
        <div className="lg:col-span-5">
          <div className="border border-charcoal/25 bg-terrace p-7 text-frangipani shadow-sun-raised sm:p-9">
            <MessageCircle aria-hidden="true" className="size-7 text-gold" />
            <h2 className="mt-6 font-serif text-4xl">WhatsApp is the quickest path.</h2>
            <p className="mt-4 leading-7 text-frangipani/75">It keeps route questions, pickup details, and day-of updates in one conversation.</p>
            <WhatsAppButton className="mt-7 border-gold bg-gold text-charcoal">Message BaliXperience</WhatsAppButton>
            <div className="mt-9 space-y-4 border-t border-frangipani/20 pt-6 text-sm text-frangipani/75">
              <p className="flex gap-3"><Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" /><a className="underline decoration-frangipani/30 underline-offset-4 hover:text-gold" href="mailto:jonbalitour7@gmail.com">jonbalitour7@gmail.com</a></p>
              <p className="flex gap-3"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />Based in Bali, Indonesia</p>
              <p className="flex gap-3"><Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />Operating on Bali time (WITA)</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 lg:pl-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Help us reply accurately</p>
          <h2 className="mt-4 font-serif text-4xl">Send these four things.</h2>
          <div className="mt-8 divide-y divide-charcoal/20 border-y border-charcoal/20">
            {details.map(([title, copy], index) => (
              <div key={title} className="grid gap-2 py-5 sm:grid-cols-[3rem_12rem_1fr] sm:items-start">
                <span className="font-serif text-xl text-gold">0{index + 1}</span>
                <h3 className="font-bold text-charcoal">{title}</h3>
                <p className="text-sm leading-6 text-weathered">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 border-l-4 border-clay bg-frangipani p-5 text-sm leading-6 text-weathered">
            <strong className="text-charcoal">Need urgent help during a booked trip?</strong> Reply in the same WhatsApp conversation used for your pickup confirmation. BaliXperience is not an emergency service; contact local emergency services first where immediate safety is at risk.
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
