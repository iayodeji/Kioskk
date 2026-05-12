-- kioskk.me base schema (PRD v1)

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  business_name text not null,
  owner_name text not null,
  whatsapp text not null,
  category text not null,
  location text not null,
  currency text not null,
  currency_symbol text not null,
  pin_hash text not null,
  items jsonb not null,
  ai_config jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null,
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  notes text,
  items jsonb not null,
  total numeric not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_business_id on public.orders (business_id);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create unique index if not exists idx_orders_order_ref on public.orders (order_ref);

alter table public.businesses enable row level security;
alter table public.orders enable row level security;

-- Public storefronts need to fetch business config by slug.
drop policy if exists "public_read_businesses" on public.businesses;
create policy "public_read_businesses"
  on public.businesses
  for select
  using (true);

-- Customers can place orders without accounts.
drop policy if exists "public_insert_orders" on public.orders;
create policy "public_insert_orders"
  on public.orders
  for insert
  with check (true);

