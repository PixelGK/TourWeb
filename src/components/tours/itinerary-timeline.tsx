import type { ItineraryStop } from "@/types/public-tour";

export function ItineraryTimeline({ stops }: { stops: ItineraryStop[] }) {
  return (
    <ol className="relative mt-8">
      {stops.map((stop, index) => (
        <li key={`${stop.time}-${stop.title}`} className="grid grid-cols-[4.75rem_1.5rem_1fr] gap-3 pb-8 last:pb-0 sm:grid-cols-[6rem_2rem_1fr] sm:gap-5">
          <time className="pt-0.5 text-sm font-bold tabular-nums text-clay">{stop.time}</time>
          <div className="relative flex justify-center">
            <span className="relative z-10 mt-1 flex size-4 items-center justify-center rounded-full border-4 border-frangipani bg-gold ring-1 ring-charcoal/35" />
            {index < stops.length - 1 ? <span className="absolute bottom-[-2rem] top-4 w-px bg-charcoal/25" aria-hidden="true" /> : null}
          </div>
          <div>
            <h3 className="font-serif text-2xl leading-tight text-charcoal">{stop.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-weathered">{stop.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
