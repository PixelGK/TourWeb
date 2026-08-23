import { Menu } from "lucide-react";
import Link from "next/link";

const navigation = [
  { href: "/tours", label: "Tours" },
  { href: "/tours/private-car-charter-bali", label: "Private driver" },
  { href: "/plan", label: "Plan your day" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ blendsWithHero = false }: { blendsWithHero?: boolean }) {
  return (
      <header data-hero-shell={blendsWithHero || undefined} className="relative z-40 border-b border-charcoal/15 bg-[#fbfaf6] text-charcoal">
        <div className="hidden bg-charcoal text-frangipani sm:block">
          <div className="site-shell flex min-h-8 items-center justify-center text-[0.6875rem] font-semibold tracking-[0.055em] text-frangipani/78">
            Private Bali drivers <span className="mx-2 text-gold">·</span> Clear IDR prices <span className="mx-2 text-gold">·</span> Every request checked before confirmation
          </div>
        </div>
        <div className="site-shell flex min-h-18 items-center justify-between gap-6 lg:min-h-20">
          <Link href="/" className="group inline-flex items-baseline font-bold uppercase tracking-[-0.035em] text-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus" aria-label="BaliXperience home">
            <span className="text-lg sm:text-xl">Bali</span>
            <span className="mx-0.5 text-xl font-light text-gold transition-transform duration-fast group-hover:-rotate-12 sm:text-2xl">/</span>
            <span className="text-lg sm:text-xl">Xperience</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="border-b border-transparent py-1 text-sm font-semibold text-charcoal/78 transition-colors duration-fast hover:border-gold hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/contact" className="hidden min-h-11 items-center border-b border-charcoal/35 text-sm font-semibold text-charcoal transition-colors hover:border-gold hover:text-terrace focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus sm:inline-flex">
            Ask a question
          </Link>

          <details className="group relative lg:hidden">
            <summary className="flex size-11 cursor-pointer list-none items-center justify-center text-charcoal focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Open navigation</span>
            </summary>
            <nav className="absolute right-0 top-14 w-64 border border-charcoal/20 bg-[#fbfaf6] p-2 shadow-lg" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="flex min-h-11 items-center border-b border-charcoal/10 px-3 text-sm font-semibold text-charcoal last:border-b-0 hover:bg-limestone focus-visible:outline-2 focus-visible:outline-focus">
                  {item.label}
                </Link>
              ))}
              <Link href="/contact" className="mt-2 flex min-h-11 items-center bg-terrace px-3 text-sm font-semibold text-frangipani focus-visible:outline-2 focus-visible:outline-focus">Ask a question</Link>
            </nav>
          </details>
        </div>
      </header>
  );
}
