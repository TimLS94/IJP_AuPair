-- IJP Au-pair – Erweiterung: Familienprofile und Matching
-- Nach schema.sql einmal komplett im Supabase SQL Editor ausführen.

-- ─── Familienprofile ─────────────────────────────────────────────────
create table public.families (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles on delete cascade,
  name text not null check (char_length(name) <= 100),
  city text not null check (char_length(city) <= 100),
  state text not null,
  area text not null check (area in ('Großstadt', 'Kleinstadt', 'Ländlich')),
  children int not null check (children between 1 and 10),
  child_ages text[] not null default '{}',
  languages text[] not null default '{}',
  tasks text[] not null default '{}',
  min_german text not null default 'A1' check (min_german in ('A1', 'A2', 'B1', 'B2', 'C1')),
  needs_license boolean not null default false,
  pets boolean not null default false,
  start_from text not null,               -- Format JJJJ-MM
  duration int not null,
  about text not null check (char_length(about) <= 3000),
  photo_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Gleiche Regel wie bei Au-pairs: nur Admins ändern den Status,
-- jede Änderung durch die Familie muss neu geprüft werden.
create trigger families_guard
  before insert or update on public.families
  for each row execute function public.aupairs_guard();

-- ─── Merkliste der Au-pairs ──────────────────────────────────────────
create table public.family_likes (
  aupair_user_id uuid not null references public.profiles on delete cascade,
  family_id uuid not null references public.families on delete cascade,
  created_at timestamptz not null default now(),
  primary key (aupair_user_id, family_id)
);

-- ─── Matches ─────────────────────────────────────────────────────────
-- Ein Match besteht, wenn die Familie das Au-pair gemerkt hat UND das Au-pair die Familie.
-- Liefert nur die eigenen Matches; Admins sehen alle.
create function public.my_matches()
returns table (aupair_id uuid, family_id uuid, matched_at timestamptz)
language sql
stable
security definer set search_path = ''
as $$
  select a.id, fam.id, greatest(f.created_at, l.created_at)
  from public.favorites f
  join public.aupairs a on a.id = f.aupair_id
  join public.families fam on fam.user_id = f.family_id
  join public.family_likes l on l.family_id = fam.id and l.aupair_user_id = a.user_id
  where a.user_id = auth.uid() or fam.user_id = auth.uid() or public.is_admin()
  order by 3 desc;
$$;

-- ─── Tabellenrechte ──────────────────────────────────────────────────
grant select, insert, update, delete on public.families to authenticated;
grant select, insert, delete on public.family_likes to authenticated;
revoke execute on function public.my_matches() from public, anon;
grant execute on function public.my_matches() to authenticated;

-- ─── Zugriffsregeln (Row Level Security) ─────────────────────────────
alter table public.families enable row level security;
alter table public.family_likes enable row level security;

-- Familienprofile sind NICHT öffentlich: nur angemeldete Au-pairs sehen freigegebene Profile.
create policy "Au-pairs sehen freigegebene Familien" on public.families
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or (
      status = 'approved'
      and exists (select 1 from public.profiles where id = auth.uid() and role = 'aupair')
    )
  );
create policy "Familie legt eigenes Profil an" on public.families
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'family')
  );
create policy "Familie bearbeitet eigenes Profil" on public.families
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "Familie löscht eigenes Profil" on public.families
  for delete using (user_id = auth.uid() or public.is_admin());

create policy "Au-pair verwaltet eigene Merkliste" on public.family_likes
  for all using (aupair_user_id = auth.uid()) with check (aupair_user_id = auth.uid());
