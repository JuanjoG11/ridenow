-- ============================================================
-- RideNow - Schema Supabase
-- Ejecuta esto en: Dashboard → SQL Editor → New query
-- ============================================================

-- Extensión para UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users con datos del perfil de la app
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  university  text,
  role        text check (role in ('student', 'driver')),
  neighborhood text,
  home_address text,
  schedule    text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- RLS: cada usuario solo ve/edita su propio perfil
alter table public.profiles enable row level security;

create policy "Perfil propio" on public.profiles
  for all using (auth.uid() = id);

-- ============================================================
-- TABLA: vehicles
-- Vehículo registrado por conductores
-- ============================================================
create table if not exists public.vehicles (
  id         uuid primary key default uuid_generate_v4(),
  driver_id  uuid references public.profiles(id) on delete cascade,
  brand      text,
  model      text,
  plate      text,
  color      text,
  seats      int default 4,
  created_at timestamptz default now()
);

alter table public.vehicles enable row level security;

create policy "Vehículo propio" on public.vehicles
  for all using (auth.uid() = driver_id);

create policy "Estudiantes ven vehículos" on public.vehicles
  for select using (true);

-- ============================================================
-- TABLA: trips
-- Viajes publicados por conductores
-- ============================================================
create table if not exists public.trips (
  id              uuid primary key default uuid_generate_v4(),
  driver_id       uuid references public.profiles(id) on delete cascade,
  origin          text not null,
  destination     text not null,
  departure_time  text not null,
  price           int not null,
  available_seats int default 3,
  notes           text,
  status          text default 'available' check (status in ('available', 'full', 'in_progress', 'completed', 'cancelled')),
  created_at      timestamptz default now()
);

alter table public.trips enable row level security;

create policy "Conductor gestiona sus viajes" on public.trips
  for all using (auth.uid() = driver_id);

create policy "Todos ven viajes disponibles" on public.trips
  for select using (status = 'available');

-- ============================================================
-- TABLA: trip_requests
-- Solicitudes de estudiantes a un viaje
-- ============================================================
create table if not exists public.trip_requests (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid references public.trips(id) on delete cascade,
  student_id  uuid references public.profiles(id) on delete cascade,
  status      text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  travel_type text default 'solo' check (travel_type in ('solo', 'shared')),
  payment     text default 'cash' check (payment in ('cash', 'nequi', 'bancolombia')),
  created_at  timestamptz default now(),
  unique(trip_id, student_id)
);

alter table public.trip_requests enable row level security;

create policy "Estudiante ve sus solicitudes" on public.trip_requests
  for all using (auth.uid() = student_id);

create policy "Conductor ve solicitudes de sus viajes" on public.trip_requests
  for select using (
    auth.uid() = (select driver_id from public.trips where id = trip_id)
  );

create policy "Conductor actualiza solicitudes de sus viajes" on public.trip_requests
  for update using (
    auth.uid() = (select driver_id from public.trips where id = trip_id)
  );

-- ============================================================
-- TABLA: reviews
-- Calificaciones post-viaje
-- ============================================================
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid references public.trips(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete cascade,
  reviewed_id uuid references public.profiles(id) on delete cascade,
  rating      int check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique(trip_id, reviewer_id)
);

alter table public.reviews enable row level security;

create policy "Cualquiera puede leer reseñas" on public.reviews
  for select using (true);

create policy "Solo el autor puede crear su reseña" on public.reviews
  for insert with check (auth.uid() = reviewer_id);

-- ============================================================
-- FUNCIÓN: crear perfil automáticamente al registrarse
-- Se dispara cuando se crea un usuario en auth.users
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

-- Trigger que llama a la función
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
