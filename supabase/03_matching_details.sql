-- IJP Au-pair – Erweiterung: Details für das Matching
-- Nach 02_families_matching.sql einmal komplett im Supabase SQL Editor ausführen.

-- ─── Familien: Anforderungen, Angebot, Haushalt ──────────────────────
alter table public.families
  add column hours_per_week int not null default 30 check (hours_per_week between 1 and 30),
  add column pocket_money int not null default 280 check (pocket_money between 0 and 2000),
  add column course_support boolean not null default true,
  add column own_bathroom boolean not null default false,
  add column car_private boolean not null default false,
  add column transit_ticket boolean not null default false,
  add column single_parent boolean not null default false,
  add column special_needs boolean not null default false,
  add column needs_swimming boolean not null default false,
  add column nonsmoker_required boolean not null default true,
  add column diet text not null default 'Alles' check (diet in ('Alles', 'Vegetarisch', 'Vegan'));

-- ─── Au-pairs: Gegenstücke für das Matching ─────────────────────────
alter table public.aupairs
  add column swims boolean not null default false,
  add column smoker boolean not null default false,
  add column pets_ok boolean not null default true,
  add column special_needs_experience boolean not null default false,
  add column max_children int not null default 3 check (max_children between 1 and 6),
  add column areas text[] not null default '{}',
  add column diet text not null default 'Alles' check (diet in ('Alles', 'Vegetarisch', 'Vegan'));
