import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, LayoutGrid, LogOut, ArrowLeft, Plus, Pencil, Trash2, 
  Search, RefreshCw, CheckCircle, Eye, Grid as GridIcon, Table as TableIcon,
  Upload, Database, AlertCircle, Camera, Check, Settings, ExternalLink, X, Image as ImageIcon
} from 'lucide-react';
import { siteConfig } from '../siteConfig';
import { categories } from '../data/products';
import { getSupabaseConfig, saveSupabaseConfig } from '../supabaseClient';
import { 
  fetchProducts, addProduct, updateProduct, deleteProduct, 
  uploadImageToStorage, seedProductsToSupabase, parseImages, serializeImages 
} from '../services/productService';

const emptyProduct = {
  title: '',
  category: categories[1] || 'Direk & İskele',
  condition: 'Temiz 2. El',
  description: '',
  image: '',
  images: [],
  stock: 'Depoda Mevcut',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [showForm, setShowForm] = useState(false);
  
  // Supabase ayar durumu ve modalı
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsUrl, setSettingsUrl] = useState(supabaseConfig.url || '');
  const [settingsKey, setSettingsKey] = useState(supabaseConfig.key || '');

  // Fotoğraf yükleme durumu
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Arama, filtre ve görünüm
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tümü');
  const [viewMode, setViewMode] = useState('grid');
  const [notification, setNotification] = useState('');

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = sessionStorage.getItem('ikinciel_admin');
    if (session === 'true') {
      setAuthed(true);
      loadData();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === siteConfig.adminPassword) {
      setAuthed(true);
      sessionStorage.setItem('ikinciel_admin', 'true');
      loadData();
      setError('');
    } else {
      setError('Girdiğiniz şifre hatalı.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ikinciel_admin');
    setAuthed(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Mobilden veya bilgisayardan fotoğraf yükleme
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!supabaseConfig.isConfigured) {
      setUploadError('Fotoğraf yükleyebilmek için üstteki "Supabase Ayarları"ndan bağlantıyı kaydedin.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const newUploaded = [];
      for (let i = 0; i < files.length; i++) {
        const publicUrl = await uploadImageToStorage(files[i]);
        newUploaded.push(publicUrl);
      }
      
      const currentList = form.images || (form.image ? [form.image] : []);
      const updatedList = [...currentList, ...newUploaded];
      setForm(prev => ({
        ...prev,
        images: updatedList,
        image: updatedList[0] || ''
      }));
      notify(`${newUploaded.length} adet fotoğraf başarıyla yüklendi!`);
    } catch (err) {
      setUploadError(err.message || 'Fotoğraf yüklenemedi. (Supabase Storage product-images deposunu kontrol edin)');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // URL ile fotoğraf ekleme
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    const currentList = form.images || (form.image ? [form.image] : []);
    const updatedList = [...currentList, newImageUrl.trim()];
    setForm(prev => ({
      ...prev,
      images: updatedList,
      image: updatedList[0] || ''
    }));
    setNewImageUrl('');
  };

  // Fotoğraf silme
  const handleRemoveImage = (indexToRemove) => {
    const currentList = form.images || (form.image ? [form.image] : []);
    const updatedList = currentList.filter((_, i) => i !== indexToRemove);
    setForm(prev => ({
      ...prev,
      images: updatedList,
      image: updatedList[0] || ''
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyProduct, images: [] });
    setUploadError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (product) => {
    const images = parseImages(product.images || product.image);
    setEditing(product.id);
    setForm({
      ...product,
      images: images,
      image: images[0] || product.image || ''
    });
    setUploadError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    try {
      const finalImages = form.images && form.images.length > 0
        ? form.images
        : (form.image ? [form.image] : []);

      const payload = {
        ...form,
        images: finalImages,
        image: finalImages[0] || ''
      };

      if (editing) {
        await updateProduct(editing, payload);
        notify('Ürün başarıyla güncellendi.');
      } else {
        await addProduct(payload);
        notify('Yeni ürün başarıyla eklendi.');
      }
      setShowForm(false);
      setEditing(null);
      await loadData();
    } catch (err) {
      notify('Kayıt sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      notify('Ürün silindi.');
      await loadData();
    } catch (err) {
      notify('Silme sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Supabase Ayarlarını Kaydetme
  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveSupabaseConfig(settingsUrl, settingsKey);
    const updated = getSupabaseConfig();
    setSupabaseConfig(updated);
    setShowSettingsModal(false);
    notify('Supabase ayarları kaydedildi. Veriler güncelleniyor...');
    loadData();
  };

  // Örnekleri Supabase'e Toplu Yükleme
  const handleSeedSupabase = async () => {
    if (!confirm('Tüm örnek ürünler Supabase veritabanına aktarılsın mı?')) return;
    setLoading(true);
    try {
      await seedProductsToSupabase();
      notify('Örnek ürünler Supabase bulut veritabanına başarıyla yüklendi!');
      await loadData();
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme
  const filteredProducts = products.filter(p => {
    const catMatch = selectedCat === 'Tümü' || p.category === selectedCat;
    const q = search.toLowerCase();
    const searchMatch = !q || p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    return catMatch && searchMatch;
  });

  const categoryCounts = {};
  categories.filter(c => c !== 'Tümü').forEach(cat => {
    categoryCounts[cat] = products.filter(p => p.category === cat).length;
  });

  if (!authed) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img src="/logo.svg" alt="Ulusoy İnşaat Logo" style={{ width: 64, height: 64, margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: 22, fontWeight: 900 }}>Ulusoy İnşaat Admin</h2>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
              Yusuf Ulusoy yönetim paneli giriş şifresini yazın.
            </p>
          </div>
          <div className="form-group">
            <label>Yönetici Şifresi</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              autoFocus
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Giriş Yap
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
              <ArrowLeft size={14} /> Siteye Dön
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar - Modern, Keskin, Üstte Siteye Git Butonlu */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="Logo" style={{ width: 34, height: 34, borderRadius: 8 }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: -0.3 }}>Ulusoy İnşaat</div>
              <small style={{ color: '#94a3b8', fontSize: 11 }}>Yusuf Ulusoy</small>
            </div>
          </div>
        </div>

        {/* SITE'YE GIT BUTONU EN ÜSTE ALINDI (Aşağı kaydırmaya gerek yok!) */}
        <div className="admin-sidebar-top-action">
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-view-site-top">
            <ExternalLink size={14} /> Siteyi Canlı Gör ↗
          </a>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-group-label">YÖNETİM</div>
          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setShowForm(false); }}
          >
            <Package size={16} /> Ürün Kataloğu
            <span className="admin-nav-badge">{products.length}</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => { setActiveTab('categories'); setShowForm(false); }}
          >
            <LayoutGrid size={16} /> Kategoriler
            <span className="admin-nav-badge">{categories.length - 1}</span>
          </button>

          <div className="admin-nav-group-label" style={{ marginTop: 16 }}>SİSTEM & BULUT</div>
          <button
            className="admin-nav-item"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings size={16} /> Supabase Ayarları
            {supabaseConfig.isConfigured ? (
              <span className="badge-connected">● Aktif</span>
            ) : (
              <span className="badge-pending">● Bekliyor</span>
            )}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="btn-sidebar-logout">
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="admin-mobile-bar">
        <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
          ↗ Siteye Git
        </a>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          Ürünler ({products.length})
        </button>
        <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
          Kategoriler
        </button>
        <button onClick={() => setShowSettingsModal(true)}>⚙️ DB</button>
        <button onClick={handleLogout}>Çıkış</button>
      </div>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <span style={{ fontSize: 16, fontWeight: 800 }}>Ulusoy İnşaat Panel</span>
            {supabaseConfig.isConfigured ? (
              <span className="admin-badge-loc badge-db-live">
                🟢 Supabase Bulut DB Canlı
              </span>
            ) : (
              <span 
                className="admin-badge-loc badge-db-warning"
                onClick={() => setShowSettingsModal(true)}
              >
                🟡 Yerel Mod (Supabase Bağla ↗)
              </span>
            )}
          </div>
          <div className="admin-topbar-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              <Eye size={13} /> Sitede Gör ↗
            </a>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={14} /> Yeni Ürün Ekle
            </button>
          </div>
        </header>

        {notification && (
          <div className="admin-alert">
            <CheckCircle size={15} /> {notification}
          </div>
        )}

        <div className="admin-content-centered">
          {/* ====== ÜRÜNLER SEKMESİ ====== */}
          {activeTab === 'products' && (
            <>
              {/* Stats Bar */}
              <div className="admin-stats-row">
                <div className="stat-card">
                  <div className="stat-label">Toplam Malzeme</div>
                  <div className="stat-val">{products.length}</div>
                  <div className="stat-sub">{supabaseConfig.isConfigured ? 'Supabase Bulutunda Canlı' : 'Yerel Hafızada'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Kategoriler</div>
                  <div className="stat-val">{categories.length - 1}</div>
                  <div className="stat-sub">İskele, plywood, klima vb.</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Bulut Durumu</div>
                  <div className="stat-val" style={{ fontSize: 16, marginTop: 4 }}>
                    {supabaseConfig.isConfigured ? '🟢 Bulut Bağlı' : '🟡 Yerel Mod'}
                  </div>
                  <div className="stat-sub">
                    <button 
                      onClick={() => setShowSettingsModal(true)} 
                      style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline', fontSize: 12 }}
                    >
                      Ayarları Yönet ↗
                    </button>
                  </div>
                </div>
              </div>

              {/* Ürün Ekleme / Düzenleme Formu (ÇOKLU FOTOĞRAF DESTEKLİ) */}
              {showForm && (
                <div className="product-form-card">
                  <div className="form-head">
                    <div>
                      <h3>{editing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
                      <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                        Ürüne birden fazla fotoğraf ekleyebilir, mobilden doğrudan kamerayla çekebilirsiniz.
                      </p>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditing(null); }}>
                      ✕ Kapat
                    </button>
                  </div>
                  <form onSubmit={handleSave}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ürün Başlığı *</label>
                        <input
                          name="title"
                          className="form-input"
                          value={form.title}
                          onChange={handleChange}
                          placeholder="Örn: Teleskopik Demir Direk, Harç Makinesi, 2. El Klima..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Kategori *</label>
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
                        <input
                          name="condition"
                          className="form-input"
                          value={form.condition}
                          onChange={handleChange}
                          placeholder="Örn: Temiz 2. El, Sıfır Ayarında, Test Edilmiş"
                        />
                      </div>
                      <div className="form-group">
                        <label>Stok Durumu</label>
                        <input
                          name="stock"
                          className="form-input"
                          value={form.stock}
                          onChange={handleChange}
                          placeholder="Örn: Depoda Mevcut, Deneyerek Teslim, Adetli"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Açıklama</label>
                      <textarea
                        name="description"
                        className="form-input"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Ölçüleri, markası, çalışma durumu veya şantiye teslimat detayları..."
                      />
                    </div>

                    {/* ÇOKLU FOTOĞRAF YÖNETİM ALANI */}
                    <div className="form-group multi-photo-box">
                      <label style={{ fontSize: 13, fontWeight: 800 }}>
                        Ürün Fotoğrafları (Kameradan Çek veya Galeriden Çoklu Seç)
                      </label>
                      
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />

                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 6, marginBottom: 12 }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          <Camera size={16} /> {uploading ? 'Fotoğraflar Yükleniyor...' : '📷 Fotoğraf Çek / Galeriden Yükle'}
                        </button>
                      </div>

                      {uploadError && (
                        <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 8 }}>
                          ⚠️ {uploadError}
                        </div>
                      )}

                      {/* URL İle Manuel Ekleme */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="veya internetten resim URL'si yapıştırın (https://...)"
                          value={newImageUrl}
                          onChange={e => setNewImageUrl(e.target.value)}
                        />
                        <button type="button" className="btn btn-outline" onClick={handleAddImageUrl}>
                          URL Ekle
                        </button>
                      </div>

                      {/* Fotoğraf Galerisi / Küçük Önizleme Listesi */}
                      <div className="uploaded-photos-grid">
                        {(form.images || []).map((imgUrl, index) => (
                          <div key={index} className="uploaded-photo-item">
                            <img src={imgUrl} alt={`Fotoğraf ${index + 1}`} />
                            <span className="photo-order-tag">{index === 0 ? 'Kapak Fotoğrafı' : `#${index + 1}`}</span>
                            <button
                              type="button"
                              className="btn-remove-photo"
                              onClick={() => handleRemoveImage(index)}
                              title="Bu fotoğrafı kaldır"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      {(!form.images || form.images.length === 0) && (
                        <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', padding: '12px 0' }}>
                          Henüz fotoğraf eklenmedi. Yukarıdaki butona basarak telefonunuzdan veya galeriden fotoğraf yükleyebilirsiniz.
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                      <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                        {loading ? 'Kaydediliyor...' : (editing ? 'Değişiklikleri Kaydet' : 'Ürünü Canlıya Ekle')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => { setShowForm(false); setEditing(null); }}
                      >
                        Vazgeç
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Toolbar */}
              <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                  <div className="admin-search-wrap">
                    <Search size={15} className="admin-search-icon" />
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Ürün adı veya açıklamada ara..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="admin-filter-select"
                    value={selectedCat}
                    onChange={e => setSelectedCat(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-toolbar-right">
                  <div className="view-toggle-group">
                    <button
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Kart Görünümü"
                    >
                      <GridIcon size={14} /> Kartlar
                    </button>
                    <button
                      className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                      title="Tablo Görünümü"
                    >
                      <TableIcon size={14} /> Liste
                    </button>
                  </div>

                  {supabaseConfig.isConfigured && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={handleSeedSupabase}
                      title="Varsayılan örnekleri Supabase veritabanına yükler"
                    >
                      <Database size={13} /> Örnekleri DB'ye Aktar
                    </button>
                  )}

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={loadData}
                    title="Verileri yeniden yükle"
                  >
                    <RefreshCw size={13} className={loading ? 'spin' : ''} /> Yenile
                  </button>
                </div>
              </div>

              {/* ÜRÜNLER KART GÖRÜNÜMÜ */}
              {viewMode === 'grid' && (
                <div className="admin-cards-grid">
                  {filteredProducts.map(product => {
                    const imgList = parseImages(product.images || product.image);
                    const coverImg = imgList[0] || product.image || '';
                    return (
                      <div key={product.id} className="admin-card">
                        <div className="admin-card-img-wrap">
                          {coverImg ? (
                            <img src={coverImg} alt={product.title} className="admin-card-img" />
                          ) : (
                            <div className="admin-card-no-img">Görsel Yok</div>
                          )}
                          <span className="admin-card-tag">{product.category}</span>
                          {imgList.length > 1 && (
                            <span className="admin-card-photos-count">
                              📷 {imgList.length} Fotoğraf
                            </span>
                          )}
                        </div>
                        <div className="admin-card-body">
                          <h4 className="admin-card-title">{product.title}</h4>
                          <p className="admin-card-desc">{product.description || 'Açıklama girilmedi.'}</p>
                          <div className="admin-card-meta">
                            <span className="admin-card-stock">● {product.stock || 'Mevcut'}</span>
                            <span className="admin-card-condition">{product.condition || '2. El'}</span>
                          </div>
                        </div>
                        <div className="admin-card-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(product)}>
                            <Pencil size={13} /> Düzenle
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>
                            <Trash2 size={13} /> Sil
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ÜRÜNLER TABLO GÖRÜNÜMÜ */}
              {viewMode === 'table' && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 70 }}>Görsel</th>
                        <th>Ürün Adı</th>
                        <th>Kategori</th>
                        <th>Fotoğraflar</th>
                        <th>Kondisyon</th>
                        <th>Stok</th>
                        <th style={{ textAlign: 'right' }}>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => {
                        const imgList = parseImages(product.images || product.image);
                        const coverImg = imgList[0] || product.image || '';
                        return (
                          <tr key={product.id}>
                            <td>
                              {coverImg ? (
                                <img src={coverImg} alt="" className="table-thumb" />
                              ) : (
                                <div className="table-thumb-placeholder">—</div>
                              )}
                            </td>
                            <td>
                              <strong style={{ fontSize: 14 }}>{product.title}</strong>
                              <div style={{ fontSize: 12, color: '#737373', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {product.description}
                              </div>
                            </td>
                            <td>
                              <span className="table-badge">{product.category}</span>
                            </td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>
                              {imgList.length} adet
                            </td>
                            <td style={{ fontSize: 13 }}>{product.condition}</td>
                            <td style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{product.stock}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: 6 }}>
                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(product)}>
                                  <Pencil size={12} /> Düzenle
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>
                                  <Trash2 size={12} /> Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredProducts.length === 0 && !loading && (
                <div className="empty-state">
                  <p style={{ fontSize: 15, fontWeight: 700 }}>Eşleşen ürün bulunamadı.</p>
                  <p style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>Yeni ürün ekleyebilir veya arama filtrenizi temizleyebilirsiniz.</p>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openAdd}>
                    <Plus size={14} /> Yeni Ürün Ekle
                  </button>
                </div>
              )}
            </>
          )}

          {/* ====== KATEGORİLER SEKMESİ ====== */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Kategori Dağılımı</h3>
                <p style={{ fontSize: 13, color: '#737373', marginTop: 2 }}>
                  Mevcut kategoriler ve bu kategorilere kayıtlı ürün sayıları.
                </p>
              </div>

              <div className="categories-grid">
                {categories.filter(c => c !== 'Tümü').map(cat => {
                  const count = categoryCounts[cat] || 0;
                  return (
                    <div key={cat} className="category-box">
                      <div className="cat-icon-wrap">📦</div>
                      <div className="cat-box-info">
                        <h4>{cat}</h4>
                        <span>{count} kayıtlı ürün</span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedCat(cat);
                          setActiveTab('products');
                        }}
                      >
                        Ürünleri Gör →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supabase Ayarları Modal Penceresi */}
      {showSettingsModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="form-head">
              <h3>⚡ Supabase Bulut Veritabanı ve Fotoğraf Bağlantısı</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Supabase Dashboard'unuzdan aldığınız bilgileri buraya yapıştırın. URL'nin sonundaki <code>/rest/v1/</code> fazlalığı varsa sistemimiz otomatik temizler.
            </p>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label>Project URL (Proje Bağlantı Adresi)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://stbgegzzazlxgoediaku.supabase.co"
                  value={settingsUrl}
                  onChange={e => setSettingsUrl(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>anon public Key (Anonim API Anahtarı)</label>
                <textarea
                  className="form-input"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={settingsKey}
                  onChange={e => setSettingsKey(e.target.value)}
                  required
                  style={{ minHeight: 70 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Kaydet ve Bağlan
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowSettingsModal(false)}>
                  Kapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
