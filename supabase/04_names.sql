-- IJP Au-pair – Erweiterung: Vor- und Nachname bei der Registrierung
-- Nach 03_matching_details.sql einmal komplett im Supabase SQL Editor ausführen.

alter table public.profiles
  add column first_name text not null default '' check (char_length(first_name) <= 100),
  add column last_name text not null default '' check (char_length(last_name) <= 100);

-- Bestehende Konten: bisherigen Namen als Vornamen übernehmen
update public.profiles set first_name = name where first_name = '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, name, first_name, last_name)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'aupair' then 'aupair' else 'family' end,
    coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;
