"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { getBookingWindow } from "@/lib/booking-window";

export function SearchPanel() {
  const [bookingWindow] = useState(getBookingWindow);

  return (
    <form action="#top-picks" className="grid gap-4 rounded-surface border border-charcoal/25 bg-frangipani p-4 shadow-sun-raised sm:p-5 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.8fr_auto] lg:items-end" aria-label="Search Bali tours">
      <Select label="Where or what?" name="destination" defaultValue="">
        <option value="" disabled>Choose an area or experience</option>
        <option value="ubud">Ubud & central Bali</option>
        <option value="batur">Mount Batur</option>
        <option value="nusa-penida">Nusa Penida</option>
        <option value="north-bali">North Bali</option>
        <option value="ubud-adventure">Rafting, ATV & Ubud</option>
        <option value="private-driver">Private driver</option>
      </Select>
      <DatePicker label="Travel date" name="date" min={bookingWindow.minDate} max={bookingWindow.maxDate} suppressHydrationWarning />
      <Select label="Travelers" name="pax" defaultValue="2">
        <option value="1">1 traveler</option>
        <option value="2">2 travelers</option>
        <option value="3">3 travelers</option>
        <option value="4">4 travelers</option>
        <option value="5">5+ travelers</option>
      </Select>
      <Button type="submit" size="lg" className="w-full lg:min-w-38">
        Find tours <ArrowRight aria-hidden="true" className="size-4" />
      </Button>
      <p className="flex items-center gap-1.5 text-xs text-weathered md:col-span-2 lg:col-span-4">
        <MapPin aria-hidden="true" className="size-3.5 text-clay" /> Hotel pickup is available across Bali on most tours.
      </p>
    </form>
  );
}
