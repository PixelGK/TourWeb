"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Public page error", { name: error.name, digest: error.digest });
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] items-center bg-limestone px-5 py-12 text-charcoal">
      <section className="mx-auto w-full max-w-3xl border border-charcoal/20 bg-frangipani px-6 py-10 sm:px-10 sm:py-14" aria-labelledby="error-heading">
        <Link href="/" className="inline-flex min-h-11 items-center font-bold uppercase tracking-[-0.035em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus" aria-label="BaliXperience home">
          Bali<span className="mx-1 text-xl font-light text-gold">/</span>Xperience
        </Link>
        <h1 id="error-heading" className="mt-10 max-w-[13ch] font-serif text-4xl font-normal leading-none sm:text-6xl">This page did not load properly.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-weathered">Your booking details have not been submitted. Try the page again, or return to the tour list.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="inline-flex min-h-12 items-center justify-center border border-gold bg-gold px-6 font-semibold text-charcoal hover:bg-gold-dark focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">Try again</button>
          <Link href="/tours" className="inline-flex min-h-12 items-center justify-center border border-charcoal/35 px-6 font-semibold text-charcoal hover:bg-charcoal hover:text-frangipani focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">Browse tours</Link>
        </div>
      </section>
    </main>
  );
}
