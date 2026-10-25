import { createClient } from '@supabase/supabase-js';

// Supabase URL temizleyici: /rest/v1/ gibi fazlalıkları ve sondaki slaşları otomatik siler
export function cleanSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

// Projenin resmi canlı Supabase Bulut Veritabanı bilgileri (Canlıda ve yerelde %100 aynı DB'ye bağlanır)
const DEFAULT_SUPABASE_URL = 'https://stbgegzzazlxgoediaku.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmdlZ3p6YXpseGdvZWRpYWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NjM1NzgsImV4cCI6MjEwODQzOTU3OH0.n7o_EyKCwKAYoTVGoe8I351_znxP8DfY68IkrkBuwf4';

export function getSupabaseConfig() {
  const envUrl = cleanSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const localUrl = cleanSupabaseUrl(localStorage.getItem('supabase_url'));
  const localKey = (localStorage.getItem('supabase_anon_key') || '').trim();

  // Öncelik sırası: Yerel ayar > .env değişkeni > Varsayılan canlı Supabase bağlantısı
  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const key = localKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith('http')),
  };
}

let supabaseInstance = null;

export function getSupabase() {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (!supabaseInstance || supabaseInstance.supabaseUrl !== config.url) {
    try {
      supabaseInstance = createClient(config.url, config.key);
    } catch (e) {
      console.error('Supabase client error:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function saveSupabaseConfig(rawUrl, key) {
  const cleanedUrl = cleanSupabaseUrl(rawUrl);
  if (cleanedUrl) localStorage.setItem('supabase_url', cleanedUrl);
  if (key) localStorage.setItem('supabase_anon_key', key.trim());
  supabaseInstance = null;
}
