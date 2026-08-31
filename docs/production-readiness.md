# BaliXperience production readiness

This document separates technical readiness from the supplier and pricing decisions that require the operator.

## Current launch mode

- `BOOKING_FLOW_MODE` must remain `request`.
- A booking request is not a paid booking.
- Midtrans stays disabled until the company and merchant account are ready.
- Tour prices, supplier costs, admissions, cancellation rules, and pickup charges are not changed by technical launch work.

## Release checks

Before promoting a Vercel preview:

1. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.
2. Test at 390px, 768px, 1024px, and 1440px.
3. Verify search, collection filters, pagination, tour details, date selection, pickup area, discounts, booking request, email delivery, admin confirmation, cancellation, and availability restoration.
4. Confirm the one-year booking window and the configured Nyepi blackout.
5. Run `pnpm smoke:production` after promotion.
6. Keep the previous Vercel deployment available for immediate rollback.

Production smoke checks are read-only. They never submit a booking.

## Database access and recovery

The application connects to Postgres through Prisma on the server. It does not query business tables directly from a browser Supabase client.

Verified on 2026-08-31:

- All 14 application tables in `public` have row-level security enabled.
- `anon` and `authenticated` have no table grants on those tables.
- Supabase security advisors report only the expected informational notices for server-only tables with RLS and no policies.
- Performance advisors report unused indexes only. Do not remove them until representative production traffic exists.

Before any production DDL:

1. Confirm a current Supabase backup or create an encrypted schema and data backup.
2. Test the SQL against an isolated database or Supabase branch.
3. Run Supabase security and performance advisors.
4. Apply one reviewed migration.
5. Verify the affected query and booking flow.
6. Record the rollback SQL or restore point.

## Migration-history hold

The live Supabase migration inventory and the migration folders currently in Git do not fully match. Some early live migrations are absent from the branch, while some later SQL was applied outside the recorded live migration sequence.

Until this is reconciled:

- Do not add `prisma migrate deploy` to Vercel.
- Do not fabricate migration files or checksums.
- Do not mark migrations as applied directly on production.
- Treat `prisma/schema.prisma` plus the live schema as the current structural source of truth.

Reconciliation procedure:

1. Export a schema-only snapshot from production.
2. Recover the missing original SQL from Git history, prior worktrees, or deployment records.
3. Apply the reconstructed chain to an empty disposable Postgres database.
4. Compare the result with both `prisma/schema.prisma` and the production schema.
5. If exact historical SQL cannot be recovered, create and document a clean baseline for new environments on a database clone. Do not rewrite production migration history.
6. Only enable automated migration deployment after a clean database can be created reproducibly from the repository.

## Secret rotation

These values were previously shared outside the secret manager and must be rotated before broad public promotion:

- Supabase database password and both connection URLs.
- Resend API key.
- Admin password hash and session secret.
- Rate-limit salt.

The Supabase publishable key is intended for browser use. Database passwords, Resend keys, admin secrets, and Midtrans keys are not.

Rotate one system at a time, update Vercel and local development, redeploy, and verify the affected flow before rotating the next value. Never print current or replacement values in CI logs.

## Monitoring

Sentry is deferred. For the request-first launch:

- Use Vercel runtime logs and Speed Insights.
- Check admin booking and email-delivery status daily during the first week.
- Review failed request, rate-limit, Turnstile, and email logs without storing customer form content.
- Add Sentry only if production errors cannot be diagnosed reliably from existing logs.

## Business launch gates

Technical readiness does not validate package profitability or supplier terms. Before paid promotion, the operator still needs to review every published package for supplier cost, admissions, pickup cost, availability, cancellation rules, and minimum acceptable margin.
