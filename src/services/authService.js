import { getSupabase } from '../supabaseClient';
import { siteConfig } from '../siteConfig';

const LOCAL_STORAGE_PWD_KEY = 'ikinciel_admin_pwd';
const SESSION_AUTH_KEY = 'ikinciel_admin_session';

// Supabase'den veya yerel hafızadan güncel yönetici şifresini al
export async function getAdminPassword() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_password')
        .maybeSingle();

      if (!error && data && data.value) {
        // DB'deki şifreyi yerel önbelleğe de senkronize et
        localStorage.setItem(LOCAL_STORAGE_PWD_KEY, data.value);
        return data.value;
      }
    } catch (err) {
      console.warn('DB password fetch notice:', err.message);
    }
  }

  // Fallback: Yerel kayıt veya siteConfig varsayılanı
  return localStorage.getItem(LOCAL_STORAGE_PWD_KEY) || siteConfig.adminPassword || 'emu1';
}

// Şifre doğrulama (Giriş için)
export async function verifyPassword(inputPassword) {
  if (!inputPassword) return false;
  const currentPassword = await getAdminPassword();
  
  // Sadece güncel şifre geçerlidir (Yeni şifre belirlendikten sonra varsayılan emu1 KESİNLİKLE kabul edilmez)
  return inputPassword === currentPassword;
}

// Yönetici şifresini DB'ye ve yerel hafızaya kaydet
export async function saveAdminPasswordToDB(newPassword) {
  if (!newPassword || newPassword.trim().length < 3) {
    throw new Error('Şifre en az 3 karakter olmalıdır.');
  }

  const cleanPwd = newPassword.trim();
  localStorage.setItem(LOCAL_STORAGE_PWD_KEY, cleanPwd);

  const supabase = getSupabase();
  let dbSaved = false;
  let dbError = null;

  if (supabase) {
    try {
      // Önce tablo var mı diye upsert dene
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key: 'admin_password', value: cleanPwd, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) {
        console.warn('Supabase password save warning (table may need creation):', error.message);
        dbError = error.message;
      } else {
        dbSaved = true;
      }
    } catch (e) {
      console.warn('Supabase DB save error:', e);
      dbError = e.message;
    }
  }

  return { success: true, dbSaved, dbError, password: cleanPwd };
}

// Oturum kontrolü
export function isSessionAuthed() {
  return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
}

export function setSessionAuthed(val) {
  if (val) {
    sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  }
}
