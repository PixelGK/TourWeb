import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return (
    <main className="min-h-[100dvh] bg-limestone text-charcoal">
      <SiteHeader />
      <section className="site-shell py-16 sm:py-24" aria-labelledby="not-found-heading">
        <div className="max-w-3xl border-l-4 border-gold bg-frangipani px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-sm font-semibold text-clay">404</p>
          <h1 id="not-found-heading" className="mt-3 max-w-[13ch] font-serif text-4xl font-normal leading-none sm:text-6xl">That Bali page is not here.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-weathered">The link may be old, or the experience may no longer be published. The current tour list is the best place to continue.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tours" className="inline-flex min-h-12 items-center justify-center border border-gold bg-gold px-6 font-semibold text-charcoal hover:bg-gold-dark focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">Browse tours</Link>
            <Link href="/plan" className="inline-flex min-h-12 items-center justify-center border border-charcoal/35 px-6 font-semibold text-charcoal hover:bg-charcoal hover:text-frangipani focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">Plan a private day</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
