import { ArrowUpRight, Check, Clock3, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { PriceTag } from "@/components/ui/price-tag";
import { RatingStars } from "@/components/ui/rating-stars";
import { Select } from "@/components/ui/select";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

const colors = [
  ["Volcanic charcoal", "#1C1B18", "bg-charcoal", "text-frangipani"],
  ["Rice-terrace green", "#2F4A3C", "bg-terrace", "text-frangipani"],
  ["Limestone", "#EDE7DA", "bg-limestone", "text-charcoal"],
  ["Frangipani", "#FFF9EC", "bg-frangipani", "text-charcoal"],
  ["Sunset gold", "#C98A3E", "bg-gold", "text-charcoal"],
  ["Burnt clay", "#81503E", "bg-clay", "text-frangipani"],
  ["Weathered stone", "#62675F", "bg-weathered", "text-frangipani"],
] as const;

export default function DesignSystemPage() {
  return (
    <main>
      <header className="border-b border-charcoal/25 bg-terrace text-frangipani">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gold">BaliXperience / System 01</p>
            <h1 className="max-w-3xl font-serif text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Built for confident bookings.
            </h1>
          </div>
          <p className="hidden max-w-xs text-sm leading-6 text-frangipani/75 md:block">
            A practical interface language shaped by Bali’s materials, independent operators, and travelers on the move.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
        <section aria-labelledby="foundations-heading" className="grid gap-8 border-b border-charcoal/25 pb-16 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">01 / Foundations</p>
            <h2 id="foundations-heading" className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">A grounded palette</h2>
          </div>
          <div className="lg:col-span-9">
            <div className="grid grid-cols-2 border-l border-t border-charcoal/20 sm:grid-cols-4">
              {colors.map(([name, hex, background, foreground]) => (
                <div key={name} className={`${background} ${foreground} flex min-h-40 flex-col justify-end border-b border-r border-charcoal/20 p-4`}>
                  <span className="text-sm font-semibold">{name}</span>
                  <span className="mt-1 font-mono text-xs opacity-75">{hex}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-weathered">Newsreader / Display</p>
                <p className="mt-4 font-serif text-5xl leading-[1.02]">The mountain before the crowds.</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-weathered">Source Sans 3 / Interface</p>
                <p className="mt-4 max-w-md text-lg leading-7">
                  Clear pickup details, honest pricing, and a local driver you can reach before the journey begins.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="actions-heading" className="grid gap-8 border-b border-charcoal/25 py-16 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">02 / Actions</p>
            <h2 id="actions-heading" className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Clear next steps</h2>
          </div>
          <div className="space-y-10 lg:col-span-9">
            <div className="flex flex-wrap items-center gap-4">
              <Button>Check availability <ArrowUpRight aria-hidden="true" className="size-4" /></Button>
              <Button variant="secondary">Build a custom tour</Button>
              <Button variant="outline">View itinerary</Button>
              <Button variant="ghost">Ask a question</Button>
              <Button loading>Checking</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="category">Trekking</Badge>
              <Badge tone="category">Water sports</Badge>
              <Badge tone="clay">Cultural tour</Badge>
              <Badge tone="trust"><Check aria-hidden="true" className="size-3.5" /> Direct local booking</Badge>
              <Badge tone="warning">Only 3 spots left</Badge>
            </div>
          </div>
        </section>

        <section aria-labelledby="forms-heading" className="grid gap-8 border-b border-charcoal/25 py-16 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">03 / Forms</p>
            <h2 id="forms-heading" className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Easy under pressure</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-weathered">
              Native controls and generous touch targets keep last-minute mobile booking quick and accessible.
            </p>
          </div>
          <form className="grid gap-6 rounded-surface border border-charcoal/25 bg-frangipani p-5 shadow-sun md:grid-cols-2 lg:col-span-9 lg:p-8" aria-label="Component example form">
            <Input label="Destination or experience" placeholder="e.g. Mount Batur" hint="Search by place, activity, or tour name." />
            <DatePicker label="Travel date" min="2026-08-08" />
            <Select label="Travelers" defaultValue="2">
              <option value="1">1 traveler</option>
              <option value="2">2 travelers</option>
              <option value="3">3 travelers</option>
              <option value="4">4 travelers</option>
              <option value="5">5+ travelers</option>
            </Select>
            <Input label="Email address" type="email" placeholder="you@example.com" error="Enter a valid email address." />
          </form>
        </section>

        <section aria-labelledby="commerce-heading" className="grid gap-8 py-16 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">04 / Commerce</p>
            <h2 id="commerce-heading" className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Trust in the details</h2>
          </div>
          <div className="grid gap-7 md:grid-cols-2 lg:col-span-9">
            <Card interactive>
              <div className="relative flex min-h-48 items-end overflow-hidden bg-terrace p-5 text-frangipani">
                <div className="absolute -right-10 -top-16 size-48 rounded-full border-[34px] border-gold/25" aria-hidden="true" />
                <div className="relative">
                  <Badge className="mb-3" tone="neutral">Early start</Badge>
                  <p className="text-sm font-semibold">Kintamani · 03:30 pickup</p>
                </div>
              </div>
              <CardHeader>
                <CardEyebrow>Private full-day tour</CardEyebrow>
                <CardTitle>Mount Batur sunrise &amp; hot springs</CardTitle>
                <CardDescription>Quiet trail access, breakfast at the summit, and a private transfer back to your hotel.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-weathered">
                <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-4" /> 10 hours</span>
                <span className="inline-flex items-center gap-1.5"><Users aria-hidden="true" className="size-4" /> 1–5 guests</span>
                <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-4" /> Hotel pickup</span>
              </CardContent>
              <CardFooter>
                <PriceTag idr={850000} usdApprox={52} size="sm" />
                <RatingStars rating={4.9} reviewCount={128} />
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardEyebrow>Price display</CardEyebrow>
                  <CardTitle>One total, two currencies</CardTitle>
                  <CardDescription>USD is an estimate for quick comparison. Midtrans settles the final payment in IDR.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-end justify-between gap-6">
                  <PriceTag idr={1250000} usdApprox={76} size="lg" suffix="for 2 guests" />
                  <RatingStars rating={4.8} reviewCount={356} />
                </CardContent>
              </Card>

              <div id="whatsapp-configuration" className="border-l-4 border-gold bg-charcoal p-6 text-frangipani">
                <p className="font-serif text-2xl">Prefer to talk it through?</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-frangipani/70">
                  The WhatsApp action becomes live when the business number is added to the environment configuration.
                </p>
                <WhatsAppButton className="mt-5 border-gold bg-gold text-charcoal" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
