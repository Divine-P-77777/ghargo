-- ==========================================
-- GharGo: Final Unified Database Schema & Policies
-- ==========================================

-- 1. EXTENSIONS & TYPES
create extension if not exists "uuid-ossp";

do $$ 
begin 
    if not exists (select 1 from pg_type where typname = 'user_role') then
        create type user_role as enum ('admin', 'provider', 'user');
    end if;
    if not exists (select 1 from pg_type where typname = 'booking_status') then
        create type booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
    end if;
end $$;

-- 2. PROFILES TABLE (Core Auth-Linked Platform Users)
create table if not exists public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  full_name text null,
  email text not null unique,
  role public.user_role null default 'user'::user_role,
  avatar_url text null,
  phone_number text null,
  address text null,
  is_verified boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default now()
);

alter table public.profiles enable row level security;

-- Policies for Profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 3. SERVICES TABLE
create table if not exists public.services (
  id uuid not null default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  description text null,
  price_text text not null,
  category text not null,
  image_url text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now())
);

alter table public.services enable row level security;

drop policy if exists "Services are publicly viewable." on public.services;
create policy "Services are publicly viewable." on public.services for select using (true);

drop policy if exists "Only admins can manage services." on public.services;
create policy "Only admins can manage services." on public.services for all 
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- 4. PROVIDERS TABLE (Professional Listings)
create table if not exists public.providers (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid null references public.profiles (id) on delete set null, -- The Link to Profiles
  full_name text not null,
  email text null unique,
  phone text null,
  service_type text null,
  bio text null,
  hourly_rate integer null,
  avatar_url text null,
  doc_type text null,
  doc_number text null,
  address text null,
  is_approved boolean not null default false,
  available_days integer[] null default array[1, 2, 3, 4, 5, 6],
  available_time_slots text[] null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now())
);

-- Ensure user_id exists if table was created without it
alter table public.providers add column if not exists user_id uuid references public.profiles(id) on delete set null;

alter table public.providers enable row level security;

-- Policies for Providers
drop policy if exists "Approved providers are publicly viewable." on public.providers;
create policy "Approved providers are publicly viewable." on public.providers for select 
using (is_approved = true or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

drop policy if exists "Providers can manage their own data." on public.providers;
create policy "Providers can manage their own data." on public.providers for update 
using (email = auth.jwt() ->> 'email' or user_id = auth.uid());

drop policy if exists "Admins can manage all providers." on public.providers;
create policy "Admins can manage all providers." on public.providers for all 
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));


-- 5. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid null references public.providers (id) on delete set null,
  service_id uuid null references public.services (id) on delete set null,
  booking_date date not null,
  time_slot text not null,
  status public.booking_status null default 'pending'::booking_status,
  address text not null,
  notes text null,
  otp text null,
  otp_verified boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now())
);

-- Explicitly fix/add foreign key constraints to avoid mismatch errors
alter table public.bookings add column if not exists provider_id uuid;
alter table public.bookings drop constraint if exists bookings_provider_id_fkey;
alter table public.bookings add constraint bookings_provider_id_fkey 
  foreign key (provider_id) references public.providers (id) on delete set null;

alter table public.bookings enable row level security;

-- Policies for Bookings
drop policy if exists "Users can view their own bookings." on public.bookings;
create policy "Users can view their own bookings." on public.bookings for select using (auth.uid() = user_id);

drop policy if exists "Users can create bookings." on public.bookings;
create policy "Users can create bookings." on public.bookings for insert with check (
    auth.uid() = user_id 
    and (select role from public.profiles where id = auth.uid()) != 'provider'
);

drop policy if exists "Providers can view their assigned bookings." on public.bookings;
create policy "Providers can view their assigned bookings." on public.bookings for select 
using (provider_id in (select id from public.providers where email = auth.jwt() ->> 'email' or user_id = auth.uid()));

drop policy if exists "Providers can update their assigned bookings." on public.bookings;
create policy "Providers can update their assigned bookings." on public.bookings for update 
using (provider_id in (select id from public.providers where email = auth.jwt() ->> 'email' or user_id = auth.uid()));

drop policy if exists "Admins can view all bookings." on public.bookings;
create policy "Admins can view all bookings." on public.bookings for select 
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));


-- 6. BIDIRECTIONAL ARCHITECTURE SYNC (Triggers)

-- A. Auto-assign role + link to listing on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  provider_record_id uuid;
begin
  -- 1. Check if user's email exists in providers table
  select id into provider_record_id from public.providers where email = new.email;

  -- 2. Insert profile
  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    case when provider_record_id is not null then 'provider'::user_role else 'user'::user_role end,
    new.raw_user_meta_data->>'avatar_url'
  );

  -- 3. If they are a provider, link the provider listing back to this profile
  if provider_record_id is not null then
    update public.providers set user_id = new.id where id = provider_record_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- B. Sync role + link profile whenever a Provider listing is created/updated
create or replace function public.sync_provider_to_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  profile_record_id uuid;
begin
  -- 1. Find profile by email (if they already registered)
  select id into profile_record_id from public.profiles where email = new.email;

  if profile_record_id is not null then
    -- 2. Link the provider listing to the profile
    new.user_id := profile_record_id;
    
    -- 3. Update the profile role to provider
    update public.profiles set role = 'provider' where id = profile_record_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_provider_upsert on public.providers;
create trigger on_provider_upsert
  before insert or update of email on public.providers
  for each row execute procedure public.sync_provider_to_profile();


-- C. Reverse Sync: Profiles -> Providers
-- When an admin manually sets a role to 'provider', ensure a listing exists
create or replace function public.sync_profile_to_provider()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role = 'provider' and (old.role is null or old.role != 'provider') then
    insert into public.providers (user_id, email, full_name, avatar_url)
    values (new.id, new.email, new.full_name, new.avatar_url)
    on conflict (email) do update 
    set user_id = new.id,
        full_name = coalesce(public.providers.full_name, new.full_name),
        avatar_url = coalesce(public.providers.avatar_url, new.avatar_url);
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_role_update on public.profiles;
create trigger on_profile_role_update
  after update of role on public.profiles
  for each row execute procedure public.sync_profile_to_provider();


-- 7. STORAGE BUCKET POLICIES
drop policy if exists "Providers images are publicly readable" on storage.objects;
create policy "Providers images are publicly readable" on storage.objects for select using (bucket_id = 'providers');

drop policy if exists "Authenticated users can upload provider images" on storage.objects;
create policy "Authenticated users can upload provider images" on storage.objects for insert 
with check (bucket_id = 'providers' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage provider images" on storage.objects;
create policy "Authenticated users can manage provider images" on storage.objects for all 
using (bucket_id = 'providers' and auth.role() = 'authenticated');
