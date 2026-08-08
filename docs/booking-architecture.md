# Booking and payment invariants

## Capacity under concurrent requests

There is exactly one `availability` row for each tour and calendar date, enforced by a database unique constraint on `(tour_id, date)`. A booking transaction locks that row, releases any expired holds, and then decrements `spots_remaining` only when the row still has at least the requested number of spots.

If two guests try to take the final places at the same time, PostgreSQL serializes their writes to that row. The first transaction can decrement and commit. The second then sees the new value; its conditional update affects zero rows and checkout returns “sold out.” A check constraint independently guarantees that `spots_remaining` can never be negative or exceed `capacity`.

The inventory transaction contains database work only. The Midtrans network request happens after it commits, so a slow external request never holds the availability lock. A failed provider initialization releases the pending hold in another short transaction.

The client sends a UUID idempotency key. The database stores it under a unique constraint along with a hash of the sanitized booking payload. Replaying the same request cannot create another booking, while trying to reuse the key for different details is rejected.

## Payment trust boundary

- Checkout code depends on `PaymentProvider`, not Midtrans response types.
- Raw card data is entered only on Midtrans Snap’s hosted page.
- A browser redirect never marks a booking paid.
- The webhook payload is schema-validated, its Midtrans SHA-512 signature is compared in constant time, and its current state is rechecked through Midtrans’s server API.
- Amount, transaction reference, currency, success status, and fraud status must all agree before the database changes to `PAID`.
- Status transitions and inventory restoration are conditional and transactional, so repeated or out-of-order webhooks are idempotent.
- Resend uses `booking-paid/<booking-id>` as its email idempotency key.

## Supabase and Vercel connections

Vercel runtime code uses `DATABASE_URL`, the Supavisor transaction-pooler URL. Prisma CLI and migrations use `DIRECT_URL`, the direct or session-pooler URL. All tables in Supabase’s exposed `public` schema have RLS enabled and no anonymous policies; validated server routes own booking mutations.
