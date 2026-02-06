-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create specific types
create type user_role as enum ('admin', 'provider', 'user');
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text,
  email text not null,
  role user_role default 'user'::user_role,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- SERVICES TABLE
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  description text,
  price_text text not null, -- Display text like "Starts at ₹299"
  category text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.services enable row level security;

-- Services Policies
create policy "Services are viewable by everyone."
  on public.services for select
  using ( true );

create policy "Only admins can insert/update services."
  on public.services for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- BOOKINGS TABLE
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  booking_date date not null,
  time_slot text not null,
  status booking_status default 'pending'::booking_status,
  address text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.bookings enable row level security;

-- Bookings Policies
create policy "Users can view their own bookings."
  on public.bookings for select
  using ( auth.uid() = user_id );

create policy "Users can create their own bookings."
  on public.bookings for insert
  with check ( auth.uid() = user_id );

create policy "Admins and Providers can view all bookings."
  on public.bookings for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and (profiles.role = 'admin' or profiles.role = 'provider')
    )
  );

-- Trigger to create profile on signup (optional but recommended)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce((new.raw_user_meta_data->>'role')::user_role, 'user'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- INSERT MOCK DATA
insert into public.services (title, slug, description, price_text, category, image_url) values
('Professional Cleaning', 'cleaning', 'Deep cleaning services for your home.', 'Starts at ₹499', 'Home Maintenance', '/images/cleaning.jpg'),
('Plumbing Services', 'plumbing', 'Expert plumbers for leaks and repairs.', '₹200 visit charge', 'Repairs', '/images/plumbing.jpg'),
('Electrician', 'electrician', 'Safe and reliable electrical repairs.', '₹200 visit charge', 'Repairs', '/images/electrician.jpg'),
('Car Wash', 'car-wash', 'Doorstep car washing and detailing.', 'Starts at ₹399', 'Automotive', '/images/car-wash.jpg');
