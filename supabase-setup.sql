-- ════════════════════════════════════════════════════════════
--  Vallsgenera Tour · Configuració del núvol propi (Supabase)
--  Enganxa-ho tot a: Supabase → SQL Editor → New query → Run
--  És re-executable (es pot tornar a llançar sense problema).
-- ════════════════════════════════════════════════════════════

-- 1) Contenidor públic per a fotos i vídeos
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- 2) Polítiques d'Storage: lectura pública + pujar/actualitzar/esborrar oberts
drop policy if exists "media_read"   on storage.objects;
drop policy if exists "media_insert" on storage.objects;
drop policy if exists "media_update" on storage.objects;
drop policy if exists "media_delete" on storage.objects;

create policy "media_read"   on storage.objects for select using (bucket_id = 'media');
create policy "media_insert" on storage.objects for insert with check (bucket_id = 'media');
create policy "media_update" on storage.objects for update using (bucket_id = 'media');
create policy "media_delete" on storage.objects for delete using (bucket_id = 'media');

-- 3) Taula amb les dades del tour (una sola fila: 'main')
create table if not exists public.tour_data (
  id         text primary key,
  scenes     jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

insert into public.tour_data (id, scenes)
values ('main', '[]'::jsonb)
on conflict (id) do nothing;

alter table public.tour_data enable row level security;

drop policy if exists "tour_read"   on public.tour_data;
drop policy if exists "tour_insert" on public.tour_data;
drop policy if exists "tour_update" on public.tour_data;

create policy "tour_read"   on public.tour_data for select using (true);
create policy "tour_insert" on public.tour_data for insert with check (true);
create policy "tour_update" on public.tour_data for update using (true) with check (true);
