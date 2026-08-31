# BaliXperience

BaliXperience is a mobile-first booking site for a Bali-based private tour and driver operator. It covers day tours, activities, car charters, multi-day trips, checkout, availability, and a small admin dashboard.

## Stack

- Next.js App Router, TypeScript, and Tailwind CSS
- Prisma ORM with Supabase Postgres
- Midtrans Snap behind a payment-provider interface
- Resend transactional email
- Vercel deployment target

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and add your own credentials.
3. Run `pnpm prisma generate`.
4. Start the app with `pnpm dev`.

Useful checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run the non-mutating production smoke checks with:

```bash
pnpm smoke:production
```

Generate distinct runtime secrets locally with:

```bash
pnpm secrets:generate
```

To create the database-safe admin password hash, set `ADMIN_PASSWORD`
temporarily in your shell and run `pnpm admin:hash-password`. Store only the
resulting hash in `.env.local`; never store the plain password.

After changing the hash, run `pnpm admin:sync` to update and verify the
database admin account without exposing the hash in a SQL command.

Never commit `.env.local`. Runtime credentials belong in Vercel; the direct
database URL and seed-only admin password hash stay in `.env.local` or a
dedicated migration environment.

## Payments

Checkout creates a booking first and then opens Midtrans Snap. The browser return is not treated as proof of payment; only a correctly signed Midtrans webhook can mark a booking as paid. Card details are entered on Midtrans and are never handled or stored by this application.

## Current deployment note

Tour browsing, availability, admin management, and request-first checkout are implemented. Midtrans remains disabled until BaliXperience has the required company and merchant setup. Do not switch `BOOKING_FLOW_MODE` away from `request` merely because a server key is available.

## Temporary photography

Public pages currently use real Unsplash photography as temporary material. These images are not AI-generated and should be replaced with original BaliXperience photographs before the final brand launch.
