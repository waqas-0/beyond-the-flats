-- ============================================================
-- Beyond The Flats — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
--
-- SAFE TO RE-RUN. Idempotent throughout:
--   • tables use `create table if not exists`
--   • every column has an `add column if not exists` guard, so an existing
--     table just gains any missing column (no data loss, no drop/recreate)
--   • policies & triggers drop-then-create; buckets use on-conflict-do-nothing
-- Running this on a fresh OR already-populated database will not error.
-- ============================================================

-- ── guides ───────────────────────────────────────────────────
create table if not exists public.guides (
  id                   uuid        primary key references auth.users(id) on delete cascade,
  phone                text        not null,
  full_name            text,
  bio                  text,
  avatar_url           text,
  boat_type            text,
  islands              text[]      not null default '{}',
  specialties          text[]      not null default '{}',
  years_experience     int,
  license_url          text,
  qr_url               text,
  verification_status  text        not null default 'pending'
                         check (verification_status in ('pending', 'approved', 'rejected')),
  rejection_reason     text,
  conservation_pledge  boolean     not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- bring an older guides table up to date (each is a no-op if it exists)
alter table public.guides add column if not exists phone               text;
alter table public.guides add column if not exists full_name           text;
alter table public.guides add column if not exists bio                 text;
alter table public.guides add column if not exists avatar_url          text;
alter table public.guides add column if not exists boat_type           text;
alter table public.guides add column if not exists islands             text[] not null default '{}';
alter table public.guides add column if not exists specialties         text[] not null default '{}';
alter table public.guides add column if not exists years_experience    int;
alter table public.guides add column if not exists license_url         text;
alter table public.guides add column if not exists qr_url              text;
alter table public.guides add column if not exists verification_status text not null default 'pending';
alter table public.guides add column if not exists rejection_reason    text;
alter table public.guides add column if not exists conservation_pledge boolean not null default false;
alter table public.guides add column if not exists created_at          timestamptz not null default now();
alter table public.guides add column if not exists updated_at          timestamptz not null default now();

-- ── trips ─────────────────────────────────────────────────────
create table if not exists public.trips (
  id             uuid        primary key default gen_random_uuid(),
  guide_id       uuid        not null references public.guides(id) on delete cascade,
  title          text,
  client_name    text,
  anglers        int         not null default 1,
  permit_ref     text,
  start_time     timestamptz not null default now(),
  end_time       timestamptz,
  location_note  text,
  notes          text,
  gps_lat        numeric,
  gps_lng        numeric,
  photo_url      text,
  created_at     timestamptz not null default now()
);

alter table public.trips add column if not exists client_name   text;
alter table public.trips add column if not exists start_time    timestamptz not null default now();
alter table public.trips add column if not exists end_time      timestamptz;
alter table public.trips add column if not exists location_note text;
alter table public.trips add column if not exists gps_lat       numeric;
alter table public.trips add column if not exists gps_lng       numeric;
alter table public.trips add column if not exists photo_url     text;
alter table public.trips add column if not exists created_at    timestamptz not null default now();

-- ── catches ───────────────────────────────────────────────────
-- Multiple catch entries per trip (species counter)
create table if not exists public.catches (
  id         uuid        primary key default gen_random_uuid(),
  trip_id    uuid        not null references public.trips(id) on delete cascade,
  species    text        not null check (species in ('bonefish', 'tarpon', 'permit', 'other')),
  count      int         not null default 1 check (count > 0),
  photo_url  text,
  logged_at  timestamptz not null default now()
);

alter table public.catches add column if not exists count     int not null default 1;
alter table public.catches add column if not exists photo_url text;
alter table public.catches add column if not exists logged_at timestamptz not null default now();

-- ── reviews ───────────────────────────────────────────────────
create table if not exists public.reviews (
  id           uuid        primary key default gen_random_uuid(),
  guide_id     uuid        not null references public.guides(id) on delete cascade,
  visitor_name text        not null,
  stars        int         not null check (stars between 1 and 5),
  body         text,
  approved     boolean     not null default false,
  created_at   timestamptz not null default now()
);

alter table public.reviews add column if not exists body       text;
alter table public.reviews add column if not exists approved   boolean not null default false;
alter table public.reviews add column if not exists created_at timestamptz not null default now();

-- ── qr_scans ──────────────────────────────────────────────────
-- Analytics: logged every time a guide's QR code is scanned
create table if not exists public.qr_scans (
  id           uuid        primary key default gen_random_uuid(),
  guide_id     uuid        not null references public.guides(id) on delete cascade,
  scanned_at   timestamptz not null default now(),
  user_agent   text,
  country_code text
);

alter table public.qr_scans add column if not exists scanned_at   timestamptz not null default now();
alter table public.qr_scans add column if not exists user_agent   text;
alter table public.qr_scans add column if not exists country_code text;

-- ── admin_users ───────────────────────────────────────────────
-- BTF team only — separate from guide auth
create table if not exists public.admin_users (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  role       text        not null default 'admin' check (role in ('admin', 'superadmin')),
  created_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists role       text not null default 'admin';
alter table public.admin_users add column if not exists created_at timestamptz not null default now();

-- ── updated_at trigger ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guides_updated_at on public.guides;
create trigger guides_updated_at
  before update on public.guides
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────
-- (enabling RLS that is already enabled is a no-op, safe to re-run)
alter table public.guides      enable row level security;
alter table public.trips       enable row level security;
alter table public.catches     enable row level security;
alter table public.reviews     enable row level security;
alter table public.qr_scans    enable row level security;
alter table public.admin_users enable row level security;

-- guides: own profile full access
drop policy if exists "guides_own_profile" on public.guides;
create policy "guides_own_profile" on public.guides
  for all using (auth.uid() = id);

-- guides: approved profiles publicly readable
drop policy if exists "public_approved_guides" on public.guides;
create policy "public_approved_guides" on public.guides
  for select using (verification_status = 'approved');

-- trips: guide manages their own trips
drop policy if exists "guides_own_trips" on public.trips;
create policy "guides_own_trips" on public.trips
  for all using (guide_id = auth.uid());

-- trips: publicly readable for approved guides
drop policy if exists "public_approved_trips" on public.trips;
create policy "public_approved_trips" on public.trips
  for select using (
    exists (
      select 1 from public.guides
      where id = guide_id and verification_status = 'approved'
    )
  );

-- catches: guide manages catches on their own trips
drop policy if exists "guides_own_catches" on public.catches;
create policy "guides_own_catches" on public.catches
  for all using (
    exists (
      select 1 from public.trips
      where id = trip_id and guide_id = auth.uid()
    )
  );

-- catches: publicly readable for approved guides
drop policy if exists "public_approved_catches" on public.catches;
create policy "public_approved_catches" on public.catches
  for select using (
    exists (
      select 1 from public.trips t
      join public.guides g on g.id = t.guide_id
      where t.id = trip_id and g.verification_status = 'approved'
    )
  );

-- reviews: publicly readable (approved only)
drop policy if exists "public_approved_reviews" on public.reviews;
create policy "public_approved_reviews" on public.reviews
  for select using (approved = true);

-- qr_scans: insert open (scanned by anyone), readable by guide only
drop policy if exists "qr_scan_insert" on public.qr_scans;
create policy "qr_scan_insert" on public.qr_scans
  for insert with check (true);

drop policy if exists "guides_own_qr_scans" on public.qr_scans;
create policy "guides_own_qr_scans" on public.qr_scans
  for select using (guide_id = auth.uid());

-- admin_users: service role only (no direct client access)

-- ── Storage buckets ───────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('guide-avatars', 'guide-avatars', true)
  on conflict do nothing;

insert into storage.buckets (id, name, public)
  values ('guide-licenses', 'guide-licenses', false)
  on conflict do nothing;

insert into storage.buckets (id, name, public)
  values ('guide-qrcodes', 'guide-qrcodes', true)
  on conflict do nothing;

insert into storage.buckets (id, name, public)
  values ('catch-photos', 'catch-photos', false)
  on conflict do nothing;

-- Storage RLS (drop first so re-runs don't fail)
drop policy if exists "avatar_upload"       on storage.objects;
drop policy if exists "avatar_public_read"  on storage.objects;
drop policy if exists "license_upload"      on storage.objects;
drop policy if exists "qrcode_public_read"  on storage.objects;
drop policy if exists "catch_photo_upload"  on storage.objects;

create policy "avatar_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'guide-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'guide-avatars');

create policy "license_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'guide-licenses' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "qrcode_public_read" on storage.objects
  for select using (bucket_id = 'guide-qrcodes');

create policy "catch_photo_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catch-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ── Role grants ───────────────────────────────────────────────
-- Supabase does not auto-grant DML on custom tables; explicit grants required.
-- (re-granting an existing grant is a no-op, safe to re-run)
grant usage on schema public to anon, authenticated;

grant select, insert, update on public.guides     to authenticated;
grant select, insert, update on public.trips      to authenticated;
grant select, insert, update on public.catches    to authenticated;
grant select, insert        on public.reviews     to authenticated;
grant select, insert        on public.qr_scans    to authenticated;

grant select on public.guides   to anon;
grant select on public.trips    to anon;
grant select on public.catches  to anon;
grant select on public.reviews  to anon;
grant insert on public.qr_scans to anon;

-- Service role bypasses RLS for trusted server-side work (admin panel reads,
-- approve/reject, storage uploads). It needs table privileges EXPLICITLY in
-- this project — without these, every createServiceClient() query gets
-- "permission denied" and the admin login returns 403.
grant usage on schema public to service_role;
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;



-- drop table if exists public.catches   cascade;
-- drop table if exists public.qr_scans  cascade;
-- drop table if exists public.admin_users cascade;
-- drop table if exists public.reviews   cascade;
-- drop table if exists public.trips     cascade;
-- drop table if exists public.guides    cascade;
-- drop function if exists public.set_updated_at cascade;
