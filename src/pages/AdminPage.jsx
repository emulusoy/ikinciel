import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { siteConfig } from '../siteConfig';
import { defaultProducts, categories } from '../data/products';

function getProducts() {
  try {
    const saved = localStorage.getItem('ikinciel_products');
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return defaultProducts;
}

function saveProducts(products) {
  localStorage.setItem('ikinciel_products', JSON.stringify(products));
}

const emptyProduct = {
  title: '',
  category: categories[1] || '',
  condition: '',
  description: '',
  image: '',
  price: 'Arayınız',
  stock: '',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // null = yeni ürün, id = düzenle
  const [form, setForm] = useState({ ...emptyProduct });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem('ikinciel_admin');
    if (session === 'true') {
      setAuthed(true);
      setProducts(getProducts());
    }
  }, []);

  // Giriş
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === siteConfig.adminPassword) {
      setAuthed(true);
      sessionStorage.setItem('ikinciel_admin', 'true');
      setProducts(getProducts());
      setError('');
    } else {
      setError('Şifre yanlış. Tekrar deneyin.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ikinciel_admin');
    setAuthed(false);
    setPassword('');
  };

  // Ürün ekleme/düzenleme
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setEditing(null);
    setForm({ ...emptyProduct });
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditing(product.id);
    setForm({ ...product });
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    let updated;
    if (editing) {
      updated = products.map(p => p.id === editing ? { ...form, id: editing } : p);
    } else {
      const newProduct = { ...form, id: Date.now().toString() };
      updated = [...products, newProduct];
    }
    setProducts(updated);
    saveProducts(updated);
    setShowForm(false);
    setForm({ ...emptyProduct });
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  };

  // Login Page
  if (!authed) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 36 }}>🔐</span>
          </div>
          <h2>Admin Girişi</h2>
          <p>Ürün eklemek ve düzenlemek için şifreyi girin.</p>
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Şifrenizi girin..."
              autoFocus
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-amber" style={{ width: '100%', marginTop: 8 }}>
            Giriş Yap
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => navigate('/')}
          >
            ← Siteye Dön
          </button>
        </form>
      </div>
    );
  }

  // Admin Panel
  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h2>🏗️ Admin Paneli</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => navigate('/')}>
            Siteyi Gör
          </button>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={handleLogout}>
            Çıkış
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Üst Bilgi */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Ürün Yönetimi</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>Toplam {products.length} ürün</p>
          </div>
          <button className="btn btn-amber" onClick={openAddForm}>
            + Yeni Ürün Ekle
          </button>
        </div>

        {/* Ürün Ekleme/Düzenleme Formu */}
        {showForm && (
          <div className="product-form-card">
            <h3>{editing ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün Ekle'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Ürün Adı *</label>
                  <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="Örn: Teleskopik Demir Direk" required />
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                    {categories.filter(c => c !== 'Tümü').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Durum / Kondisyon</label>
                  <input name="condition" className="form-input" value={form.condition} onChange={handleChange} placeholder="Örn: Temiz 2. El" />
                </div>
                <div className="form-group">
                  <label>Stok Bilgisi</label>
                  <input name="stock" className="form-input" value={form.stock} onChange={handleChange} placeholder="Örn: Depoda Mevcut" />
                </div>
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <textarea name="description" className="form-input" value={form.description} onChange={handleChange} placeholder="Ürün hakkında kısa açıklama..." />
              </div>

              <div className="form-group">
                <label>Fotoğraf (URL veya link yapıştırın)</label>
                <input name="image" className="form-input" value={form.image} onChange={handleChange} placeholder="https://... veya resim linki" />
                {form.image && (
                  <img src={form.image} alt="Önizleme" className="img-preview" onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fiyat Bilgisi</label>
                  <input name="price" className="form-input" value={form.price} onChange={handleChange} placeholder="Örn: Arayınız veya 500 TL" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn btn-amber">
                  {editing ? 'Kaydet' : 'Ürünü Ekle'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditing(null); }}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ürün Listesi */}
        <div className="admin-products">
          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Henüz ürün eklenmemiş.</p>
              <p>Yukarıdaki "Yeni Ürün Ekle" butonunu kullanın.</p>
            </div>
          )}

          {products.map(product => (
            <div key={product.id} className="admin-product-item">
              {product.image ? (
                <img src={product.image} alt={product.title} className="admin-product-img" />
              ) : (
                <div className="admin-product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>Foto Yok</div>
              )}
              <div className="admin-product-info">
                <h4>{product.title}</h4>
                <p>{product.category} • {product.condition} • {product.stock}</p>
              </div>
              <div className="admin-product-actions">
                <button className="btn-edit" onClick={() => openEditForm(product)}>Düzenle</button>
                <button className="btn-delete" onClick={() => handleDelete(product.id)}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
