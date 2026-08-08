import { z } from "zod";

import { isInsideBookingWindow } from "@/lib/booking-window";

const cleanSingleLine = (value: string) => value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
const cleanNotes = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const singleLine = (min: number, max: number) => z.string().transform(cleanSingleLine).pipe(z.string().min(min).max(max));

export const checkoutRequestSchema = z.object({
  tourSlug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) && isInsideBookingWindow(value), "Choose a date within the next 12 months"),
  pax: z.coerce.number().int().min(1).max(20),
  addonCodes: z.array(z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(10).transform((items) => [...new Set(items)].sort()),
  traveler: z.object({
    name: singleLine(2, 100),
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    phone: z.string().transform(cleanSingleLine).pipe(z.string().min(7).max(30).regex(/^\+?[0-9 ()-]+$/)),
    country: singleLine(2, 80),
    hotelName: z.string().transform(cleanSingleLine).pipe(z.string().max(140)).optional().default(""),
    notes: z.string().transform(cleanNotes).pipe(z.string().max(800)).optional().default(""),
  }).strict(),
}).strict();

export const idempotencyKeySchema = z.uuid();
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
