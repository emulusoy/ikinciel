import { createClient } from '@supabase/supabase-js';

// Supabase URL temizleyici: /rest/v1/ gibi fazlalıkları ve sondaki slaşları otomatik siler
export function cleanSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getSupabaseConfig() {
  const envUrl = cleanSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const localUrl = cleanSupabaseUrl(localStorage.getItem('supabase_url'));
  const localKey = (localStorage.getItem('supabase_anon_key') || '').trim();

  const url = envUrl || localUrl || '';
  const key = envKey || localKey || '';

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
