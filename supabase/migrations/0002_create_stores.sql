-- Create stores table and public view without dashboard_pin
create table if not exists stores (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  store_name text not null,
  owner_name text not null,
  whatsapp_number text not null,
  category text not null,
  location text not null,
  currency_symbol text default '₦',
  currency_code text default 'NGN',
  template_id text default 'noir',
  tagline text,
  dashboard_pin text not null,
  products jsonb default '[]',
  is_active boolean default true,
  created_at timestamp default now()
);

-- Create a public view that excludes dashboard_pin
create or replace view public_stores as
select id, slug, store_name, owner_name, whatsapp_number, category, location, currency_symbol, currency_code, template_id, tagline, products, is_active, created_at
from stores;

-- Enable RLS on the base table
alter table stores enable row level security;

-- Allow service role (server) to insert/update/delete by keeping default policies minimal.
-- Policy: allow service role via check on invocation using hasura-style? Instead we'll rely on service role key used by server-side client.

-- Allow anon/public select via RLS only when is_active is true
create policy "public_select_active" on stores
  for select using (is_active = true);

-- Revoke direct selection on underlying table from public to encourage using the view
revoke all on stores from public;
grant select on public_stores to public;
