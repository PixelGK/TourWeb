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
pnpm build
```

Never commit `.env.local`. Midtrans server keys, database credentials, email credentials, and admin secrets belong in the deployment environment only.

## Payments

Checkout creates a booking first and then opens Midtrans Snap. The browser return is not treated as proof of payment; only a correctly signed Midtrans webhook can mark a booking as paid. Card details are entered on Midtrans and are never handled or stored by this application.

## Current deployment note

Tour browsing, availability, admin management, and the checkout UI are implemented. A production payment cannot be started until the Midtrans server key is configured.

## Image credit

The homepage photograph is by Justyna Kaźmierczak on [Unsplash](https://unsplash.com/photos/a-dirt-road-surrounded-by-palm-trees-and-rice-fields-NILzwbOk-YQ), used under the Unsplash License.
