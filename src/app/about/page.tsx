import { ArrowRight, Compass, Handshake, Route } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

export const metadata: Metadata = {
  title: "About",
  description: "How BaliXperience plans private Bali tours, activity days, and driver hire with one local point of contact.",
};

const principles = [
  {
    number: "01",
    title: "Routes that work in real traffic",
    copy: "A map can make six stops look easy. Bali traffic, ceremonies, queues, and mountain weather tell a different story. We plan around the day you can actually have.",
    icon: Route,
  },
  {
    number: "02",
    title: "Clear before you pay",
    copy: "The tour page shows the route, inclusions, pickup arrangement, and IDR price. If a ticket or meal is optional, it should be labelled—not discovered halfway through the day.",
    icon: Handshake,
  },
  {
    number: "03",
    title: "Flexible, not vague",
    copy: "Private travel should leave room for your pace. We can change the route before booking, while still being honest about travel time, opening hours, and supplier rules.",
    icon: Compass,
  },
] as const;

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <PageIntro
        eyebrow="About BaliXperience"
        title="A smaller way to plan a better Bali day."
        description="BaliXperience is a Bali-based tour and driver-hire operator. You book directly, speak to a local contact, and get a route shaped around where you are staying—not a one-size-fits-all bus itinerary."
        aside={<p className="text-sm leading-6 text-weathered"><strong className="block text-charcoal">Small by design.</strong> One clear contact before pickup and while you are out exploring.</p>}
      />

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="how-we-work">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">How we work</p>
            <h2 id="how-we-work" className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Good days start with an honest route.</h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-charcoal/25 bg-charcoal/20 md:grid-cols-3 lg:col-span-8">
            {principles.map(({ number, title, copy, icon: Icon }) => (
              <article key={number} className="bg-frangipani p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl text-gold">{number}</span>
                  <Icon aria-hidden="true" className="size-5 text-terrace" />
                </div>
                <h3 className="mt-8 text-lg font-bold text-charcoal">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-weathered">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-terrace text-frangipani">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">What we will not promise</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">No impossible itineraries dressed up as value.</h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-frangipani/80 lg:col-span-7 lg:pl-8">
            <p>We will not guarantee perfect weather, empty roads, or every stop running exactly on schedule. We will explain what is realistic and help adjust when Bali changes the plan.</p>
            <p>We also do not treat every driver as a specialist guide. Where an attraction or activity requires a local guide or trained instructor, that person is arranged as part of the experience and identified in the inclusions.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-12 lg:py-18">
        <div>
          <h2 className="font-serif text-4xl">Tell us what kind of day you want.</h2>
          <p className="mt-3 text-weathered">Start with a listed tour or ask us to build around one must-see place.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <WhatsAppButton>Plan on WhatsApp</WhatsAppButton>
          <Link href="/tours" className="inline-flex min-h-11 items-center gap-2 rounded-control border border-charcoal/45 px-5 font-semibold text-charcoal transition-colors hover:bg-charcoal hover:text-frangipani focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">
            Browse tours <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
