import { useState, useEffect } from 'react';
import { 
  Phone, MessageCircle, MapPin, Clock, ExternalLink, Navigation, 
  CheckCircle2, ChevronRight, Eye, ShieldCheck, Share2 
} from 'lucide-react';
import { siteConfig } from '../siteConfig';
import { categories, faqList } from '../data/products';
import { fetchProducts, parseImages } from '../services/productService';
import ProductDetailModal from '../components/ProductDetailModal';

function getVisitorCount() {
  try {
    let count = parseInt(localStorage.getItem('ikinciel_visitors') || '0', 10);
    const lastVisit = localStorage.getItem('ikinciel_last_visit');
    const today = new Date().toDateString();
    if (lastVisit !== today) {
      count++;
      localStorage.setItem('ikinciel_visitors', count.toString());
      localStorage.setItem('ikinciel_last_visit', today);
    }
    return count || 1;
  } catch (e) { return 1; }
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [search, setSearch] = useState('');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  useEffect(() => {
    fetchProducts().then(data => setProducts(data));
    getVisitorCount();
    const onStorage = () => fetchProducts().then(data => setProducts(data));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const filtered = products.filter(p => {
    const catMatch = selectedCategory === 'Tümü' || p.category === selectedCategory;
    const q = search.toLowerCase();
    const searchMatch = !q || p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    return catMatch && searchMatch;
  });

  const waLink = (title) => {
    const msg = title
      ? `Merhaba Yusuf Bey, "${title}" hakkında bilgi almak istiyorum.`
      : siteConfig.whatsappDefaultMessage;
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      {/* Modern, Estetik Navbar */}
      <header className="header-pro">
        <div className="container header-pro-inner">
          <a href="/" className="brand-logo-wrap">
            <img src="/logo.svg" alt="Ulusoy İnşaat Logo" className="brand-logo-img" />
            <div className="brand-logo-text">
              <span className="brand-title">Ulusoy İnşaat</span>
              <span className="brand-sub">Kayseri İkinci El • Yusuf Ulusoy</span>
            </div>
          </a>

          {/* Menü Linkleri */}
          <nav className="header-nav-links">
            <a href="#urunler" className="nav-link">Malzemeler</a>
            <a href="#konum" className="nav-link">Konum & Depo</a>
            <a href="#facebook" className="nav-link">Facebook</a>
            <a href="#sss" className="nav-link">S.S.S.</a>
          </nav>

          <div className="header-pro-actions">
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn-map"
              title="Google Haritalar'da Aç"
            >
              <MapPin size={14} /> Haritada Göster
            </a>
            <a href={`tel:${siteConfig.phoneRaw}`} className="nav-btn-call">
              <Phone size={14} /> {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Vitrin */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Ulusoy İnşaat • Yusuf Ulusoy Güvencesiyle
            </div>
            <h1>Kayseri İkinci El İnşaat Malzemeleri & Ekipman Alım-Satımı</h1>
            <p>
              Teleskopik demir direk, kalıp altı iskele, plywood, inşaat kerestesi, sac panolar, harç makineleri, klima ve şantiye ekipmanları. 
              Değerinde nakit alım, uygun fiyata satış ve yerinde teslimat.
            </p>

            <div className="hero-actions">
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero btn-hero-map"
              >
                <Navigation size={17} /> Haritada Göster (Ulusoy İnşaat)
              </a>
              <a
                href={`tel:${siteConfig.phoneRaw}`}
                className="btn-hero btn-hero-call"
              >
                <Phone size={17} /> {siteConfig.phoneDisplay}
              </a>
            </div>

            <div className="hero-info">
              <span><Clock size={14} /> {siteConfig.workingHours}</span>
              <span><MapPin size={14} /> {siteConfig.addressFull}</span>
              <span><CheckCircle2 size={14} /> Yusuf Ulusoy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ürünler Kataloğu */}
      <main className="products-section" id="urunler">
        <div className="container">
          <div className="section-head-wrap">
            <div>
              <div className="section-label">GÜNCEL STOKLAR</div>
              <h2 className="section-title">Depoda Hazır Malzemeler</h2>
            </div>
            <div className="section-note">
              Ürün fotoğraflarını ve detaylarını incelemek için karta tıklayın.
            </div>
          </div>

          <div className="filter-bar">
            <div className="filter-scroll">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Ürün veya malzeme ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="products-grid">
            {filtered.map(product => {
              const imgList = parseImages(product.images || product.image);
              const coverImg = imgList[0] || product.image || '';
              return (
                <article 
                  key={product.id} 
                  className="card card-interactive"
                  onClick={() => setActiveModalProduct(product)}
                >
                  <div className="card-img-wrap">
                    {coverImg ? (
                      <img src={coverImg} alt={product.title} className="card-img" loading="lazy" />
                    ) : (
                      <div className="no-image-placeholder">Görsel Yok</div>
                    )}
                    <span className="card-tag">{product.category}</span>
                    {imgList.length > 1 && (
                      <span className="card-multi-badge">
                        📷 {imgList.length} Fotoğraf
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{product.title}</h3>
                    <p className="card-desc">{product.description}</p>
                    <div className="card-meta">
                      <span className="stock">● {product.stock || 'Mevcut'}</span>
                      <span className="condition">{product.condition}</span>
                    </div>
                    <div className="card-click-hint">
                      Fotoğrafları & Detayları İncele →
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <p style={{ fontSize: 16, fontWeight: 700 }}>Aradığınız ürün bulunamadı.</p>
              <p style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
                Depomuza sürekli yeni malzemeler (direk, kereste, harç mikseri, klima vs.) gelmektedir. Bizi arayarak bilgi alabilirsiniz.
              </p>
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-primary" style={{ marginTop: 14 }}>
                <Phone size={14} /> Yusuf Ulusoy'u Ara: {siteConfig.phoneDisplay}
              </a>
            </div>
          )}
        </div>
      </main>

      {/* Konum & Harita Bölümü */}
      <section className="location-section" id="konum">
        <div className="container">
          <div className="location-card">
            <div className="location-details">
              <div className="section-label">Konum ve Adres</div>
              <h2 className="location-title">Ulusoy İnşaat — Yusuf Ulusoy</h2>
              <p className="location-desc">
                Depomuz Kayseri'de bulunmaktadır. Tüm ikinci el inşaat malzemelerini, harç makinelerini, klimaları ve şantiye ekipmanlarını yerinde görüp teslim alabilirsiniz.
              </p>

              <div className="location-meta-list">
                <div className="location-meta-item">
                  <MapPin size={18} className="loc-icon" />
                  <div>
                    <strong>İşletme / Adres</strong>
                    <span>{siteConfig.addressFull}</span>
                  </div>
                </div>
                <div className="location-meta-item">
                  <Phone size={18} className="loc-icon" />
                  <div>
                    <strong>Yetkili & İletişim</strong>
                    <span>{siteConfig.ownerName} ({siteConfig.phoneDisplay})</span>
                  </div>
                </div>
                <div className="location-meta-item">
                  <Clock size={18} className="loc-icon" />
                  <div>
                    <strong>Çalışma Saatleri</strong>
                    <span>{siteConfig.workingHours}</span>
                  </div>
                </div>
              </div>

              <div className="location-btn-group">
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                >
                  <Navigation size={16} /> Google Haritalar'da Aç (Navigasyon)
                </a>
                <a
                  href={`tel:${siteConfig.phoneRaw}`}
                  className="btn btn-outline btn-lg"
                >
                  <Phone size={16} /> Doğrudan Ara
                </a>
              </div>
            </div>

            <div className="location-map-wrap">
              <iframe
                title="Ulusoy İnşaat Konum Haritası"
                src={siteConfig.mapsEmbedUrl}
                className="location-iframe"
                loading="lazy"
                allowFullScreen
              />
              <div className="map-badge-overlay">
                <span>📍 Ulusoy İnşaat</span>
                <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer">Haritada Büyüt ↗</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facebook Showcase Bölümü (Kullanıcı Profil Bağlantısı) */}
      <section className="facebook-section" id="facebook">
        <div className="container">
          <div className="fb-profile-showcase">
            <div className="fb-profile-head">
              <div className="fb-badge-icon">f</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>Yusuf Ulusoy / Ulusoy İnşaat Facebook Profili</h3>
                  <span className="fb-verified-badge" title="Doğrulanmış Profil">✓</span>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  Güncel şantiye fotoğraflarımız, yeni gelen ikinci el inşaat malzemeleri ve günlük duyurularımız için profilimizi ziyaret edin.
                </p>
              </div>
              <a 
                href={siteConfig.facebookPageUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-fb-open"
              >
                Facebook'ta Görüntüle & Takip Et <ExternalLink size={15} />
              </a>
            </div>

            <div className="fb-features-row">
              <div className="fb-feat-item">
                <span className="fb-feat-icon">📸</span>
                <div>
                  <strong>Canlı Fotoğraflar</strong>
                  <span>Gelen teleskopik direk, iskele ve kereste yüklemeleri</span>
                </div>
              </div>
              <div className="fb-feat-item">
                <span className="fb-feat-icon">⚡</span>
                <div>
                  <strong>Hızlı İletişim</strong>
                  <span>Facebook Messenger veya telefonla anında cevap</span>
                </div>
              </div>
              <div className="fb-feat-item">
                <span className="fb-feat-icon">🏗️</span>
                <div>
                  <strong>Şantiye Alımları</strong>
                  <span>Kayseri ve çevresi nakit malzeme alım paylaşımları</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="faq-section" id="sss">
        <div className="container">
          <div className="section-label">Bilgilendirme</div>
          <h2 className="section-title">Sıkça Sorulan Sorular</h2>
          <div className="faq-list">
            {faqList.map((faq, i) => (
              <div key={i} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="iletisim">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <img src="/logo.svg" alt="Logo" style={{ width: 36, height: 36, borderRadius: 8 }} />
                <h4 style={{ margin: 0, fontSize: 16 }}>Ulusoy İnşaat — Yusuf Ulusoy</h4>
              </div>
              <p>{siteConfig.description}</p>
              <div style={{ marginTop: 14 }}>
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <MapPin size={14} /> Harita Konumu: Ulusoy İnşaat ↗
                </a>
              </div>
            </div>
            <div>
              <h4>İletişim & Konum</h4>
              <ul>
                <li><strong>Yetkili:</strong> {siteConfig.ownerName}</li>
                <li><strong>İşletme:</strong> {siteConfig.companyName}</li>
                <li><strong>Telefon:</strong> {siteConfig.phoneDisplay}</li>
                <li><strong>Şehir:</strong> Kayseri</li>
                <li><strong>Çalışma:</strong> {siteConfig.workingHours}</li>
              </ul>
            </div>
            <div>
              <h4>Hızlı Menü</h4>
              <ul>
                <li><a href="#urunler">Ürün Kataloğu</a></li>
                <li><a href="#konum">Konum & Yol Tarifi</a></li>
                <li><a href="#facebook">Facebook Profili</a></li>
                <li><a href="#sss">Sıkça Sorulan Sorular</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} Ulusoy İnşaat — Yusuf Ulusoy | Kayseri İkinci El İnşaat Malzemeleri
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fab-container">
        <a href={`tel:${siteConfig.phoneRaw}`} className="fab fab-phone" title="Telefonla Ara">
          <Phone size={22} />
        </a>
        <a href={waLink()} target="_blank" rel="noopener noreferrer" className="fab fab-whatsapp" title="WhatsApp Mesajı">
          <MessageCircle size={22} />
        </a>
      </div>

      {/* ÜRÜN DETAY & ÇOKLU FOTOĞRAF KAYDIRICI MODALI */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      )}
    </>
  );
}
