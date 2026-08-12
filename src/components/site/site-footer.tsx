import { MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";

import { WhatsAppButton } from "@/components/ui/whatsapp-button";

export function SiteFooter() {
  return (
    <footer id="footer-contact" className="bg-charcoal text-frangipani">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20">
        <div className="lg:col-span-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Talk to us on WhatsApp</p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.02] sm:text-5xl">Not sure which tour fits? Ask us.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-frangipani/70">Send your travel date, hotel area, and what you want to see. We’ll reply with a route and price.</p>
          <WhatsAppButton className="mt-7 border-gold bg-gold text-charcoal">Message BaliXperience</WhatsAppButton>
        </div>

        <div className="grid gap-8 border-t border-frangipani/20 pt-8 sm:grid-cols-2 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Explore</p>
            <nav className="mt-4 flex flex-col gap-3 text-sm" aria-label="Footer navigation">
              <Link href="/#top-picks" className="hover:text-gold">Top tours</Link>
              <Link href="/tours" className="hover:text-gold">All experiences</Link>
              <Link href="/#custom-tour" className="hover:text-gold">Custom tour</Link>
              <Link href="/about" className="hover:text-gold">About</Link>
              <Link href="/contact" className="hover:text-gold">Contact</Link>
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Based in Bali</p>
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-frangipani/70"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />Private tours and driver hire across the island.</p>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-frangipani/70"><MessageCircle aria-hidden="true" className="mt-1 size-4 shrink-0" />WhatsApp support before pickup and during your trip.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-frangipani/15 px-5 py-5 text-xs text-frangipani/55">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 sm:px-3 lg:px-7">
          <span>© 2026 BaliXperience</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Prices shown in IDR · USD estimates for comparison</span>
            <Link href="/terms" className="hover:text-gold">Terms</Link>
            <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
