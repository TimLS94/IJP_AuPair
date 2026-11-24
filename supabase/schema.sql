-- IJP Au-pair – Datenbank-Schema für Supabase
-- Einmal komplett im Supabase SQL Editor ausführen.

-- ─── Benutzerprofile (1:1 zu auth.users) ─────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('aupair', 'family', 'admin')),
  name text not null default '',
  created_at timestamptz not null default now()
);

-- Legt bei jeder Registrierung automatisch ein Profil an.
-- Rolle kommt aus den Metadaten; 'admin' kann man sich NICHT selbst geben.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'aupair' then 'aupair' else 'family' end,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ─── Au-pair-Profile ─────────────────────────────────────────────────
create table public.aupairs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles on delete cascade,
  name text not null,
  age int not null check (age between 18 and 30),
  country text not null,
  flag text not null default '🌍',
  languages text[] not null default '{}',
  german text not null check (german in ('A1', 'A2', 'B1', 'B2', 'C1')),
  experience text[] not null default '{}',
  license boolean not null default false,
  available_from text not null,           -- Format JJJJ-MM
  duration int not null,
  about text not null,
  photo_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nur Admins dürfen den Status ändern. Ändert ein Au-pair sein Profil,
-- muss IJP es erneut prüfen.
create function public.aupairs_guard()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if not public.is_admin() then
    new.status := 'pending';
  end if;
  return new;
end;
$$;

create trigger aupairs_guard
  before insert or update on public.aupairs
  for each row execute function public.aupairs_guard();

-- ─── Merkliste der Familien ──────────────────────────────────────────
create table public.favorites (
  family_id uuid not null references public.profiles on delete cascade,
  aupair_id uuid not null references public.aupairs on delete cascade,
  created_at timestamptz not null default now(),
  primary key (family_id, aupair_id)
);

-- ─── Kontaktanfragen ─────────────────────────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  name text not null check (char_length(name) <= 200),
  email text not null check (char_length(email) <= 200),
  phone text not null default '' check (char_length(phone) <= 50),
  message text not null check (char_length(message) <= 5000),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Zugriffsregeln (Row Level Security) ─────────────────────────────
alter table public.profiles enable row level security;
alter table public.aupairs enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;

create policy "Eigenes Profil lesen" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "Freigegebene Profile sind öffentlich" on public.aupairs
  for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "Au-pair legt eigenes Profil an" on public.aupairs
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'aupair')
  );
create policy "Au-pair bearbeitet eigenes Profil" on public.aupairs
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "Au-pair löscht eigenes Profil" on public.aupairs
  for delete using (user_id = auth.uid() or public.is_admin());

create policy "Familie verwaltet eigene Merkliste" on public.favorites
  for all using (family_id = auth.uid()) with check (family_id = auth.uid());

create policy "Jeder darf Nachrichten senden" on public.messages
  for insert with check (handled = false);
create policy "Admins lesen Nachrichten" on public.messages
  for select using (public.is_admin());
create policy "Admins bearbeiten Nachrichten" on public.messages
  for update using (public.is_admin());

-- ─── Fotos (Storage) ─────────────────────────────────────────────────
-- Öffentlicher Bucket; jeder Nutzer darf nur in seinen eigenen Ordner <user-id>/ schreiben.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Eigenes Foto lesen" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Eigenes Foto hochladen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Eigenes Foto ersetzen" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Eigenes Foto löschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─── Admin festlegen ─────────────────────────────────────────────────
-- Nach der eigenen Registrierung über die Website einmal ausführen:
-- update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'service@internationaljobplacement.com');
