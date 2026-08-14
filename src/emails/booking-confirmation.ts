import type { BookingWithTour } from "@/lib/booking-service";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export function bookingConfirmationHtml(booking: BookingWithTour) {
  const date = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "Asia/Makassar" }).format(booking.availability.date);
  const name = escapeHtml(booking.customerName);
  const tour = escapeHtml(booking.tour.title);
  const reference = escapeHtml(booking.reference);

  return `<!doctype html>
<html lang="en"><body style="margin:0;background:#EDE7DA;color:#1C1B18;font-family:Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">Your BaliXperience booking ${reference} is confirmed.</div>
  <main style="max-width:620px;margin:0 auto;padding:32px 18px">
    <div style="background:#2F4A3C;color:#FFF9EC;padding:26px 28px">
      <p style="margin:0 0 10px;text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#D9B06E">BaliXperience · booking confirmed</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.1">You’re booked, ${name}.</h1>
    </div>
    <div style="background:#FFF9EC;padding:28px;border:1px solid #C9C0AF">
      <p style="margin:0 0 22px;line-height:1.6">Your driver and included arrangements are confirmed. We’ll message you on WhatsApp before pickup with the final meeting details.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;color:#665F54">Tour</td><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;text-align:right;font-weight:bold">${tour}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;color:#665F54">Date</td><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;text-align:right;font-weight:bold">${escapeHtml(date)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;color:#665F54">Travelers</td><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;text-align:right;font-weight:bold">${booking.paxCount}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;color:#665F54">Paid</td><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;text-align:right;font-weight:bold">${idr.format(booking.totalAmountIdr)}</td></tr>
        <tr><td style="padding:10px 0;color:#665F54">Reference</td><td style="padding:10px 0;text-align:right;font-weight:bold">${reference}</td></tr>
      </table>
      <p style="margin:24px 0 0;color:#665F54;font-size:13px;line-height:1.6">Your payment was charged and settled in Indonesian rupiah (IDR). Any USD amount shown while booking was an estimate only.</p>
      <p style="margin:12px 0 0;color:#665F54;font-size:13px;line-height:1.6">Your driver will carry any included admission voucher and assist with entry. Keep your BaliXperience reference for support.</p>
    </div>
  </main>
</body></html>`;
}

export function paymentReceiptHtml(booking: BookingWithTour) {
  const date = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "Asia/Makassar" }).format(booking.availability.date);
  const name = escapeHtml(booking.customerName);
  const tour = escapeHtml(booking.tour.title);
  const reference = escapeHtml(booking.reference);
  return `<!doctype html>
<html lang="en"><body style="margin:0;background:#EDE7DA;color:#1C1B18;font-family:Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">Payment received for BaliXperience booking ${reference}.</div>
  <main style="max-width:620px;margin:0 auto;padding:32px 18px">
    <div style="background:#2F4A3C;color:#FFF9EC;padding:26px 28px">
      <p style="margin:0 0 10px;text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#D9B06E">BaliXperience · payment received</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.1">We’re arranging your day, ${name}.</h1>
    </div>
    <div style="background:#FFF9EC;padding:28px;border:1px solid #C9C0AF">
      <p style="margin:0 0 22px;line-height:1.6">Your payment is verified. We will confirm the driver and any included admission within 12 hours. If we cannot confirm the package, you will receive a full refund.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;color:#665F54">Package</td><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;text-align:right;font-weight:bold">${tour}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;color:#665F54">Date</td><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;text-align:right;font-weight:bold">${escapeHtml(date)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;color:#665F54">Paid</td><td style="padding:10px 0;border-bottom:1px solid #DDD4C4;text-align:right;font-weight:bold">${idr.format(booking.totalAmountIdr)}</td></tr>
        <tr><td style="padding:10px 0;color:#665F54">Booking reference</td><td style="padding:10px 0;text-align:right;font-weight:bold">${reference}</td></tr>
      </table>
      <p style="margin:24px 0 0;color:#665F54;font-size:13px;line-height:1.6">Your driver will carry any included admission voucher and assist with entry. Keep this BaliXperience reference for support.</p>
    </div>
  </main>
</body></html>`;
}
