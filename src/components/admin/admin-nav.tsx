"use client";

import { BadgePercent, CalendarRange, LayoutDashboard, MapPinned, ReceiptText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dispatch", number: "01", icon: LayoutDashboard },
  { href: "/admin/tours", label: "Tours", number: "02", icon: MapPinned },
  { href: "/admin/availability", label: "Calendar", number: "03", icon: CalendarRange },
  { href: "/admin/bookings", label: "Bookings", number: "04", icon: ReceiptText },
  { href: "/admin/commerce", label: "Rules", number: "05", icon: BadgePercent },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin navigation" className="grid grid-cols-5 lg:block">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("group flex min-h-16 min-w-0 items-center gap-1 overflow-hidden border-r border-frangipani/15 px-1 text-frangipani/65 transition-colors hover:bg-frangipani/8 hover:text-frangipani last:border-r-0 sm:gap-3 sm:px-2 lg:min-h-14 lg:border-b lg:border-r-0 lg:px-5", active && "bg-gold text-charcoal hover:bg-gold hover:text-charcoal")}> 
            <span className="hidden w-5 text-[0.65rem] font-bold tabular-nums tracking-widest sm:block">{item.number}</span>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate text-[0.65rem] font-bold uppercase tracking-[0.04em] sm:text-sm sm:tracking-[0.08em] lg:normal-case lg:tracking-normal">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
