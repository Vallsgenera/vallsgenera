-- ════════════════════════════════════════════════════════════
--  Vallsgenera Tour · Bloqueig d'escriptura (només usuaris amb sessió)
--  Executa'l DESPRÉS de crear el teu usuari i comprovar que pots
--  iniciar sessió al Studio.
--  El tour segueix sent PÚBLIC de lectura; només publicar/pujar
--  requereix haver iniciat sessió.
-- ════════════════════════════════════════════════════════════

-- tour_data: lectura pública, escriptura només autenticada
drop policy if exists "tour_read"   on public.tour_data;
drop policy if exists "tour_insert" on public.tour_data;
drop policy if exists "tour_update" on public.tour_data;
create policy "tour_read"   on public.tour_data for select using (true);
create policy "tour_insert" on public.tour_data for insert to authenticated with check (true);
create policy "tour_update" on public.tour_data for update to authenticated using (true) with check (true);

-- storage (fotos i vídeos): lectura pública, escriptura només autenticada
drop policy if exists "media_read"   on storage.objects;
drop policy if exists "media_insert" on storage.objects;
drop policy if exists "media_update" on storage.objects;
drop policy if exists "media_delete" on storage.objects;
create policy "media_read"   on storage.objects for select using (bucket_id = 'media');
create policy "media_insert" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "media_update" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "media_delete" on storage.objects for delete to authenticated using (bucket_id = 'media');
