import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const routeChecks = [
  {
    label: "Pickup and driver",
    copy: "Your hotel area, meeting time and driver contact are confirmed before pickup.",
  },
  {
    label: "The day in driving order",
    copy: "Stops are arranged around the road, with anything flexible marked clearly.",
  },
  {
    label: "What the package includes",
    copy: "Admissions, meals and anything paid at the venue are listed without vague package wording.",
  },
  {
    label: "One final price in IDR",
    copy: "The vehicle, selected extras, discount and any pickup surcharge are shown before confirmation.",
  },
] as const;

export function DayPlanPromise({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section className="border-y border-charcoal/20 bg-limestone px-5 py-6 sm:px-7" aria-labelledby="day-plan-detail-heading">
        <h2 id="day-plan-detail-heading" className="font-serif text-3xl font-normal text-charcoal sm:text-4xl">Before pickup</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-weathered">We confirm your pickup, the planned route, included admissions and any costs paid on the day.</p>
      </section>
    );
  }

  return (
    <section id="day-plan" className="scroll-mt-20 border-y border-charcoal/15 bg-[#fbfaf6]" aria-labelledby="day-plan-heading">
      <div className="site-shell py-14 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <header className="lg:col-span-5">
            <h2 id="day-plan-heading" className="max-w-[12ch] font-serif text-4xl font-normal leading-[0.98] tracking-[-0.025em] text-charcoal sm:text-5xl lg:text-6xl">Your Bali day, checked before pickup.</h2>
          </header>
          <div className="max-w-2xl lg:col-span-5 lg:col-start-8 lg:pt-6">
            <p className="text-lg leading-8 text-charcoal/78">Before confirming, we put the practical details in one written Day Plan. You know what is arranged and what may still be flexible.</p>
          </div>
        </div>

        <div className="mt-9 grid overflow-hidden border border-charcoal/18 bg-frangipani lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
          <figure className="relative min-h-80 overflow-hidden bg-terrace sm:min-h-[30rem] lg:min-h-[35rem]">
            <Image
              src="https://images.unsplash.com/photo-1674305906278-cb0f1dcaf5da?auto=format&fit=crop&w=1800&q=84"
              alt="A road running between rice fields in Bali"
              fill
              sizes="(max-width: 1023px) 100vw, 65vw"
              className="object-cover transition-transform duration-slow hover:scale-[1.018]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/90 via-charcoal/60 to-transparent px-5 pb-5 pt-20 text-frangipani sm:px-7 sm:pb-7">
              <p className="max-w-2xl font-serif text-2xl leading-tight sm:text-3xl">Start with your hotel area. Then build the day in one sensible direction.</p>
            </figcaption>
          </figure>

          <div className="flex flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <p className="font-serif text-2xl leading-tight text-terrace sm:text-3xl">What arrives in your BaliXperience Day Plan</p>
            <ol className="mt-7 border-t border-charcoal/20">
              {routeChecks.map(({ label, copy }, index) => (
                <li key={label} className="grid grid-cols-[2rem_1fr] gap-4 border-b border-charcoal/18 py-5">
                  <span className="font-serif text-lg text-clay">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-base font-bold text-charcoal">{label}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-weathered">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/plan" className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 border-b border-charcoal/40 text-sm font-semibold text-charcoal hover:border-gold hover:text-terrace focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
              Plan a day from my hotel <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
