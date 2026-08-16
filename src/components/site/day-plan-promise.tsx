import { Check, CloudSun, MapPinned, ReceiptText } from "lucide-react";

const planLines = [
  {
    label: "Fixed",
    title: "The part you came for",
    copy: "Your main temple, activity, trek or park entry is timed first.",
    icon: MapPinned,
  },
  {
    label: "Flexible",
    title: "The route around it",
    copy: "Nearby stops can move with traffic, weather and how the day feels.",
    icon: CloudSun,
  },
  {
    label: "Written down",
    title: "What the price covers",
    copy: "See what is included, what is paid there and any pickup supplement.",
    icon: ReceiptText,
  },
] as const;

export function DayPlanPromise({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section className="border-l-4 border-gold bg-terrace px-5 py-6 text-frangipani sm:px-7" aria-labelledby="day-plan-detail-heading">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Included with every booking</p>
        <h2 id="day-plan-detail-heading" className="mt-3 font-serif text-3xl sm:text-4xl">Your BaliXperience Day Plan</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-frangipani/70">Before pickup, we confirm the day’s fixed experience, the stops that can flex, and what you will pay now or on the day.</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-frangipani/85">
          <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-3.5 text-gold" /> Pickup and driver</span>
          <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-3.5 text-gold" /> Route priorities</span>
          <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-3.5 text-gold" /> Clear extra costs</span>
        </div>
      </section>
    );
  }

  return (
    <section id="day-plan" className="scroll-mt-20 bg-terrace text-frangipani" aria-labelledby="day-plan-heading">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-b border-frangipani/20 px-5 py-12 sm:px-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">The BaliXperience Day Plan</p>
          <h2 id="day-plan-heading" className="mt-4 max-w-md font-serif text-4xl leading-[1.02] sm:text-5xl">One anchor. A day that can still breathe.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-frangipani/70">Bali rarely runs exactly to a spreadsheet. We lock in the part that matters, then give your local driver room to shape the rest around the island as it is that day.</p>
        </div>

        <div className="relative px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="border border-frangipani/25 bg-charcoal/25">
            <div className="flex items-center justify-between border-b border-frangipani/20 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Your day · confirmed before pickup</p>
                <p className="mt-1 text-sm text-frangipani/60">Shared by WhatsApp, in plain language</p>
              </div>
              <span className="hidden font-serif text-2xl text-frangipani/35 sm:block">BX / DAY</span>
            </div>
            <div>
              {planLines.map(({ label, title, copy, icon: Icon }, index) => (
                <div key={label} className="grid gap-4 border-b border-frangipani/15 px-5 py-5 last:border-b-0 sm:grid-cols-[2.5rem_6rem_1fr] sm:items-start">
                  <span className="flex size-9 items-center justify-center border border-gold/50 text-gold"><Icon aria-hidden="true" className="size-4" /></span>
                  <span className="pt-1 text-xs font-bold uppercase tracking-[0.12em] text-gold">{String(index + 1).padStart(2, "0")} · {label}</span>
                  <div>
                    <h3 className="font-serif text-2xl leading-none">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-frangipani/65">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-frangipani/55">Bali-based planning · experienced local driver · no surprise shopping stops</p>
        </div>
      </div>
    </section>
  );
}
