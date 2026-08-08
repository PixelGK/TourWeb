import type { ReactNode } from "react";

export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <header className="grid gap-5 border-b-2 border-charcoal pb-6 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl leading-none sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-weathered sm:text-base">{description}</p>
      </div>
      {action}
    </header>
  );
}
