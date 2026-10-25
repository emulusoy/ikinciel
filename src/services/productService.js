import { getSupabase } from '../supabaseClient';
import { defaultProducts } from '../data/products';

const STORAGE_KEY = 'ikinciel_products_v3';

// Görselleri ayrıştırıcı (tek link veya ||| ile ayrılmış çoklu linkler)
export function parseImages(rawImage) {
  if (!rawImage) return [];
  if (Array.isArray(rawImage)) return rawImage.filter(Boolean);
  if (typeof rawImage !== 'string') return [];
  const trimmed = rawImage.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (e) { /* ignore */ }
  }
  if (trimmed.includes('|||')) {
    return trimmed.split('|||').map(s => s.trim()).filter(Boolean);
  }
  return [trimmed];
}

export function serializeImages(images) {
  if (!images) return '';
  if (Array.isArray(images)) {
    return images.map(s => (s || '').trim()).filter(Boolean).join('|||');
  }
  return String(images).trim();
}

// Yerel depodan ürünleri çekme (fallback)
export function getLocalProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 8) {
        return parsed.map(p => ({
          ...p,
          images: parseImages(p.images || p.image),
          image: parseImages(p.images || p.image)[0] || ''
        }));
      }
    }
  } catch (e) { /* ignore */ }
  return defaultProducts.map(p => ({
    ...p,
    images: parseImages(p.images || p.image),
    image: parseImages(p.images || p.image)[0] || ''
  }));
}

export function saveLocalProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// Tüm ürünleri çekme (Supabase bağlıysa buluttan, değilse yerelden)
export async function fetchProducts() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, fallback to local:', error.message);
        return getLocalProducts();
      }

      if (data && data.length > 0) {
        return data.map(item => {
          const images = parseImages(item.image);
          return {
            id: item.id.toString(),
            title: item.title || '',
            category: item.category || 'Diğer',
            condition: item.condition || '2. El',
            stock: item.stock || 'Mevcut',
            description: item.description || '',
            image: images[0] || '',
            images: images,
            created_at: item.created_at
          };
        });
      }
    } catch (err) {
      console.warn('Supabase connection error:', err);
    }
  }
  return getLocalProducts();
}

// Ürün Ekleme
export async function addProduct(product) {
  const supabase = getSupabase();
  const images = parseImages(product.images || product.image);
  const serializedImg = serializeImages(images.length > 0 ? images : [product.image]);

  const newProduct = {
    ...product,
    id: Date.now().toString(),
    image: images[0] || product.image || '',
    images: images.length > 0 ? images : (product.image ? [product.image] : []),
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          title: newProduct.title,
          category: newProduct.category,
          condition: newProduct.condition,
          stock: newProduct.stock,
          description: newProduct.description,
          image: serializedImg
        }])
        .select();

      if (!error && data && data[0]) {
        return { ...newProduct, id: data[0].id.toString() };
      }
      console.warn('Supabase insert error, fallback:', error?.message);
    } catch (e) {
      console.warn('Supabase insert failed:', e);
    }
  }

  // Fallback: Yerel kayıt
  const local = getLocalProducts();
  const updated = [newProduct, ...local];
  saveLocalProducts(updated);
  return newProduct;
}

// Ürün Güncelleme
export async function updateProduct(id, product) {
  const supabase = getSupabase();
  const images = parseImages(product.images || product.image);
  const serializedImg = serializeImages(images.length > 0 ? images : [product.image]);

  const updatedProduct = {
    ...product,
    id,
    image: images[0] || product.image || '',
    images: images.length > 0 ? images : (product.image ? [product.image] : [])
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: updatedProduct.title,
          category: updatedProduct.category,
          condition: updatedProduct.condition,
          stock: updatedProduct.stock,
          description: updatedProduct.description,
          image: serializedImg
        })
        .eq('id', id);

      if (!error) return updatedProduct;
      console.warn('Supabase update error:', error?.message);
    } catch (e) {
      console.warn('Supabase update failed:', e);
    }
  }

  // Fallback: Yerel güncelleme
  const local = getLocalProducts();
  const updated = local.map(p => p.id === id ? { ...p, ...updatedProduct } : p);
  saveLocalProducts(updated);
  return updatedProduct;
}

// Ürün Silme
export async function deleteProduct(id) {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (!error) return true;
      console.warn('Supabase delete error:', error?.message);
    } catch (e) {
      console.warn('Supabase delete failed:', e);
    }
  }

  // Fallback: Yerel silme
  const local = getLocalProducts();
  const updated = local.filter(p => p.id !== id);
  saveLocalProducts(updated);
  return true;
}

// Fotoğraf Yükleme (Supabase Storage: 'product-images' bucket)
export async function uploadImageToStorage(file) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase bağlı değil.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// Varsayılan Örnek Ürünleri Supabase'e Toplu Yükleme
export async function seedProductsToSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase bağlı değil.');

  const items = defaultProducts.map(p => ({
    title: p.title,
    category: p.category,
    condition: p.condition,
    stock: p.stock,
    description: p.description,
    image: serializeImages(p.images || [p.image])
  }));

  const { error } = await supabase.from('products').insert(items);
  if (error) throw new Error(error.message);
  return true;
}

// KATEGORİ YÖNETİMİ (Yeni Kategori Ekleme, Listeleme ve Kalıcı Saklama)
const STORAGE_KEY_CATEGORIES = 'ikinciel_custom_categories_v1';

export function getCustomCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    }
  } catch (e) { /* ignore */ }
  return [];
}

export function saveCustomCategory(newCategoryName, existingCategories = []) {
  const trimmed = (newCategoryName || '').trim();
  if (!trimmed) return { success: false, message: 'Kategori adı boş olamaz.' };

  // Zaten var mı kontrolü (büyük/küçük harf duyarsız)
  const existing = existingCategories.find(c => c.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    return { success: true, category: existing, isNew: false, message: `"${existing}" kategorisi zaten mevcut, seçildi.` };
  }

  const custom = getCustomCategories();
  const existsInCustom = custom.find(c => c.toLowerCase() === trimmed.toLowerCase());
  if (!existsInCustom) {
    custom.push(trimmed);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(custom));
  }
  return { success: true, category: trimmed, isNew: true, message: `"${trimmed}" kategorisi başarıyla eklendi!` };
}

export function getAllCategories(productsList = [], defaultList = []) {
  const custom = getCustomCategories();
  const fromProducts = (productsList || []).map(p => p.category).filter(Boolean);
  const combined = ['Tümü', ...defaultList.filter(c => c !== 'Tümü'), ...custom, ...fromProducts];
  
  const seen = new Set();
  const result = [];
  combined.forEach(cat => {
    const lower = cat.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(cat);
    }
  });
  return result;
}

