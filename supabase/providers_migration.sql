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
