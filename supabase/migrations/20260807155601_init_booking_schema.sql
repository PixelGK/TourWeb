create extension if not exists pgcrypto with schema extensions;

create type "TourCategory" as enum (
  'TREKKING', 'WATER_SPORTS', 'CULTURAL_TOUR', 'CAR_CHARTER',
  'MULTI_DAY_TRIP', 'CUSTOM_TOUR', 'ISLAND_TRIP', 'NATURE'
);
create type "BookingStatus" as enum ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');
create type "PaymentProviderName" as enum ('MIDTRANS');
create type "PaymentStatus" as enum ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED');
create type "AddonPricingMode" as enum ('PER_PERSON', 'PER_BOOKING');
create type "UserRole" as enum ('ADMIN', 'CUSTOMER');

create table public.tours (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  category "TourCategory" not null,
  duration_minutes integer not null,
  base_price_idr integer not null,
  images text[] not null default '{}',
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  meeting_point text not null,
  cancellation_policy text not null,
  max_group_size integer not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tours_duration_positive check (duration_minutes > 0),
  constraint tours_price_nonnegative check (base_price_idr >= 0),
  constraint tours_group_size_positive check (max_group_size > 0)
);

create table public.tour_itinerary_stops (
  id uuid primary key default extensions.gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  position integer not null,
  time_label text not null,
  title text not null,
  description text not null,
  constraint tour_itinerary_position_nonnegative check (position >= 0),
  constraint tour_itinerary_tour_position_key unique (tour_id, position)
);

create table public.tour_pricing_tiers (
  id uuid primary key default extensions.gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  min_pax integer not null,
  max_pax integer not null,
  per_person_idr integer not null,
  constraint tour_pricing_tiers_range_key unique (tour_id, min_pax, max_pax),
  constraint tour_pricing_tiers_valid_range check (min_pax > 0 and max_pax >= min_pax),
  constraint tour_pricing_tiers_price_nonnegative check (per_person_idr >= 0)
);

create table public.availability (
  id uuid primary key default extensions.gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  date date not null,
  capacity integer not null,
  spots_remaining integer not null,
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_tour_date_key unique (tour_id, date),
  constraint availability_capacity_positive check (capacity > 0),
  constraint availability_spots_bounds check (spots_remaining >= 0 and spots_remaining <= capacity)
);

create table public.tour_addons (
  id uuid primary key default extensions.gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  price_idr integer not null,
  pricing_mode "AddonPricingMode" not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tour_addons_tour_code_key unique (tour_id, code),
  constraint tour_addons_price_nonnegative check (price_idr >= 0)
);

create table public.bookings (
  id uuid primary key default extensions.gen_random_uuid(),
  reference text not null unique,
  tour_id uuid not null references public.tours(id) on delete restrict,
  availability_id uuid not null references public.availability(id) on delete restrict,
  pax_count integer not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_country text not null,
  hotel_name text,
  notes text,
  status "BookingStatus" not null default 'PENDING',
  total_amount_idr integer not null,
  currency text not null default 'IDR',
  payment_provider "PaymentProviderName" not null,
  payment_status "PaymentStatus" not null default 'PENDING',
  payment_transaction_id text unique,
  idempotency_key text not null unique,
  idempotency_request_hash text not null,
  held_until timestamptz not null,
  paid_at timestamptz,
  cancelled_at timestamptz,
  confirmation_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_pax_positive check (pax_count > 0),
  constraint bookings_total_nonnegative check (total_amount_idr >= 0),
  constraint bookings_currency_idr check (currency = 'IDR')
);

create table public.booking_addons (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  addon_id uuid not null references public.tour_addons(id) on delete restrict,
  quantity integer not null,
  unit_price_idr integer not null,
  primary key (booking_id, addon_id),
  constraint booking_addons_quantity_positive check (quantity > 0),
  constraint booking_addons_price_nonnegative check (unit_price_idr >= 0)
);

create table public.users (
  id uuid primary key default extensions.gen_random_uuid(),
  email text not null unique,
  name text,
  password_hash text not null,
  role "UserRole" not null default 'ADMIN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rate_limit_buckets (
  key text primary key,
  count integer not null,
  window_start timestamptz not null,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint rate_limit_count_positive check (count > 0),
  constraint rate_limit_window_valid check (reset_at > window_start)
);

-- PostgreSQL does not automatically index foreign keys.
create index tours_category_published_idx on public.tours(category, published);
create index tour_itinerary_stops_tour_id_idx on public.tour_itinerary_stops(tour_id);
create index tour_pricing_tiers_tour_id_idx on public.tour_pricing_tiers(tour_id);
create index availability_date_idx on public.availability(date);
create index availability_tour_id_idx on public.availability(tour_id);
create index availability_open_dates_idx on public.availability(tour_id, date) where is_open = true;
create index tour_addons_tour_id_idx on public.tour_addons(tour_id);
create index booking_addons_addon_id_idx on public.booking_addons(addon_id);
create index bookings_availability_status_idx on public.bookings(availability_id, status);
create index bookings_tour_id_idx on public.bookings(tour_id);
create index bookings_status_created_at_idx on public.bookings(status, created_at);
create index bookings_customer_email_idx on public.bookings(customer_email);
create index rate_limit_buckets_reset_at_idx on public.rate_limit_buckets(reset_at);

-- Keep hot operational indexes small.
create index bookings_pending_holds_idx
  on public.bookings(availability_id, held_until)
  where status = 'PENDING';
create index tour_addons_active_idx
  on public.tour_addons(tour_id, code)
  where active = true;

-- These tables are in Supabase's exposed public schema. No browser-facing policies
-- are granted: all booking writes go through validated server routes using the
-- backend database role. Admin policies can be added with the auth phase.
alter table public.tours enable row level security;
alter table public.tour_itinerary_stops enable row level security;
alter table public.tour_pricing_tiers enable row level security;
alter table public.availability enable row level security;
alter table public.tour_addons enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_addons enable row level security;
alter table public.users enable row level security;
alter table public.rate_limit_buckets enable row level security;

-- The application uses a server-side Prisma connection. Keep the publishable
-- Data API roles from reading customer, booking, admin, or operational data.
revoke all on table public.tours from anon, authenticated;
revoke all on table public.tour_itinerary_stops from anon, authenticated;
revoke all on table public.tour_pricing_tiers from anon, authenticated;
revoke all on table public.availability from anon, authenticated;
revoke all on table public.tour_addons from anon, authenticated;
revoke all on table public.bookings from anon, authenticated;
revoke all on table public.booking_addons from anon, authenticated;
revoke all on table public.users from anon, authenticated;
revoke all on table public.rate_limit_buckets from anon, authenticated;
