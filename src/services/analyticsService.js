import { getSupabase } from '../supabaseClient';

const STORAGE_KEY_EVENTS = 'ikinciel_analytics_events_v1';
const STORAGE_KEY_VISITORS = 'ikinciel_unique_visitors_v1';
const STORAGE_KEY_PRODUCT_VIEWS = 'ikinciel_product_views_v1';

// Cihaz türünü belirleme
export function getDeviceType() {
  const ua = navigator.userAgent || '';
  if (/iPad|tablet/i.test(ua) || (window.innerWidth >= 768 && window.innerWidth <= 1024)) {
    return 'Tablet 📱';
  }
  if (/Android|iPhone|iPod|Mobile/i.test(ua) || window.innerWidth < 768) {
    return 'Mobil 📱';
  }
  return 'Masaüstü 💻';
}

// Ziyaretçinin nereden geldiğini belirleme (Referrer / Kaynak)
export function getTrafficSource() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || urlParams.get('ref') || urlParams.get('source');
    if (utmSource) {
      if (utmSource.toLowerCase().includes('google')) return 'Google Reklam / Arama';
      if (utmSource.toLowerCase().includes('facebook') || utmSource.toLowerCase().includes('fb')) return 'Facebook Paylaşımı';
      if (utmSource.toLowerCase().includes('instagram') || utmSource.toLowerCase().includes('ig')) return 'Instagram';
      if (utmSource.toLowerCase().includes('whatsapp') || utmSource.toLowerCase().includes('wa')) return 'WhatsApp Mesajı';
      return `Kampanya: ${utmSource}`;
    }

    const ref = document.referrer || '';
    if (!ref) return 'Doğrudan (Direkt Giriş)';
    if (ref.includes('google.')) return 'Google Arama';
    if (ref.includes('facebook.') || ref.includes('fb.me')) return 'Facebook';
    if (ref.includes('instagram.')) return 'Instagram';
    if (ref.includes('wa.me') || ref.includes('whatsapp.')) return 'WhatsApp';
    if (ref.includes('t.co') || ref.includes('twitter') || ref.includes('x.com')) return 'X (Twitter)';
    if (ref.includes('sahibinden.')) return 'Sahibinden';
    if (ref.includes('letgo.')) return 'Letgo';
    if (ref.includes('youtube.')) return 'YouTube';
    if (ref.includes(window.location.hostname)) return 'Site İçi Dolaşım';

    try {
      const parsed = new URL(ref);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'Dış Bağlantı';
    }
  } catch {
    return 'Doğrudan (Direkt Giriş)';
  }
}

// Tekil ziyaretçi ID al veya oluştur
function getOrCreateVisitorId() {
  try {
    let vid = localStorage.getItem('ikinciel_vid');
    if (!vid) {
      vid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      localStorage.setItem('ikinciel_vid', vid);
    }
    return vid;
  } catch {
    return 'v_anon';
  }
}

// Yerel depodan event listesini çekme
export function getLocalEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Kesinlikle sahte veya eski demo verilerini ayıkla
        const realEvents = parsed.filter(e => 
          e && 
          !e.id?.startsWith('ev_init') && 
          !e.visitorId?.startsWith('v_kayseri')
        );
        if (realEvents.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(realEvents));
        }
        return realEvents;
      }
    }
  } catch (e) {
    console.warn('Analytics local read error:', e);
  }
  return [];
}

// Yerel depoya event kaydetme
function saveLocalEvent(event) {
  try {
    const list = getLocalEvents();
    // En fazla 500 adet son hareketi tut
    const updated = [event, ...list].slice(0, 500);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Analytics local save error:', e);
  }
}

// Supabase'e asenkron log gönderme (opsiyonel, hata fırlatmaz)
async function sendToSupabaseIfPossible(event) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('site_analytics').insert([{
      visitor_id: event.visitorId,
      event_type: event.type,
      source: event.source,
      device: event.device,
      path: event.path || '',
      product_id: event.productId ? String(event.productId) : null,
      product_title: event.productTitle || null,
      action: event.action || null,
      details: event.details || null,
      created_at: event.timestamp
    }]);
  } catch {
    // Tablo henüz açılmamışsa sessizce yerel modda devam et
  }
}

// 1. Sayfa Ziyareti Kaydet
export function trackPageView(path = window.location.pathname) {
  try {
    const visitorId = getOrCreateVisitorId();
    const source = getTrafficSource();
    const device = getDeviceType();
    const today = new Date().toDateString();

    // Günlük tekil kontrolü
    const lastVisitDate = localStorage.getItem('ikinciel_last_visit_date');
    let isDailyUnique = false;
    if (lastVisitDate !== today) {
      isDailyUnique = true;
      localStorage.setItem('ikinciel_last_visit_date', today);

      // Toplam tekil sayacı artır
      let totalVisitors = parseInt(localStorage.getItem(STORAGE_KEY_VISITORS) || '0', 10);
      totalVisitors++;
      localStorage.setItem(STORAGE_KEY_VISITORS, totalVisitors.toString());
    }

    const event = {
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      visitorId,
      type: 'page_view',
      path,
      source,
      device,
      isDailyUnique,
      title: document.title || 'Sayfa Görüntülendi',
      timestamp: new Date().toISOString()
    };

    saveLocalEvent(event);
    sendToSupabaseIfPossible(event);
    return event;
  } catch (e) {
    console.warn('trackPageView error:', e);
  }
}

// 2. Ürün Tıklaması / Detay Görüntülemesi Kaydet
export function trackProductClick(product) {
  if (!product) return;
  try {
    const visitorId = getOrCreateVisitorId();
    const source = getTrafficSource();
    const device = getDeviceType();

    // Ürüne özel tıklama sayacını artır
    let productViews = {};
    try {
      productViews = JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCT_VIEWS) || '{}');
    } catch {}
    const pId = String(product.id);
    productViews[pId] = (productViews[pId] || 0) + 1;
    localStorage.setItem(STORAGE_KEY_PRODUCT_VIEWS, JSON.stringify(productViews));

    const event = {
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      visitorId,
      type: 'product_click',
      productId: pId,
      productTitle: product.title || 'İsimsiz Ürün',
      category: product.category || 'Genel',
      source,
      device,
      action: 'Ürün İnceleme',
      details: `"${product.title}" detay sayfası açıldı`,
      timestamp: new Date().toISOString()
    };

    saveLocalEvent(event);
    sendToSupabaseIfPossible(event);
    return event;
  } catch (e) {
    console.warn('trackProductClick error:', e);
  }
}

// 3. Aksiyon Kaydet (Telefon Arama, WhatsApp, Harita, Arama vs.)
export function trackAction(actionName, details = {}) {
  try {
    const visitorId = getOrCreateVisitorId();
    const source = getTrafficSource();
    const device = getDeviceType();

    const event = {
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      visitorId,
      type: 'action',
      action: actionName, // 'telefon_arama', 'whatsapp_tiklama', 'harita_navigasyon', 'arama_yapildi'
      productTitle: details.productTitle || null,
      productId: details.productId ? String(details.productId) : null,
      details: typeof details === 'string' ? details : (details.text || JSON.stringify(details)),
      source,
      device,
      timestamp: new Date().toISOString()
    };

    saveLocalEvent(event);
    sendToSupabaseIfPossible(event);
    return event;
  } catch (e) {
    console.warn('trackAction error:', e);
  }
}

// 4. Admin Paneli İstatistiklerini Hesaplama ve Çekme
export async function getAnalyticsSummary(allProducts = []) {
  // Önce Supabase'den çekmeyi dene
  const supabase = getSupabase();
  let events = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);

      if (!error && data && data.length > 0) {
        events = data.map(d => ({
          id: d.id,
          visitorId: d.visitor_id,
          type: d.event_type,
          source: d.source,
          device: d.device,
          path: d.path,
          productId: d.product_id,
          productTitle: d.product_title,
          action: d.action,
          details: d.details,
          timestamp: d.created_at
        })).filter(e => !e.visitorId?.startsWith('v_kayseri') && !e.id?.startsWith('ev_init'));
      }
    } catch {
      // Supabase'den çekilemediyse yerel listeyi kullan
    }
  }

  if (events.length === 0) {
    events = getLocalEvents();
  }

  // GERÇEK VERİLER: Asla sahte demo veya yapay minimum değer üretme!
  if (events.length === 0) {
    return {
      totalVisitors: 0,
      todayVisitors: 0,
      totalProductViews: 0,
      contactActions: 0,
      sourceCounts: {},
      deviceCounts: {},
      topProducts: [],
      recentEvents: [],
      visitorJourneys: []
    };
  }

  // Toplam Tekil Ziyaretçi
  const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
  const storedTotalVisitors = parseInt(localStorage.getItem(STORAGE_KEY_VISITORS) || '0', 10);
  const totalVisitorsCount = Math.max(uniqueVisitors, storedTotalVisitors);

  // Bugünkü Tekil Ziyaretçiler
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEvents = events.filter(e => new Date(e.timestamp) >= todayStart);
  const todayVisitors = new Set(todayEvents.map(e => e.visitorId)).size;

  // Toplam Ürün Tıklanmaları
  const productClickEvents = events.filter(e => e.type === 'product_click' || e.productId);
  const totalProductViews = productClickEvents.length;

  // İletişim Aksiyonları (Telefon + WhatsApp + Harita)
  const contactActions = events.filter(e => 
    e.action?.includes('telefon') || 
    e.action?.includes('whatsapp') || 
    e.action?.includes('Arama') || 
    e.action?.includes('WhatsApp') ||
    e.action?.includes('Harita')
  ).length;

  // Kaynak (Referrer) Dağılımı
  const sourceCounts = {};
  events.forEach(e => {
    const src = e.source || 'Doğrudan (Direkt Giriş)';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  // Cihaz Dağılımı
  const deviceCounts = {};
  events.forEach(e => {
    const dev = e.device || 'Mobil 📱';
    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
  });

  // En Çok Tıklanan Ürünler
  const productCounts = {};
  productClickEvents.forEach(e => {
    const title = e.productTitle || 'Bilinmeyen Ürün';
    productCounts[title] = (productCounts[title] || 0) + 1;
  });

  const topProducts = Object.entries(productCounts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count);


  // Ziyaretçi Bazında Gruplama (Tekil Kullanıcı / Seans Hareket Yolculuğu)
  const visitorMap = new Map();
  events.forEach(ev => {
    const vid = ev.visitorId || 'v_anon';
    if (!visitorMap.has(vid)) {
      visitorMap.set(vid, {
        visitorId: vid,
        device: ev.device || 'Mobil 📱',
        source: ev.source || 'Doğrudan (Direkt Giriş)',
        firstSeen: ev.timestamp,
        lastSeen: ev.timestamp,
        actions: []
      });
    }
    const vData = visitorMap.get(vid);
    if (new Date(ev.timestamp) > new Date(vData.lastSeen)) {
      vData.lastSeen = ev.timestamp;
      vData.device = ev.device || vData.device;
    }
    if (new Date(ev.timestamp) < new Date(vData.firstSeen)) {
      vData.firstSeen = ev.timestamp;
      vData.source = ev.source || vData.source;
    }
    vData.actions.push(ev);
  });

  const visitorJourneys = Array.from(visitorMap.values()).map(v => {
    // Son yapılan hareket en üstte olacak şekilde sırala
    v.actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return v;
  }).sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));

  return {
    totalVisitors: totalVisitorsCount,
    todayVisitors,
    totalProductViews,
    contactActions,
    sourceCounts,
    deviceCounts,
    topProducts,
    recentEvents: events.slice(0, 80),
    visitorJourneys
  };
}

// Analiz Verilerini Sıfırlama
export function clearAnalyticsData() {
  try {
    localStorage.removeItem(STORAGE_KEY_EVENTS);
    localStorage.removeItem(STORAGE_KEY_VISITORS);
    localStorage.removeItem(STORAGE_KEY_PRODUCT_VIEWS);
    localStorage.removeItem('ikinciel_last_visit_date');
  } catch (e) {
    console.warn('Analytics clear error:', e);
  }
}

