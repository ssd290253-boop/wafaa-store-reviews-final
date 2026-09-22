-- Wafaa Store: run this file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer_name text not null,
  phone text not null,
  address text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  shipping numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','completed','cancelled'))
);

create table if not exists public.messages (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','read','archived'))
);

create table if not exists public.reviews (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'published' check (status in ('published','hidden'))
);

alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- The public storefront can create records with the anon key.
-- Reading/updating records should be restricted to the owner before production launch.
drop policy if exists "public can create orders" on public.orders;
create policy "public can create orders" on public.orders for insert to anon with check (true);

drop policy if exists "public can create messages" on public.messages;
create policy "public can create messages" on public.messages for insert to anon with check (true);

-- Temporary owner dashboard policy for this frontend-only version.
-- Replace these policies with Supabase Auth policies before accepting sensitive data.
drop policy if exists "anon can read orders for dashboard" on public.orders;
create policy "anon can read orders for dashboard" on public.orders for select to anon using (true);

drop policy if exists "anon can update orders for dashboard" on public.orders;
create policy "anon can update orders for dashboard" on public.orders for update to anon using (true) with check (true);

drop policy if exists "anon can read messages for dashboard" on public.messages;
create policy "anon can read messages for dashboard" on public.messages for select to anon using (true);

drop policy if exists "anon can update messages for dashboard" on public.messages;
create policy "anon can update messages for dashboard" on public.messages for update to anon using (true) with check (true);

drop policy if exists "public can create reviews" on public.reviews;
create policy "public can create reviews" on public.reviews for insert to anon with check (true);

drop policy if exists "anon can read reviews" on public.reviews;
create policy "anon can read reviews" on public.reviews for select to anon using (true);

drop policy if exists "anon can update reviews" on public.reviews;
create policy "anon can update reviews" on public.reviews for update to anon using (true) with check (true);

drop policy if exists "anon can delete reviews" on public.reviews;
create policy "anon can delete reviews" on public.reviews for delete to anon using (true);

-- Note: these open read/update policies are suitable for testing only.
-- Add Supabase Auth and replace them with owner-only policies before launch.
