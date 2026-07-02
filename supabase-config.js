'use strict';
/* ════════════════════════════════════════════════════════════
   Vallsgenera Tour · Núvol propi (Supabase)
   Emmagatzematge de fotos, vídeos i dades de les escenes.
   La clau `anon` és pública per disseny (protegida per RLS).
   ════════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://zyqtbvycpvtpvpznqtge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cXRidnljcHZ0cHZwem5xdGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5ODU1MzYsImV4cCI6MjA5ODU2MTUzNn0.9RjBQryMDcnlNut38ws9vTwUfP9KYFs1FkYKRevMhKo';

const SB_BUCKET  = 'media';   // contenidor de fitxers (fotos + vídeos)
const SB_TOUR_ID = 'main';    // clau de la fila de dades del tour

let _sbClient = null;
function sbClient() {
  if (_sbClient) return _sbClient;
  if (typeof supabase === 'undefined' || !supabase.createClient) return null;
  try { _sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
  catch (e) { console.warn('[supabase] init error:', e); return null; }
  return _sbClient;
}

/* Està el núvol disponible (llibreria carregada + client creat)? */
function sbIsConfigured() { return !!sbClient(); }

/* Puja un File/Blob a l'Storage i retorna la URL pública (amb cache-bust).
   `path` p.ex. 'photos/escena-1.jpg' o 'videos/hs-3.mp4' */
async function sbUpload(path, file) {
  const c = sbClient();
  if (!c) throw new Error('Núvol no disponible');
  const { error } = await c.storage.from(SB_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
    cacheControl: '3600'
  });
  if (error) throw error;
  const { data } = c.storage.from(SB_BUCKET).getPublicUrl(path);
  const base = data.publicUrl;
  return base + (base.includes('?') ? '&' : '?') + 'v=' + Date.now();
}

/* Llegeix l'array d'escenes publicat al núvol (o null si no n'hi ha) */
async function sbLoadScenes() {
  const c = sbClient();
  if (!c) return null;
  try {
    const { data, error } = await c
      .from('tour_data').select('scenes').eq('id', SB_TOUR_ID).maybeSingle();
    if (error) { console.warn('[supabase] loadScenes:', error.message); return null; }
    return (data && Array.isArray(data.scenes) && data.scenes.length) ? data.scenes : null;
  } catch (e) { console.warn('[supabase] loadScenes:', e); return null; }
}

/* Publica (desa) l'array d'escenes al núvol perquè ho vegi tothom */
async function sbPublishScenes(scenes) {
  const c = sbClient();
  if (!c) throw new Error('Núvol no disponible');
  const { error } = await c.from('tour_data').upsert({
    id: SB_TOUR_ID,
    scenes,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

/* És una URL http(s) (ja al núvol o externa) i no un data URI / ruta local? */
function sbIsRemoteUrl(u) { return typeof u === 'string' && /^https?:\/\//.test(u); }
