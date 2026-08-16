import { Menu, MessageCircle } from "lucide-react";
import Link from "next/link";

const navigation = [
  { href: "/#top-picks", label: "Top tours" },
  { href: "/tours", label: "All routes" },
  { href: "/plan", label: "Build a trip" },
  { href: "/#day-plan", label: "The Day Plan" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <>
      <div className="bg-charcoal px-5 py-2 text-center text-xs font-semibold tracking-[0.04em] text-frangipani/80">
        Private Bali drivers · Clear IDR pricing · One local contact
      </div>
      <header className="relative z-40 border-b border-charcoal/20 bg-limestone/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <Link href="/" className="group inline-flex items-baseline font-bold uppercase tracking-[-0.035em] text-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus" aria-label="BaliXperience home">
            <span className="text-xl">Bali</span>
            <span className="mx-0.5 text-2xl font-light text-gold transition-transform duration-fast group-hover:-rotate-12">/</span>
            <span className="text-xl">Xperience</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="border-b border-transparent py-1 text-sm font-semibold text-charcoal transition-colors duration-fast hover:border-gold hover:text-terrace focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/contact" className="hidden min-h-11 items-center gap-2 rounded-control border border-terrace bg-terrace px-4 text-sm font-semibold text-frangipani shadow-sun-dark transition-[background-color,box-shadow,transform] duration-fast hover:-translate-y-0.5 hover:bg-terrace-light focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus sm:inline-flex">
            <MessageCircle aria-hidden="true" className="size-4" />
            Ask a local
          </Link>

          <details className="group relative lg:hidden">
            <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-control border border-charcoal/30 text-charcoal focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Open navigation</span>
            </summary>
            <nav className="absolute right-0 top-14 w-64 border border-charcoal/25 bg-frangipani p-2 shadow-sun-raised" aria-label="Mobile navigation">
              {navigation.map((item, index) => (
                <Link key={item.href} href={item.href} className="flex min-h-11 items-center border-b border-charcoal/10 px-3 text-sm font-semibold text-charcoal last:border-b-0 hover:bg-limestone focus-visible:outline-2 focus-visible:outline-focus">
                  <span className="mr-3 text-xs tabular-nums text-clay">0{index + 1}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
