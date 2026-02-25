-- ============================================================
-- PROVIDERS TABLE (admin-managed, independent of auth.users)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.providers (
  id          uuid default gen_random_uuid() primary key,
  full_name   text not null,
  email       text,
  phone       text,
  service_type text,
  bio         text,
  hourly_rate integer,
  avatar_url  text,
  doc_type    text,          -- e.g. 'Aadhar', 'PAN', 'Voter ID', etc.
  doc_number  text,          -- document identification number
  address     text,          -- provider's full address
  is_approved boolean default false not null,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

-- If the table already exists, run these ALTER statements to add the new columns:
alter table public.providers add column if not exists doc_type   text;
alter table public.providers add column if not exists doc_number text;
alter table public.providers add column if not exists address    text;


-- Enable Row Level Security
alter table public.providers enable row level security;

-- Anyone can view (needed for services page)
create policy "Providers are publicly viewable."
  on public.providers for select
  using ( true );

-- Only service role can insert/update/delete (admin uses anon key but we'll use RLS bypass via supabase service role)
-- For simplicity with anon key, allow all authenticated users to modify (protect at app level via admin layout)
create policy "Authenticated users can manage providers."
  on public.providers for all
  using ( auth.role() = 'authenticated' );

-- ============================================================
-- BOOKINGS: extra admin read policy
-- The schema only allows role='admin' from profiles, but our
-- admin is email-whitelisted. Add this so authenticated admins
-- can read all bookings from the admin panel.
-- ============================================================
drop policy if exists "Authenticated admins can view all bookings." on public.bookings;
create policy "Authenticated admins can view all bookings."
  on public.bookings for select
  using ( auth.role() = 'authenticated' );

-- ============================================================
-- AVAILABLE DAYS: provider working-day preferences
-- Stored as integer[] where 0=Sun,1=Mon,...,6=Sat
-- Default Mon-Sat = {1,2,3,4,5,6}
-- ============================================================
alter table public.providers
  add column if not exists available_days integer[]
  default array[1,2,3,4,5,6];

-- Available time slots: which time windows the provider works
-- null / empty = all slots available
alter table public.providers
  add column if not exists available_time_slots text[];

-- ============================================================
-- OTP VERIFICATION: provider confirms arrival with a 6-digit code
-- otp        → generated at booking time, shown to user
-- otp_verified → true after provider enters correct OTP
-- ============================================================
alter table public.bookings
  add column if not exists otp text;

alter table public.bookings
  add column if not exists otp_verified boolean default false;






-- ============================================================
-- STORAGE BUCKET + POLICIES for provider images
-- Run this entire block in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the bucket (public = images are readable without auth)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'providers',
  'providers',
  true,
  5242880,            -- 5 MB max per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- 2. Public read — anyone can view provider images (needed for services page)
drop policy if exists "Providers images are publicly readable" on storage.objects;
create policy "Providers images are publicly readable"
  on storage.objects for select
  using ( bucket_id = 'providers' );

-- 3. Authenticated upload — logged-in admins can upload new images
drop policy if exists "Authenticated users can upload provider images" on storage.objects;
create policy "Authenticated users can upload provider images"
  on storage.objects for insert
  with check (
    bucket_id = 'providers'
    and auth.role() = 'authenticated'
  );

-- 4. Authenticated update — logged-in admins can replace images
drop policy if exists "Authenticated users can update provider images" on storage.objects;
create policy "Authenticated users can update provider images"
  on storage.objects for update
  using (
    bucket_id = 'providers'
    and auth.role() = 'authenticated'
  );

-- 5. Authenticated delete — logged-in admins can remove images
drop policy if exists "Authenticated users can delete provider images" on storage.objects;
create policy "Authenticated users can delete provider images"
  on storage.objects for delete
  using (
    bucket_id = 'providers'
    and auth.role() = 'authenticated'
  );
