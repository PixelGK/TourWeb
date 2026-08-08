export const BOOKING_WINDOW_DAYS = 365;

function baliDateString(referenceDate: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(referenceDate);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function getBookingWindow(referenceDate = new Date()) {
  const minDate = baliDateString(referenceDate);
  return { minDate, maxDate: addDays(minDate, BOOKING_WINDOW_DAYS) };
}

export function isInsideBookingWindow(date: string, referenceDate = new Date()) {
  const { minDate, maxDate } = getBookingWindow(referenceDate);
  return date >= minDate && date <= maxDate;
}
