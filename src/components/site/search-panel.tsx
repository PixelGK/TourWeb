"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { getBookingWindow } from "@/lib/booking-window";
import { trackConversion } from "@/lib/analytics";

export function SearchPanel() {
  const [bookingWindow] = useState(getBookingWindow);

  return (
    <form action="/tours" method="get" onSubmit={(event) => {
      const data = new FormData(event.currentTarget);
      trackConversion("tour_search", { destination: String(data.get("destination") ?? "all"), pax: Number(data.get("pax") ?? 2) });
    }} className="grid gap-2.5" aria-label="Search Bali tours">
      <Select label="Where in Bali?" name="destination" defaultValue="all" containerClassName="[&_label]:text-xs [&_select]:bg-white [&_select]:min-h-11">
        <option value="all">Anywhere in Bali</option>
        <option value="ubud">Ubud & central Bali</option>
        <option value="batur">Mount Batur</option>
        <option value="nusa-penida">Nusa Penida</option>
        <option value="north-bali">North Bali</option>
        <option value="ubud-adventure">Rafting, ATV & Ubud</option>
        <option value="private-driver">Private driver</option>
        <option value="experience-days">Experience days with transport</option>
        <option value="bali-safari">Bali Safari</option>
        <option value="bali-zoo">Bali Zoo</option>
        <option value="waterbom">Waterbom Bali</option>
        <option value="bird-park">Bali Bird Park</option>
        <option value="uluwatu-kecak">Uluwatu & Kecak</option>
        <option value="cooking-class">Balinese cooking class</option>
        <option value="blue-lagoon">Blue Lagoon snorkeling</option>
        <option value="sidemen">Sidemen</option>
      </Select>
      <DatePicker label="Travel date" name="date" min={bookingWindow.minDate} max={bookingWindow.maxDate} suppressHydrationWarning containerClassName="min-w-0 [&_label]:text-xs [&_input]:min-h-11 [&_input]:bg-white" />
      <Select label="Travelers" name="pax" defaultValue="2" containerClassName="min-w-0 [&_label]:text-xs [&_select]:min-h-11 [&_select]:bg-white">
        <option value="1">1 traveler</option>
        <option value="2">2 travelers</option>
        <option value="3">3 travelers</option>
        <option value="4">4 travelers</option>
        <option value="5">5+ travelers</option>
      </Select>
      <Button type="submit" size="lg" className="w-full shadow-none lg:min-w-48">
        Search available tours
      </Button>
    </form>
  );
}
