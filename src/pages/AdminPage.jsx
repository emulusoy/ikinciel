import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, LayoutGrid, LogOut, ArrowLeft, Plus, Pencil, Trash2, 
  Search, RefreshCw, CheckCircle, Eye, Grid as GridIcon, Table as TableIcon,
  Settings, ExternalLink, Camera, Database,
  BarChart3, MousePointerClick, Globe, Compass, RotateCcw,
  Share2, Tag, Layers, SlidersHorizontal, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, X, Copy, Check, Filter,
  ShieldCheck, Lock, Menu, KeyRound
} from 'lucide-react';
import { siteConfig } from '../siteConfig';
import { categories } from '../data/products';
import { getSupabaseConfig, saveSupabaseConfig } from '../supabaseClient';
import { 
  fetchProducts, addProduct, updateProduct, deleteProduct, 
  uploadImageToStorage, seedProductsToSupabase, parseImages,
  getAllCategories, saveCustomCategory
} from '../services/productService';
import { getAnalyticsSummary, clearAnalyticsData } from '../services/analyticsService';
import { 
  verifyPassword, saveAdminPasswordToDB, isSessionAuthed, setSessionAuthed 
} from '../services/authService';

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

  const [authed, setAuthed] = useState(() => isSessionAuthed() || sessionStorage.getItem('ikinciel_admin') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [showForm, setShowForm] = useState(false);

  // Mobil Navigasyon & Çekmece Durumu
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Silme Onay Toast'ı (Altta Küçük Onay Kutusu)
  const [productToDelete, setProductToDelete] = useState(null);

  // Kategori Yönetimi
  const [categoriesList, setCategoriesList] = useState(() => getAllCategories([], categories));
  const [showInlineCatInput, setShowInlineCatInput] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catModalInput, setCatModalInput] = useState('');
  
  // Supabase ayar durumu ve Güvenlik Kilidi
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSecurityVerifyModal, setShowSecurityVerifyModal] = useState(false);
  const [securityVerifyPassword, setSecurityVerifyPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [settingsUrl, setSettingsUrl] = useState(supabaseConfig.url || '');
  const [settingsKey, setSettingsKey] = useState(supabaseConfig.key || '');
  const [newAdminPwdInput, setNewAdminPwdInput] = useState('');
  const [pwdChangeSuccess, setPwdChangeSuccess] = useState('');

  // Fotoğraf yükleme durumu
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // 200+ ÜRÜN İÇİN GELİŞMİŞ FİLTRELEME, ARAMA, SIRALAMA VE SAYFALAMA
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tümü');
  const [selectedStock, setSelectedStock] = useState('Tümü');
  const [selectedCondition, setSelectedCondition] = useState('Tümü');
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState('Tümü'); // 'Tümü' | 'hasPhoto' | 'noPhoto'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'photos-desc'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [notification, setNotification] = useState('');

  // Sayfalama (Pagination) Durumu
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24); // 12, 24, 48, 100, -1

  // Facebook Paylaşım Otomasyon Modalı
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [facebookProduct, setFacebookProduct] = useState(null);
  const [copiedFbText, setCopiedFbText] = useState(false);

  // Ziyaretçi ve Davranış Analitiği Durumu
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsViewMode, setAnalyticsViewMode] = useState('journeys'); // 'journeys' | 'raw'

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const loadAnalytics = async (prodList = products) => {
    setAnalyticsLoading(true);
    try {
      const summary = await getAnalyticsSummary(prodList);
      setAnalytics(summary);
    } catch (err) {
      console.warn('Analytics error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleClearAnalytics = () => {
    if (!confirm('Tüm gerçek ziyaretçi ve hareket logları sıfırlansın mı?')) return;
    clearAnalyticsData();
    notify('Ziyaretçi telemetri verileri sıfırlandı.');
    loadAnalytics();
  };

  const handleQuickAddCategory = () => {
    if (!newCatInput.trim()) return;
    const res = saveCustomCategory(newCatInput, categoriesList);
    const updated = getAllCategories(products, categories);
    setCategoriesList(updated);
    setForm(prev => ({ ...prev, category: res.category }));
    setNewCatInput('');
    setShowInlineCatInput(false);
    notify(res.message);
  };

  const handleAddCategoryFromTab = (e) => {
    e.preventDefault();
    if (!catModalInput.trim()) return;
    const res = saveCustomCategory(catModalInput, categoriesList);
    const updated = getAllCategories(products, categories);
    setCategoriesList(updated);
    setCatModalInput('');
    setShowCategoryModal(false);
    notify(res.message);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
      const catList = getAllCategories(data, categories);
      setCategoriesList(catList);
      loadAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) {
      loadData();
    }
  }, [authed]);

  // Herhangi bir filtre veya sayfa boyutu değiştiğinde sayfayı 1'e sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCat, selectedStock, selectedCondition, selectedPhotoFilter, sortBy, pageSize]);

  // Giriş Yapma - Veritabanı ve Güvenlik Kontrollü
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isOk = await verifyPassword(password);
      if (isOk) {
        setAuthed(true);
        setSessionAuthed(true);
        sessionStorage.setItem('ikinciel_admin', 'true');
        loadData();
      } else {
        setError('Girdiğiniz şifre hatalı.');
      }
    } catch (err) {
      console.error(err);
      setError('Giriş kontrolünde hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setSessionAuthed(false);
    sessionStorage.removeItem('ikinciel_admin');
    setAuthed(false);
    setMobileDrawerOpen(false);
    setIsSettingsUnlocked(false);
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
    setForm({ 
      ...emptyProduct, 
      category: categoriesList.find(c => c !== 'Tümü') || 'Direk & İskele',
      images: [] 
    });
    setUploadError('');
    setShowInlineCatInput(false);
    setShowForm(true);
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
    setShowInlineCatInput(false);
    setShowForm(true);
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
        setShowForm(false);
        setEditing(null);
      } else {
        const addedItem = await addProduct(payload);
        notify('Yeni ürün başarıyla eklendi.');
        setShowForm(false);
        setEditing(null);
        // Otomasyon: Yeni ürün eklendiğinde hemen Facebook paylaşım penceresini aç!
        setFacebookProduct(addedItem || payload);
        setCopiedFbText(false);
        setShowFacebookModal(true);
      }
      await loadData();
    } catch {
      notify('Kayıt sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Silme Onay Kutusu (Browser alert yerine altta çıkan şık onay toast'ı)
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const { id, title } = productToDelete;
    setLoading(true);
    try {
      await deleteProduct(id);
      notify(`"${title}" başarıyla silindi.`);
      setProductToDelete(null);
      await loadData();
    } catch {
      notify('Silme sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Supabase Ayarları Açma - ŞİFRE KORUMALI
  const handleOpenDBSettings = () => {
    if (isSettingsUnlocked) {
      setShowSettingsModal(true);
    } else {
      setSecurityVerifyPassword('');
      setSecurityError('');
      setShowSecurityVerifyModal(true);
    }
  };

  const handleVerifySecurityPassword = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setLoading(true);
    try {
      const isOk = await verifyPassword(securityVerifyPassword);
      if (isOk) {
        setIsSettingsUnlocked(true);
        setShowSecurityVerifyModal(false);
        setShowSettingsModal(true);
        notify('Güvenlik doğrulaması başarılı. Supabase ayarları açıldı.');
      } else {
        setSecurityError('Hatalı şifre! Supabase ayarlarına ve gizli anahtarlara erişim engellendi.');
      }
    } catch {
      setSecurityError('Doğrulama sırasında hata oluştu.');
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

  // Yönetici Şifresini DB'ye Kaydetme
  const handleUpdateAdminPassword = async (e) => {
    e.preventDefault();
    if (!newAdminPwdInput.trim()) return;
    setLoading(true);
    try {
      await saveAdminPasswordToDB(newAdminPwdInput.trim());
      setPwdChangeSuccess('Yönetici şifresi veritabanına ve sisteme kaydedildi!');
      setNewAdminPwdInput('');
      notify('Yeni şifre veritabanına kaydedildi.');
      setTimeout(() => setPwdChangeSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Şifre kaydedilemedi.');
    } finally {
      setLoading(false);
    }
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

  // Facebook Paylaşım Metni & İşlemleri
  const generateFacebookPostText = (product) => {
    if (!product) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ulusoyinsaat.com';
    const prodUrl = `${origin}/urun/${product.id}`;
    const cleanDesc = product.description ? `\n📝 Açıklama: ${product.description}` : '';

    return `🏗️ ULUSOY İNŞAAT - 2. EL VE SIFIR İNŞAAT MALZEMELERİ (KAYSERİ)

📌 Ürün: ${product.title}
🏷️ Kategori: ${product.category || 'İnşaat Malzemesi'}
📦 Durum: ${product.condition || 'Temiz 2. El'} | ${product.stock || 'Depoda Mevcut'}${cleanDesc}

📍 Yer: Ambar Mah. Nakliyeciler Sitesi Yanı, Melikgazi / Kayseri
🚚 Kayseri ve çevre illere (Sivas, Yozgat, Nevşehir, Niğde) nakliye imkanı!
📞 İletişim & Fiyat: 0532 504 51 38 (Yusuf Ulusoy)
💬 WhatsApp: https://wa.me/905325045138?text=${encodeURIComponent(`Merhaba Yusuf Bey, Facebook ilanınızdaki "${product.title}" hakkında bilgi almak istiyorum.`)}

🔗 Ürünü ve fotoğrafları sitemizde inceleyin:
${prodUrl}`;
  };

  const handleOpenFacebookShare = (product) => {
    setFacebookProduct(product);
    setCopiedFbText(false);
    setShowFacebookModal(true);
  };

  const handleCopyFbText = () => {
    if (!facebookProduct) return;
    const text = generateFacebookPostText(facebookProduct);
    navigator.clipboard.writeText(text);
    setCopiedFbText(true);
    notify('İlan metni panoya kopyalandı! Facebook sayfanıza yapıştırabilirsiniz.');
    setTimeout(() => setCopiedFbText(false), 3000);
  };

  const handleLaunchFacebookSharer = () => {
    if (!facebookProduct) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const prodUrl = `${origin}/urun/${facebookProduct.id}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(prodUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=650,height=750');
  };

  // 200+ ÜRÜN İÇİN GÜÇLÜ FİLTRELEME VE SIRALAMA MOTORU
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      // 1. Kategori Filtresi
      if (selectedCat !== 'Tümü' && p.category !== selectedCat) return false;
      
      // 2. Stok Filtresi
      if (selectedStock !== 'Tümü' && p.stock !== selectedStock) return false;
      
      // 3. Kondisyon Filtresi
      if (selectedCondition !== 'Tümü' && p.condition !== selectedCondition) return false;

      // 4. Fotoğraf Filtresi
      const imgs = parseImages(p.images || p.image);
      const hasPhoto = imgs.length > 0 || (p.image && p.image.trim().length > 0);
      if (selectedPhotoFilter === 'hasPhoto' && !hasPhoto) return false;
      if (selectedPhotoFilter === 'noPhoto' && hasPhoto) return false;

      // 5. Arama Terimi Filtresi
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }

      return true;
    });

    // Sıralama
    return [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
        const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return String(b.id).localeCompare(String(a.id));
      }
      if (sortBy === 'oldest') {
        const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
        const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return String(a.id).localeCompare(String(b.id));
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '', 'tr');
      }
      if (sortBy === 'title-desc') {
        return (b.title || '').localeCompare(a.title || '', 'tr');
      }
      if (sortBy === 'photos-desc') {
        const aImgs = parseImages(a.images || a.image).length;
        const bImgs = parseImages(b.images || b.image).length;
        return bImgs - aImgs;
      }
      return 0;
    });
  }, [products, search, selectedCat, selectedStock, selectedCondition, selectedPhotoFilter, sortBy]);

  // Sayfalama Hesaplamaları
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    if (pageSize === -1) return filteredAndSortedProducts;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [filteredAndSortedProducts, safeCurrentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * (pageSize === -1 ? totalItems : pageSize) + 1;
  const endIndex = pageSize === -1 ? totalItems : Math.min(safeCurrentPage * pageSize, totalItems);

  const hasActiveFilters = search.trim() !== '' || selectedCat !== 'Tümü' || selectedStock !== 'Tümü' || selectedCondition !== 'Tümü' || selectedPhotoFilter !== 'Tümü' || sortBy !== 'newest';

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCat('Tümü');
    setSelectedStock('Tümü');
    setSelectedCondition('Tümü');
    setSelectedPhotoFilter('Tümü');
    setSortBy('newest');
    setCurrentPage(1);
  };

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
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Kontrol Ediliyor...' : 'Giriş Yap'}
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
      {/* =========================================================================
          DESKTOP SIDEBAR (860px Üstünde Sabit ve Güçlü)
          ========================================================================= */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="Logo" style={{ width: 34, height: 34, borderRadius: 8 }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: -0.3 }}>Ulusoy İnşaat</div>
              <small style={{ color: '#94a3b8', fontSize: 11 }}>Yusuf Ulusoy Yönetim</small>
            </div>
          </div>
        </div>

        {/* SITE'YE GIT BUTONU EN ÜSTE ALINDI */}
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
            <span className="admin-nav-badge">{categoriesList.length - 1}</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setShowForm(false); loadAnalytics(); }}
          >
            <BarChart3 size={16} /> Gerçek Ziyaretçi & Telemetri
            <span className="admin-nav-badge" style={{ background: '#2563eb', color: '#fff', fontSize: 11 }}>
              {analytics?.todayVisitors ? `${analytics.todayVisitors} Bugün` : 'Canlı'}
            </span>
          </button>

          <div className="admin-nav-group-label" style={{ marginTop: 16 }}>SİSTEM & GÜVENLİK</div>
          <button
            className="admin-nav-item"
            onClick={handleOpenDBSettings}
          >
            <Lock size={15} /> Supabase DB & Şifre
            {supabaseConfig.isConfigured ? (
              <span className="badge-connected">● Aktif</span>
            ) : (
              <span className="badge-pending">● Şifreli</span>
            )}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="btn-sidebar-logout" title="Güvenli Çıkış Yap">
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBİL SOL ÇEKMECE MENÜ (OFF-CANVAS SLIDE-IN DRAWER)
          ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="admin-drawer-backdrop" onClick={() => setMobileDrawerOpen(false)}>
          <div className="admin-mobile-drawer-pane" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.svg" alt="Logo" style={{ width: 36, height: 36, borderRadius: 8 }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>Ulusoy İnşaat</div>
                  <small style={{ color: '#64748b', fontSize: 12 }}>Yusuf Ulusoy Yönetim</small>
                </div>
              </div>
              <button className="btn-drawer-close" onClick={() => setMobileDrawerOpen(false)}>✕</button>
            </div>

            <div className="drawer-quick-site">
              <a href="/" target="_blank" rel="noopener noreferrer" className="btn-view-site-top" onClick={() => setMobileDrawerOpen(false)}>
                <ExternalLink size={14} /> Sitede Canlı İncele ↗
              </a>
            </div>

            <div className="drawer-nav-list">
              <button
                className={`drawer-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => { setActiveTab('products'); setShowForm(false); setMobileDrawerOpen(false); }}
              >
                <Package size={18} />
                <span>Ürün Kataloğu</span>
                <span className="drawer-badge">{products.length}</span>
              </button>

              <button
                className="drawer-nav-item drawer-nav-add"
                onClick={() => { openAdd(); setMobileDrawerOpen(false); }}
              >
                <Plus size={18} />
                <span>Yeni Malzeme Ekle</span>
              </button>

              <button
                className={`drawer-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => { setActiveTab('categories'); setShowForm(false); setMobileDrawerOpen(false); }}
              >
                <LayoutGrid size={18} />
                <span>Kategoriler</span>
                <span className="drawer-badge">{categoriesList.length - 1}</span>
              </button>

              <button
                className={`drawer-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => { setActiveTab('analytics'); setShowForm(false); loadAnalytics(); setMobileDrawerOpen(false); }}
              >
                <BarChart3 size={18} />
                <span>Gerçek Ziyaretçi & Telemetri</span>
                <span className="drawer-badge badge-blue">
                  {analytics?.todayVisitors ? `${analytics.todayVisitors} Bugün` : 'Canlı'}
                </span>
              </button>

              <div className="drawer-divider"></div>

              <button
                className="drawer-nav-item"
                onClick={() => { setMobileDrawerOpen(false); handleOpenDBSettings(); }}
              >
                <Lock size={18} />
                <span>Supabase DB & Şifre</span>
                <span className="drawer-badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
                  🔒 Şifreli
                </span>
              </button>
            </div>

            <div className="drawer-footer">
              <button onClick={handleLogout} className="btn-sidebar-logout">
                <LogOut size={16} /> Güvenli Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="admin-main">
        {/* =========================================================================
            MOBİL İÇİN YENİDEN TASARLANMIŞ ÜST BAŞLIK (MOBILE APP HEADER)
            ========================================================================= */}
        <div className="admin-mobile-header">
          <button 
            className="btn-mobile-menu-trigger" 
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Menüyü Aç"
          >
            <Menu size={20} />
            <span>Menü</span>
          </button>

          <div className="mobile-header-brand">
            <img src="/logo.svg" alt="Logo" style={{ width: 26, height: 26, borderRadius: 6 }} />
            <strong>Ulusoy Panel</strong>
          </div>

          <div className="mobile-header-actions">
            <button className="btn-mobile-quick-add" onClick={openAdd} title="Hızlı Malzeme Ekle">
              <Plus size={15} /> Ekle
            </button>
            <button className="btn-mobile-quick-logout" onClick={handleLogout} title="Çıkış Yap">
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Top Header Bar - Masaüstünde Sabit Başlık */}
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
                onClick={handleOpenDBSettings}
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
            <button onClick={handleLogout} className="btn btn-outline btn-sm btn-topbar-logout" title="Güvenli Çıkış Yap">
              <LogOut size={13} /> Çıkış Yap
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
                  <div className="stat-label">Listelenen / Filtrelenen</div>
                  <div className="stat-val" style={{ color: '#2563eb' }}>{filteredAndSortedProducts.length}</div>
                  <div className="stat-sub">{hasActiveFilters ? 'Filtreler Aktif' : 'Tüm Ürünler'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Kategoriler</div>
                  <div className="stat-val">{categoriesList.length - 1}</div>
                  <div className="stat-sub">İskele, plywood, klima vb.</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Bulut & Güvenlik</div>
                  <div className="stat-val" style={{ fontSize: 16, marginTop: 4 }}>
                    {supabaseConfig.isConfigured ? '🟢 Bulut Bağlı' : '🟡 Yerel Mod'}
                  </div>
                  <div className="stat-sub">
                    <button 
                      onClick={handleOpenDBSettings} 
                      style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline', fontSize: 12 }}
                    >
                      🔒 Güvenli Ayarlar ↗
                    </button>
                  </div>
                </div>
              </div>

              {/* 200+ ÜRÜN İÇİN GELİŞMİŞ ARAMA, FİLTRE & ARAÇ ÇUBUĞU */}
              <div className="admin-advanced-filter-panel">
                <div className="filter-main-row">
                  <div className="admin-search-wrap">
                    <Search size={16} className="admin-search-icon" />
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="200+ ürün arasında ara (başlık, açıklama, kategori)..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                      <button 
                        type="button" 
                        className="admin-search-clear-btn" 
                        onClick={() => setSearch('')}
                        title="Aramayı Temizle"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <select
                    className="admin-filter-select"
                    value={selectedCat}
                    onChange={e => setSelectedCat(e.target.value)}
                  >
                    <option value="Tümü">Tüm Kategoriler ({products.length})</option>
                    {categoriesList.filter(c => c !== 'Tümü').map(c => (
                      <option key={c} value={c}>
                        {c} ({products.filter(p => p.category === c).length})
                      </option>
                    ))}
                  </select>

                  <select
                    className="admin-filter-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    title="Sıralama Düzeni"
                  >
                    <option value="newest">🕒 En Yeni Eklenenler</option>
                    <option value="oldest">🕰️ En Eski Eklenenler</option>
                    <option value="title-asc">🔤 İsim: A'dan Z'ye</option>
                    <option value="title-desc">🔤 İsim: Z'den A'ya</option>
                    <option value="photos-desc">📷 Fotoğraf Sayısına Göre</option>
                  </select>

                  <button 
                    type="button" 
                    className={`btn btn-outline btn-sm ${showAdvancedFilters ? 'btn-active' : ''}`}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <SlidersHorizontal size={14} />
                    {showAdvancedFilters ? 'Filtreleri Gizle' : 'Gelişmiş Filtreler'}
                  </button>

                  <div className="view-toggle-group">
                    <button
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Kart Görünümü"
                    >
                      <GridIcon size={14} />
                    </button>
                    <button
                      className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                      title="Liste / Tablo Görünümü"
                    >
                      <TableIcon size={14} />
                    </button>
                  </div>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={loadData}
                    title="Verileri yeniden yükle"
                  >
                    <RefreshCw size={13} className={loading ? 'spin' : ''} />
                  </button>
                </div>

                {showAdvancedFilters && (
                  <div className="filter-expanded-row">
                    <div className="filter-field-block">
                      <label><Package size={13} /> Stok Durumu:</label>
                      <select 
                        value={selectedStock} 
                        onChange={e => setSelectedStock(e.target.value)}
                        className="admin-filter-select-sm"
                      >
                        <option value="Tümü">Tümü (Stok)</option>
                        <option value="Depoda Mevcut">Depoda Mevcut</option>
                        <option value="Adetli Stok">Adetli Stok</option>
                        <option value="Hemen Teslim">Hemen Teslim</option>
                        <option value="Deneyerek Teslim">Deneyerek Teslim</option>
                        <option value="Sınırlı Stok">Sınırlı Stok</option>
                      </select>
                    </div>

                    <div className="filter-field-block">
                      <label><Layers size={13} /> Kondisyon:</label>
                      <select 
                        value={selectedCondition} 
                        onChange={e => setSelectedCondition(e.target.value)}
                        className="admin-filter-select-sm"
                      >
                        <option value="Tümü">Tümü (Kondisyon)</option>
                        <option value="Temiz 2. El">Temiz 2. El</option>
                        <option value="Sıfır Ayarında">Sıfır Ayarında</option>
                        <option value="Bakımlı / Çalışır">Bakımlı / Çalışır</option>
                        <option value="1. ve 2. Kalite">1. ve 2. Kalite</option>
                        <option value="Çıkma / Hurda">Çıkma / Hurda</option>
                      </select>
                    </div>

                    <div className="filter-field-block">
                      <label><Camera size={13} /> Fotoğraf:</label>
                      <select 
                        value={selectedPhotoFilter} 
                        onChange={e => setSelectedPhotoFilter(e.target.value)}
                        className="admin-filter-select-sm"
                      >
                        <option value="Tümü">Hepsi</option>
                        <option value="hasPhoto">📷 Sadece Fotoğraflılar</option>
                        <option value="noPhoto">🚫 Fotoğrafsız Olanlar</option>
                      </select>
                    </div>

                    <div className="filter-field-block">
                      <label>Sayfa Başına:</label>
                      <select 
                        value={pageSize} 
                        onChange={e => setPageSize(Number(e.target.value))}
                        className="admin-filter-select-sm"
                      >
                        <option value={12}>12 Ürün</option>
                        <option value={24}>24 Ürün</option>
                        <option value={48}>48 Ürün</option>
                        <option value={100}>100 Ürün</option>
                        <option value={-1}>Tümünü Göster</option>
                      </select>
                    </div>

                    {hasActiveFilters && (
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm btn-clear-filters"
                        onClick={resetAllFilters}
                      >
                        <RotateCcw size={13} /> Filtreleri Temizle
                      </button>
                    )}
                  </div>
                )}

                <div className="filter-summary-bar">
                  <div className="filter-results-text">
                    Toplam <strong>{totalItems}</strong> ürün bulundu. 
                    {pageSize !== -1 && totalItems > 0 && (
                      <span> (Gösterilen: <strong>{startIndex} - {endIndex}</strong> | Sayfa {safeCurrentPage} / {totalPages})</span>
                    )}
                  </div>

                  {hasActiveFilters && (
                    <div className="active-filter-chips">
                      {selectedCat !== 'Tümü' && (
                        <span className="filter-chip">
                          Kategori: {selectedCat}
                          <button onClick={() => setSelectedCat('Tümü')}>✕</button>
                        </span>
                      )}
                      {selectedStock !== 'Tümü' && (
                        <span className="filter-chip">
                          Stok: {selectedStock}
                          <button onClick={() => setSelectedStock('Tümü')}>✕</button>
                        </span>
                      )}
                      {selectedCondition !== 'Tümü' && (
                        <span className="filter-chip">
                          Durum: {selectedCondition}
                          <button onClick={() => setSelectedCondition('Tümü')}>✕</button>
                        </span>
                      )}
                      {selectedPhotoFilter !== 'Tümü' && (
                        <span className="filter-chip">
                          {selectedPhotoFilter === 'hasPhoto' ? 'Sadece Fotoğraflı' : 'Fotoğrafsız'}
                          <button onClick={() => setSelectedPhotoFilter('Tümü')}>✕</button>
                        </span>
                      )}
                      {search && (
                        <span className="filter-chip">
                          Arama: "{search}"
                          <button onClick={() => setSearch('')}>✕</button>
                        </span>
                      )}
                      <button onClick={resetAllFilters} className="filter-clear-all-link">
                        Sıfırla
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ÜRÜNLER KART GÖRÜNÜMÜ */}
              {viewMode === 'grid' && (
                <div className="admin-cards-grid">
                  {paginatedProducts.map(product => {
                    const imgList = parseImages(product.images || product.image);
                    const coverImg = imgList[0] || product.image || '';
                    return (
                      <div key={product.id} className="admin-card">
                        <div className="admin-card-img-wrap">
                          {coverImg ? (
                            <img src={coverImg} alt={product.title} className="admin-card-img" />
                          ) : (
                            <div className="admin-card-no-img">
                              <Camera size={24} style={{ opacity: 0.5, marginBottom: 4 }} />
                              <span>Görsel Yok</span>
                            </div>
                          )}

                          <span className="admin-card-tag">
                            <Tag size={11} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
                            {product.category}
                          </span>

                          {imgList.length > 0 && (
                            <span className="admin-card-photos-count">
                              <Camera size={11} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
                              {imgList.length} Fotoğraf
                            </span>
                          )}
                        </div>

                        <div className="admin-card-body">
                          <h4 className="admin-card-title">{product.title}</h4>
                          <p className="admin-card-desc">{product.description || 'Açıklama girilmedi.'}</p>
                          
                          <div className="admin-card-meta-badges">
                            <span className="badge-meta badge-stock">
                              <Package size={12} />
                              {product.stock || 'Mevcut'}
                            </span>
                            <span className="badge-meta badge-condition">
                              <Layers size={12} />
                              {product.condition || '2. El'}
                            </span>
                          </div>
                        </div>

                        {/* Aksiyon Butonları: Düzenle, Facebook, İncele, Sil (Altta onay açar) */}
                        <div className="admin-card-actions">
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => openEdit(product)}
                            title="Ürünü Düzenle"
                          >
                            <Pencil size={13} /> Düzenle
                          </button>

                          <button 
                            className="btn btn-facebook-action btn-sm" 
                            onClick={() => handleOpenFacebookShare(product)}
                            title="Facebook Sayfasında 1 Tıkla Paylaş"
                          >
                            <Share2 size={13} /> Facebook
                          </button>

                          <a 
                            href={`/urun/${product.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-outline btn-sm btn-icon-only"
                            title="Canlı Ürün Sayfasına Git"
                          >
                            <ExternalLink size={13} />
                          </a>

                          <button 
                            className="btn btn-danger btn-sm btn-icon-only" 
                            onClick={() => handleDeleteClick(product)}
                            title="Ürünü Sil"
                          >
                            <Trash2 size={13} />
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
                        <th style={{ width: 65 }}>Görsel</th>
                        <th>Ürün Adı</th>
                        <th>Kategori</th>
                        <th>Fotoğraf</th>
                        <th>Kondisyon</th>
                        <th>Stok</th>
                        <th style={{ textAlign: 'right' }}>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map(product => {
                        const imgList = parseImages(product.images || product.image);
                        const coverImg = imgList[0] || product.image || '';
                        return (
                          <tr key={product.id}>
                            <td>
                              {coverImg ? (
                                <img src={coverImg} alt="" className="table-thumb" />
                              ) : (
                                <div className="table-thumb-placeholder">
                                  <Camera size={14} style={{ opacity: 0.4 }} />
                                </div>
                              )}
                            </td>
                            <td>
                              <strong style={{ fontSize: 14 }}>{product.title}</strong>
                              <div style={{ fontSize: 12, color: '#737373', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {product.description || 'Açıklama girilmedi.'}
                              </div>
                            </td>
                            <td>
                              <span className="table-badge">
                                <Tag size={10} style={{ marginRight: 3 }} />
                                {product.category}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>
                              <Camera size={12} style={{ marginRight: 4, display: 'inline' }} />
                              {imgList.length} Adet
                            </td>
                            <td>
                              <span className="badge-meta badge-condition" style={{ display: 'inline-flex' }}>
                                <Layers size={11} />
                                {product.condition}
                              </span>
                            </td>
                            <td>
                              <span className="badge-meta badge-stock" style={{ display: 'inline-flex' }}>
                                <Package size={11} />
                                {product.stock}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                <button 
                                  className="btn btn-facebook-action btn-sm" 
                                  onClick={() => handleOpenFacebookShare(product)}
                                  title="Facebook'ta Paylaş"
                                >
                                  <Share2 size={12} /> Paylaş
                                </button>
                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(product)}>
                                  <Pencil size={12} /> Düzenle
                                </button>
                                <a 
                                  href={`/urun/${product.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="btn btn-outline btn-sm"
                                  title="İncele"
                                >
                                  <ExternalLink size={12} />
                                </a>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(product)}>
                                  <Trash2 size={12} />
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

              {/* SAYFALAMA (PAGINATION) BARI */}
              {totalPages > 1 && pageSize !== -1 && (
                <div className="admin-pagination-container">
                  <div className="pagination-info">
                    Sayfa <strong>{safeCurrentPage}</strong> / <strong>{totalPages}</strong> ({totalItems} Ürün)
                  </div>
                  <div className="pagination-controls">
                    <button 
                      className="pagination-btn" 
                      onClick={() => setCurrentPage(1)} 
                      disabled={safeCurrentPage <= 1}
                      title="İlk Sayfa"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button 
                      className="pagination-btn" 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                      disabled={safeCurrentPage <= 1}
                      title="Önceki Sayfa"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2)
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                        return (
                          <div key={p} style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {showEllipsis && <span className="pagination-ellipsis">…</span>}
                            <button
                              className={`pagination-number-btn ${safeCurrentPage === p ? 'active' : ''}`}
                              onClick={() => setCurrentPage(p)}
                            >
                              {p}
                            </button>
                          </div>
                        );
                      })}

                    <button 
                      className="pagination-btn" 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                      disabled={safeCurrentPage >= totalPages}
                      title="Sonraki Sayfa"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button 
                      className="pagination-btn" 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={safeCurrentPage >= totalPages}
                      title="Son Sayfa"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {filteredAndSortedProducts.length === 0 && !loading && (
                <div className="empty-state">
                  <p style={{ fontSize: 16, fontWeight: 800 }}>Eşleşen ürün bulunamadı.</p>
                  <p style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
                    Arama filtrenizi temizleyebilir veya yeni malzeme ekleyebilirsiniz.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
                    {hasActiveFilters && (
                      <button className="btn btn-outline" onClick={resetAllFilters}>
                        <RotateCcw size={14} /> Filtreleri Sıfırla
                      </button>
                    )}
                    <button className="btn btn-primary" onClick={openAdd}>
                      <Plus size={14} /> Yeni Malzeme Ekle
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ====== KATEGORİLER SEKMESİ ====== */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>Kategori Yönetimi & Dağılımı</h3>
                  <p style={{ fontSize: 13, color: '#737373', marginTop: 2 }}>
                    Mevcut ürün kategorileri ve yeni kategori ekleme alanı.
                  </p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCategoryModal(true)}
                >
                  <Plus size={14} /> Yeni Kategori Ekle
                </button>
              </div>

              <div className="categories-grid">
                {categoriesList.filter(c => c !== 'Tümü').map(cat => {
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

          {/* ====== GERÇEK ZİYARETÇİ VE TELEMETRİ ANALİTİĞİ SEKMESİ ====== */}
          {activeTab === 'analytics' && (
            <div className="analytics-dashboard">
              <div className="analytics-head-row">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
                      Gerçek Zamanlı Ziyaretçi & Telemetri
                    </h3>
                    <span className="live-telemetry-badge">
                      <ShieldCheck size={14} /> %100 Gerçek Veri (Uydurma/Simüle Yok)
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Kayseri ve Türkiye geneli kullanıcılar siteye girdiğinde; nereden geldikleri, hangi ürünleri inceledikleri ve iletişim eylemleri anlık kaydedilir.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => loadAnalytics()}
                    disabled={analyticsLoading}
                  >
                    <RefreshCw size={13} className={analyticsLoading ? 'spin' : ''} />
                    {analyticsLoading ? 'Yenileniyor...' : 'Verileri Yenile'}
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={handleClearAnalytics}
                    title="İstatistik ve hareket geçmişini temizle"
                  >
                    <RotateCcw size={13} /> Sıfırla
                  </button>
                </div>
              </div>

              {(!analytics || analytics.totalVisitors === 0) && (
                <div className="analytics-authentic-notice">
                  <div className="notice-icon"><ShieldCheck size={22} /></div>
                  <div className="notice-body">
                    <strong>Gerçek Telemetri Sistemi Devrede — Henüz Ziyaretçi Kaydı Yok</strong>
                    <p>
                      Bu panelde kesinlikle rastgele veya uydurma veriler gösterilmez. Gerçek kullanıcılar Google, Facebook, WhatsApp veya doğrudan bağlantı ile sitenize girdiğinde; tekil kişi sayısı, kullandıkları cihazlar ve tıkladıkları malzemeler burada otomatik listelenecektir.
                    </p>
                  </div>
                </div>
              )}

              {/* 4 Ana Metrik Kartı */}
              <div className="admin-stats-row" style={{ marginTop: 18 }}>
                <div className="stat-card">
                  <div className="stat-label">👥 Toplam Tekil Ziyaretçi</div>
                  <div className="stat-val">{analytics?.totalVisitors || 0}</div>
                  <div className="stat-sub">Siteye giren gerçek tekil kişi</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">📅 Bugünkü Ziyaretçiler</div>
                  <div className="stat-val" style={{ color: '#2563eb' }}>
                    {analytics?.todayVisitors || 0}
                  </div>
                  <div className="stat-sub">Bugünkü tekil giriş</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">🔍 Ürün Detay Tıklanmaları</div>
                  <div className="stat-val" style={{ color: '#16a34a' }}>
                    {analytics?.totalProductViews || 0}
                  </div>
                  <div className="stat-sub">İncelenen malzeme sayısı</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">📞 İletişim / Arama Eylemleri</div>
                  <div className="stat-val" style={{ color: '#d97706' }}>
                    {analytics?.contactActions || 0}
                  </div>
                  <div className="stat-sub">Telefon, WhatsApp & Harita tıklaması</div>
                </div>
              </div>

              {/* 2 Kolon: Nereden Geldiler? & En Çok Tıklanan Ürünler */}
              <div className="analytics-split-grid">
                <div className="analytics-card">
                  <div className="analytics-card-head">
                    <Globe size={18} className="card-head-icon" />
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800 }}>Ziyaretçiler Nereden Geldi?</h4>
                      <small style={{ color: '#64748b' }}>Trafik kaynakları ve arama motorları</small>
                    </div>
                  </div>

                  <div className="source-bars-list">
                    {analytics?.sourceCounts && Object.keys(analytics.sourceCounts).length > 0 ? (
                      Object.entries(analytics.sourceCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([src, count]) => {
                          const total = Object.values(analytics.sourceCounts).reduce((a, b) => a + b, 0) || 1;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={src} className="source-item">
                              <div className="source-row-info">
                                <span className="source-name">
                                  {src.includes('Google') && '🔍 '}
                                  {src.includes('Facebook') && '📘 '}
                                  {src.includes('Instagram') && '📸 '}
                                  {src.includes('WhatsApp') && '💬 '}
                                  {src.includes('Doğrudan') && '🌐 '}
                                  {src}
                                </span>
                                <span className="source-count">
                                  <strong>{count} kişi</strong> ({pct}%)
                                </span>
                              </div>
                              <div className="source-progress-bg">
                                <div className="source-progress-fill" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <p style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>
                        Henüz gerçek trafik kaynağı kaydedilmedi.
                      </p>
                    )}
                  </div>

                  <div className="device-breakdown-box">
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569' }}>
                      Cihaz Dağılımı:
                    </div>
                    <div className="device-chips-row">
                      {analytics?.deviceCounts && Object.entries(analytics.deviceCounts).length > 0 ? (
                        Object.entries(analytics.deviceCounts).map(([dev, c]) => (
                          <div key={dev} className="device-chip">
                            <span>{dev}</span>
                            <strong>{c} kişi</strong>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Veri bekleniyor...</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-head">
                    <MousePointerClick size={18} className="card-head-icon" />
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800 }}>Hangi Ürüne Tıklanmış?</h4>
                      <small style={{ color: '#64748b' }}>En çok incelenen malzemeler ve ilgi düzeyi</small>
                    </div>
                  </div>

                  <div className="top-products-list">
                    {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                      analytics.topProducts.map((p, idx) => {
                        const maxCount = analytics.topProducts[0]?.count || 1;
                        const pct = Math.round((p.count / maxCount) * 100);
                        return (
                          <div key={idx} className="top-prod-item">
                            <div className="top-prod-rank">#{idx + 1}</div>
                            <div className="top-prod-details">
                              <div className="top-prod-title-line">
                                <span className="top-prod-title">{p.title}</span>
                                <span className="top-prod-count">
                                  <strong>{p.count}</strong> kez tıklandı
                                </span>
                              </div>
                              <div className="source-progress-bg">
                                <div 
                                  className="source-progress-fill" 
                                  style={{ width: `${pct}%`, background: '#16a34a' }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>
                        Henüz ürün detay tıklaması kaydedilmedi.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ALT BÖLÜM: Canlı Ziyaretçi Hareket Günlüğü */}
              <div className="analytics-card" style={{ marginTop: 20 }}>
                <div className="analytics-card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Compass size={18} className="card-head-icon" />
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800 }}>Canlı Hareket & Davranış Günlüğü</h4>
                      <small style={{ color: '#64748b' }}>Kullanıcıların adım adım site içi hareketleri (Sayfayı uzatmaz, kendi kutusunda kayar)</small>
                    </div>
                  </div>

                  <div className="analytics-view-switch">
                    <button
                      className={`view-switch-btn ${analyticsViewMode === 'journeys' ? 'active' : ''}`}
                      onClick={() => setAnalyticsViewMode('journeys')}
                    >
                      👤 Kullanıcı Bazlı ({analytics?.visitorJourneys?.length || 0})
                    </button>
                    <button
                      className={`view-switch-btn ${analyticsViewMode === 'raw' ? 'active' : ''}`}
                      onClick={() => setAnalyticsViewMode('raw')}
                    >
                      📋 Ham Liste ({analytics?.recentEvents?.length || 0})
                    </button>
                  </div>
                </div>

                <div className="analytics-scroll-box">
                  {analyticsViewMode === 'journeys' ? (
                    analytics?.visitorJourneys && analytics.visitorJourneys.length > 0 ? (
                      <div className="visitor-journeys-list">
                        {analytics.visitorJourneys.map((v, idx) => {
                          const lastDate = new Date(v.lastSeen);
                          const timeStr = `${String(lastDate.getHours()).padStart(2, '0')}:${String(lastDate.getMinutes()).padStart(2, '0')}`;
                          const dateStr = `${String(lastDate.getDate()).padStart(2, '0')}.${String(lastDate.getMonth() + 1).padStart(2, '0')}`;

                          return (
                            <div key={v.visitorId || idx} className="visitor-journey-card">
                              <div className="v-card-top">
                                <div className="v-card-identity">
                                  <span className="v-avatar">👤</span>
                                  <div>
                                    <strong>Ziyaretçi #{idx + 1}</strong>
                                    <span className="v-id-code">({(v.visitorId || '').slice(-6)})</span>
                                  </div>
                                </div>
                                <div className="v-card-chips">
                                  <span className="device-tag">{v.device || 'Mobil 📱'}</span>
                                  <span className="source-tag">{v.source || 'Doğrudan'}</span>
                                  <span className="time-badge">{dateStr} {timeStr}</span>
                                  <span className="action-count-pill">{v.actions.length} Hareket</span>
                                </div>
                              </div>

                              <div className="v-card-steps">
                                {v.actions.map((act, aIdx) => {
                                  const actDate = new Date(act.timestamp);
                                  const actTime = `${String(actDate.getHours()).padStart(2, '0')}:${String(actDate.getMinutes()).padStart(2, '0')}`;
                                  return (
                                    <div key={aIdx} className="v-step-row">
                                      <span className="v-step-bullet"></span>
                                      <span className="v-step-time">{actTime}</span>
                                      <span className={`v-step-type badge-${act.type}`}>
                                        {act.action || (act.type === 'product_click' ? 'Ürün Detayı' : (act.type === 'page_view' ? 'Sayfa Gezintisi' : 'Aksiyon'))}
                                      </span>
                                      <span className="v-step-desc">
                                        {act.details || act.productTitle || act.path || 'Site gezildi'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="analytics-empty-state">
                        <p>Henüz gerçek ziyaretçi hareketi kaydedilmedi.</p>
                      </div>
                    )
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Zaman</th>
                            <th>Cihaz</th>
                            <th>Kaynak</th>
                            <th>İşlem</th>
                            <th>Detay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
                            analytics.recentEvents.map((ev, i) => {
                              const dateObj = new Date(ev.timestamp);
                              const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
                              return (
                                <tr key={ev.id || i}>
                                  <td style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{timeStr}</td>
                                  <td><span className="device-tag">{ev.device}</span></td>
                                  <td><span className="source-tag">{ev.source}</span></td>
                                  <td><span className={`action-badge action-badge-${ev.type}`}>{ev.action || ev.type}</span></td>
                                  <td>{ev.details || ev.productTitle || ev.path}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>Hareket yok.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MOBİL İÇİN SABİT ALT NAVİGASYON DOCK BARI (INSTAGRAM/WHATSAPP TARZI)
          ========================================================================= */}
      <div className="admin-mobile-bottom-dock">
        <button 
          className={`dock-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => { setActiveTab('products'); setShowForm(false); }}
        >
          <Package size={20} />
          <span>Ürünler</span>
        </button>

        <button 
          className={`dock-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => { setActiveTab('analytics'); setShowForm(false); loadAnalytics(); }}
        >
          <BarChart3 size={20} />
          <span>Ziyaretçi</span>
        </button>

        {/* ORTADAKİ BÜYÜK HIZLI FOTOĞRAF ÇEK / EKLE BUTONU */}
        <button className="dock-item-add" onClick={openAdd} title="Yeni Malzeme Ekle">
          <Plus size={24} />
        </button>

        <button 
          className={`dock-item ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => { setActiveTab('categories'); setShowForm(false); }}
        >
          <LayoutGrid size={20} />
          <span>Kategori</span>
        </button>

        <button 
          className="dock-item"
          onClick={() => setMobileDrawerOpen(true)}
        >
          <Menu size={20} />
          <span>Menü</span>
        </button>
      </div>

      {/* =========================================================================
          ALTA YAPIŞIK SİLME ONAY KUTUSU (BOTTOM CONFIRMATION TOAST)
          ========================================================================= */}
      {productToDelete && (
        <div className="admin-bottom-confirm-toast">
          <div className="confirm-toast-inner">
            <div className="confirm-toast-left">
              <div className="confirm-toast-badge">
                <Trash2 size={18} />
              </div>
              <div className="confirm-toast-text">
                <strong>"{productToDelete.title}" silinsin mi?</strong>
                <small>Bu işlem geri alınamaz ve malzeme katalogdan kaldırılır.</small>
              </div>
            </div>
            <div className="confirm-toast-actions">
              <button 
                className="btn btn-danger btn-sm" 
                onClick={confirmDeleteProduct}
                disabled={loading}
              >
                {loading ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => setProductToDelete(null)}
                disabled={loading}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUPABASE DB VE GİZLİ BİLGİLER İÇİN ŞİFRELİ DOĞRULAMA MODALI
          ========================================================================= */}
      {showSecurityVerifyModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSecurityVerifyModal(false)}>
          <div className="admin-modal-card security-verify-card" onClick={e => e.stopPropagation()}>
            <div className="security-verify-header">
              <div className="security-icon-circle">
                <Lock size={26} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginTop: 10, color: '#0f172a' }}>
                Yönetici Güvenlik Doğrulaması
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>
                Supabase bulut veritabanı bağlantı adresi ve gizli API anahtarı bilgilerine erişmek için lütfen yönetici şifrenizi girin.
              </p>
            </div>

            <form onSubmit={handleVerifySecurityPassword} style={{ padding: '0 20px 20px' }}>
              <div className="form-group-block">
                <label className="form-label-bold">Yönetici Şifreniz</label>
                <input
                  type="password"
                  className="form-input form-input-lg"
                  placeholder="••••••"
                  value={securityVerifyPassword}
                  onChange={e => setSecurityVerifyPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {securityError && (
                <div className="form-error" style={{ marginBottom: 14 }}>
                  ⚠️ {securityError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Doğrulanıyor...' : '🔒 Doğrula & Ayarları Aç'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowSecurityVerifyModal(false)}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          FACEBOOK PAYLAŞIM VE OTOMASYON MODALI
          ========================================================================= */}
      {showFacebookModal && facebookProduct && (
        <div className="admin-modal-overlay" onClick={() => setShowFacebookModal(false)}>
          <div className="admin-modal-card facebook-modal-window" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header facebook-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="facebook-brand-icon">f</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>
                    Facebook Sayfasında Otomatik Paylaş
                  </h3>
                  <small style={{ color: '#bfdbfe', fontSize: 12 }}>
                    Ürün bilgileriniz, Kayseri konumu ve WhatsApp sipariş linkiniz hazırlandı.
                  </small>
                </div>
              </div>
              <button 
                className="btn-modal-close" 
                style={{ color: '#fff' }}
                onClick={() => setShowFacebookModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="facebook-modal-body">
              <div className="facebook-product-preview-card">
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>
                  {facebookProduct.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                  Kategori: <strong>{facebookProduct.category}</strong> | Durum: <strong>{facebookProduct.condition}</strong>
                </div>
              </div>

              <label className="form-label-bold" style={{ marginTop: 14 }}>
                📋 Hazırlanan Gönderi / İlan Metni:
              </label>
              <textarea
                className="form-input form-textarea facebook-post-textarea"
                value={generateFacebookPostText(facebookProduct)}
                readOnly
                rows={9}
              />

              <div className="facebook-modal-actions">
                <button
                  type="button"
                  className="btn btn-facebook-primary"
                  onClick={handleLaunchFacebookSharer}
                >
                  <Share2 size={16} /> Facebook Paylaşım Penceresini Aç ↗
                </button>

                <button
                  type="button"
                  className={`btn ${copiedFbText ? 'btn-success' : 'btn-outline'}`}
                  onClick={handleCopyFbText}
                >
                  {copiedFbText ? <Check size={16} /> : <Copy size={16} />}
                  {copiedFbText ? 'Metin Kopyalandı!' : 'İlan Metnini Kopyala'}
                </button>
              </div>

              <div className="facebook-help-note">
                💡 <strong>Nasıl Çalışır?</strong> "Facebook Paylaşım Penceresini Aç" butonuna basarak doğrudan Facebook sayfanızda paylaşabilirsiniz. İsterseniz "Metni Kopyala" diyerek ilan metnini Facebook gönderinize veya Marketplace'e tek dokunuşla yapıştırabilirsiniz.
              </div>
            </div>

            <div className="admin-modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowFacebookModal(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ÜRÜN EKLEME / DÜZENLEME MODAL PENCERESİ (MOBİL İÇİN TAM UYUMLU, YAŞLI DOSTU)
          ========================================================================= */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="admin-modal-card product-modal-window" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>{editing ? 'Malzemeyi Düzenle' : 'Yeni Malzeme Ekle'}</h3>
                <small style={{ color: '#64748b', fontSize: 12 }}>
                  Kameradan çekip yükleyin, malzeme adını yazın ve kaydedin.
                </small>
              </div>
              <button 
                className="btn-modal-close" 
                onClick={() => { setShowForm(false); setEditing(null); }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-form-body">
              {/* 1. BÜYÜK FOTOĞRAF ÇEKME BUTONU (MOBİL İÇİN DİREKT KAMERA) */}
              <div className="photo-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  className="btn-camera-large-touch"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera size={26} />
                  <div>
                    <strong>{uploading ? 'Fotoğraf Yükleniyor...' : '📸 FOTOĞRAF ÇEK / GALERİDEN YÜKLE'}</strong>
                    <span>Telefondan tek dokunuşla kamera açılır veya galeriden seçilir</span>
                  </div>
                </button>

                {uploadError && (
                  <div className="upload-error-box">
                    ⚠️ {uploadError}
                  </div>
                )}

                {/* Yüklenen Fotoğrafların Önizlemesi */}
                {form.images && form.images.length > 0 && (
                  <div className="uploaded-photos-shelf">
                    {form.images.map((imgUrl, index) => (
                      <div key={index} className="uploaded-photo-card">
                        <img src={imgUrl} alt={`Fotoğraf ${index + 1}`} />
                        <span className="photo-tag-pill">{index === 0 ? 'Kapak' : `#${index + 1}`}</span>
                        <button
                          type="button"
                          className="btn-photo-delete"
                          onClick={() => handleRemoveImage(index)}
                          title="Sil"
                        >
                          ✕ Sil
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. MALZEME ADI (ZORUNLU) */}
              <div className="form-group-block">
                <label className="form-label-bold">
                  Malzeme Adı / Başlığı <span style={{ color: '#dc2626' }}>* (Zorunlu)</span>
                </label>
                <input
                  name="title"
                  className="form-input form-input-lg"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Örn: 100 Adet Teleskopik Direk, Harç Makinesi..."
                  required
                  autoFocus
                />
              </div>

              {/* 3. KATEGORİ SEÇİMİ VE YENİ KATEGORİ EKLEME */}
              <div className="form-group-block">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label-bold" style={{ margin: 0 }}>
                    Kategori <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-link-action"
                    onClick={() => setShowInlineCatInput(!showInlineCatInput)}
                  >
                    {showInlineCatInput ? '✕ Kapat' : '➕ Yeni Kategori Ekle'}
                  </button>
                </div>

                <select 
                  name="category" 
                  className="form-input form-input-lg" 
                  value={form.category} 
                  onChange={handleChange}
                >
                  {categoriesList.filter(c => c !== 'Tümü').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {showInlineCatInput && (
                  <div className="inline-add-cat-bar">
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      placeholder="Yeni kategori adı (Örn: Çiroz, Sac Pano, Kelepçe)..."
                      value={newCatInput}
                      onChange={e => setNewCatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddCategory(); } }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm"
                      onClick={handleQuickAddCategory}
                    >
                      Ekle & Seç
                    </button>
                  </div>
                )}
              </div>

              {/* 4. DURUM VE STOK SEÇİMİ */}
              <div className="form-two-cols">
                <div className="form-group-block">
                  <label className="form-label-bold">Durumu / Kondisyon</label>
                  <select name="condition" className="form-input" value={form.condition} onChange={handleChange}>
                    <option value="Temiz 2. El">Temiz 2. El</option>
                    <option value="Sıfır Ayarında">Sıfır Ayarında</option>
                    <option value="Bakımlı / Çalışır">Bakımlı / Çalışır</option>
                    <option value="1. ve 2. Kalite">1. ve 2. Kalite</option>
                    <option value="Çıkma / Hurda">Çıkma / Hurda</option>
                  </select>
                </div>

                <div className="form-group-block">
                  <label className="form-label-bold">Stok Durumu</label>
                  <select name="stock" className="form-input" value={form.stock} onChange={handleChange}>
                    <option value="Depoda Mevcut">Depoda Mevcut</option>
                    <option value="Adetli Stok">Adetli Stok</option>
                    <option value="Hemen Teslim">Hemen Teslim</option>
                    <option value="Deneyerek Teslim">Deneyerek Teslim</option>
                    <option value="Sınırlı Stok">Sınırlı Stok</option>
                  </select>
                </div>
              </div>

              {/* 5. AÇIKLAMA */}
              <div className="form-group-block">
                <label className="form-label-bold">
                  Açıklama <span style={{ color: '#16a34a', fontWeight: 600 }}>(İsteğe Bağlı — Boş Bırakabilirsiniz)</span>
                </label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="İsterseniz ölçüleri veya teslimat bilgilerini yazabilirsiniz..."
                  rows={3}
                />
              </div>

              {/* BÜYÜK KAYDET BUTONU */}
              <div className="modal-actions-bar">
                <button 
                  type="submit" 
                  className="btn-submit-large-green" 
                  disabled={loading || uploading}
                >
                  {loading ? 'Kaydediliyor...' : (editing ? '✓ Değişiklikleri Kaydet' : '✓ Ürünü Kaydet ve Yayınla')}
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
        </div>
      )}

      {/* ====== YENİ KATEGORİ EKLEME MODAL PENCERESİ ====== */}
      {showCategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 17, fontWeight: 900 }}>➕ Yeni Kategori Ekle</h3>
              <button className="btn-modal-close" onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCategoryFromTab} style={{ padding: 18 }}>
              <div className="form-group-block">
                <label className="form-label-bold">Kategori Adı</label>
                <input
                  type="text"
                  className="form-input form-input-lg"
                  placeholder="Örn: İnşaat Çirozu, Pano Kilidi, İskele Kelepçesi..."
                  value={catModalInput}
                  onChange={e => setCatModalInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Kategoriyi Kaydet
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCategoryModal(false)}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUPABASE AYARLARI VE ŞİFRE YÖNETİMİ MODAL PENCERESİ
          ========================================================================= */}
      {showSettingsModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="form-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={20} style={{ color: '#2563eb' }} />
                <h3 style={{ margin: 0 }}>Supabase Bulut DB ve Şifre Yönetimi</h3>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>

            <div style={{ marginTop: 14 }}>
              <form onSubmit={handleSaveSettings}>
                <div className="form-group">
                  <label>Project URL (Proje Bağlantı Adresi)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://xxxxxx.supabase.co"
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

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Supabase Bağlantısını Kaydet
                  </button>
                  {supabaseConfig.isConfigured && (
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={handleSeedSupabase}
                      title="Örnek ürünleri DB'ye aktar"
                    >
                      <Database size={14} /> Örnekleri DB'ye Yükle
                    </button>
                  )}
                </div>
              </form>

              {/* YÖNETİCİ ŞİFRESİNİ VERİTABANINA KAYDETME ALANI */}
              <div className="admin-pwd-change-box" style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <KeyRound size={17} style={{ color: '#16a34a' }} />
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>Admin Giriş Şifresini Değiştir & DB'ye Kaydet</strong>
                </div>
                <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 12 }}>
                  Şifreniz bulut veritabanına kaydedilir, dışarıdan kimse göremez.
                </p>

                <form onSubmit={handleUpdateAdminPassword} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="password"
                    className="form-input form-input-sm"
                    placeholder="Yeni yönetici şifresi..."
                    value={newAdminPwdInput}
                    onChange={e => setNewAdminPwdInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                    DB'ye Kaydet
                  </button>
                </form>

                {pwdChangeSuccess && (
                  <div style={{ color: '#16a34a', fontSize: 12.5, fontWeight: 700, marginTop: 8 }}>
                    ✓ {pwdChangeSuccess}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowSettingsModal(false)}>
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
