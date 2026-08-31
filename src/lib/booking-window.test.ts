import assert from "node:assert/strict";
import test from "node:test";

import { BOOKING_WINDOW_DAYS, getBookingWindow, isInsideBookingWindow } from "./booking-window";

test("booking window starts on the Bali calendar date and ends 365 days later", () => {
  const reference = new Date("2026-08-31T16:30:00.000Z");
  const window = getBookingWindow(reference);
  assert.equal(window.minDate, "2026-09-01");
  assert.equal(window.maxDate, "2027-09-01");
  assert.equal(BOOKING_WINDOW_DAYS, 365);
});

test("booking window includes its boundary dates and rejects dates outside them", () => {
  const reference = new Date("2026-08-31T04:00:00.000Z");
  assert.equal(isInsideBookingWindow("2026-08-31", reference), true);
  assert.equal(isInsideBookingWindow("2027-08-31", reference), true);
  assert.equal(isInsideBookingWindow("2026-08-30", reference), false);
  assert.equal(isInsideBookingWindow("2027-09-01", reference), false);
});
