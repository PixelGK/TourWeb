import { allTours } from "@/data/mock-tours";

export const mockAdminBookings = [
  { id: "mock-booking-1", reference: "BX-20260815-7D4B9F2C8A103E6B", customerName: "Sophie Martin", customerEmail: "sophie@example.com", customerPhone: "+33 6 12 34 56 78", tourId: allTours[0].slug, tourTitle: allTours[0].title, date: "2026-08-15", paxCount: 2, totalAmountIdr: 1700000, status: "PAID", paymentStatus: "PAID", createdAt: "2026-08-08T02:14:00.000Z" },
  { id: "mock-booking-2", reference: "BX-20260816-A53C1D8E7094BB22", customerName: "Daniel Wu", customerEmail: "daniel@example.com", customerPhone: "+65 8123 4567", tourId: allTours[3].slug, tourTitle: allTours[3].title, date: "2026-08-16", paxCount: 3, totalAmountIdr: 1950000, status: "PENDING", paymentStatus: "PENDING", createdAt: "2026-08-08T04:42:00.000Z" },
  { id: "mock-booking-3", reference: "BX-20260817-F090CA7B35E41192", customerName: "Amelia Jones", customerEmail: "amelia@example.com", customerPhone: "+44 7700 900123", tourId: allTours[6].slug, tourTitle: allTours[6].title, date: "2026-08-17", paxCount: 4, totalAmountIdr: 2600000, status: "PAID", paymentStatus: "PAID", createdAt: "2026-08-07T09:08:00.000Z" },
  { id: "mock-booking-4", reference: "BX-20260818-118D2F43A09CE7B1", customerName: "Noah Schmidt", customerEmail: "noah@example.com", customerPhone: "+49 1512 3456789", tourId: allTours[1].slug, tourTitle: allTours[1].title, date: "2026-08-18", paxCount: 2, totalAmountIdr: 2700000, status: "CANCELLED", paymentStatus: "EXPIRED", createdAt: "2026-08-07T12:21:00.000Z" },
  { id: "mock-booking-5", reference: "BX-20260820-CE7B148D02A911F3", customerName: "Isabella Rossi", customerEmail: "isabella@example.com", customerPhone: "+39 320 123 4567", tourId: allTours[2].slug, tourTitle: allTours[2].title, date: "2026-08-20", paxCount: 2, totalAmountIdr: 1950000, status: "PAID", paymentStatus: "PAID", createdAt: "2026-08-06T05:55:00.000Z" },
] as const;

export function mockUpcomingAvailability() {
  return allTours.slice(0, 7).map((tour, index) => ({
    id: `mock-availability-${index}`,
    tourId: tour.slug,
    tourTitle: tour.title,
    date: `2026-08-${String(15 + index).padStart(2, "0")}`,
    capacity: 6,
    spotsRemaining: Math.max(0, 6 - (index % 5)),
    activeBookings: index % 4,
    isOpen: index !== 5,
  }));
}
