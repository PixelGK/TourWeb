import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, aside }: PageIntroProps) {
  return (
    <section className="border-b border-charcoal/20 bg-frangipani" aria-labelledby="page-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-12 lg:px-12 lg:py-24">
        <div className="lg:col-span-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">{eyebrow}</p>
          <h1 id="page-title" className="mt-5 max-w-[15ch] font-serif text-5xl leading-[0.96] tracking-[-0.035em] text-charcoal sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-weathered sm:text-xl">{description}</p>
        </div>
        {aside ? <div className="self-end border-l-4 border-gold pl-5 lg:col-span-4">{aside}</div> : null}
      </div>
    </section>
  );
}
