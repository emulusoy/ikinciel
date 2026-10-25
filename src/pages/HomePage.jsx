import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, MessageCircle, MapPin, Clock, ExternalLink, Navigation, 
  CheckCircle2, Menu, X, Search, ArrowRight, Package, HelpCircle, ChevronRight
} from 'lucide-react';
import { siteConfig } from '../siteConfig';
import { categories, faqList } from '../data/products';
import { fetchProducts, parseImages } from '../services/productService';
import { trackPageView, trackAction } from '../services/analyticsService';

const currentYear = new Date().getFullYear();

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts().then(data => setProducts(data));
    trackPageView('/');

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
      ? `Merhaba, Ulusoy İnşaat sitenizdeki "${title}" hakkında bilgi almak istiyorum.`
      : siteConfig.whatsappDefaultMessage;
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handlePhoneClick = () => {
    trackAction('telefon_arama', { text: 'Ana sayfadan telefon arandı' });
  };

  const handleWaClick = () => {
    trackAction('whatsapp_tiklama', { text: 'Ana sayfadan WhatsApp tıklandı' });
  };

  const handleMapClick = () => {
    trackAction('harita_navigasyon', { text: 'Ana sayfadan harita tıklandı' });
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    trackAction('kategori_secildi', { text: `Kategori: ${cat}` });
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    if (val.length >= 3) {
      trackAction('site_ici_arama', { text: `Arama: ${val}` });
    }
  };

  return (
    <div className="site-wrapper">
      {/* SADE, DÜZGÜN VE MOBİL UYUMLU NAVBAR */}
      <header className="site-header">
        <div className="container header-container">
          {/* Logo & Başlık */}
          <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.svg" alt="Ulusoy İnşaat Logo" className="brand-icon" />
            <div className="brand-text">
              <span className="brand-name">Ulusoy İnşaat</span>
              <span className="brand-subname">Kayseri 2. El • Yusuf Ulusoy</span>
            </div>
          </Link>

          {/* Masaüstü Menü Linkleri */}
          <nav className="desktop-nav">
            <a href="#urunler" className="desktop-nav-link">Malzemeler</a>
            <a href="#konum" className="desktop-nav-link">Konum & Depo</a>
            <a href="#facebook" className="desktop-nav-link">Facebook</a>
            <a href="#sss" className="desktop-nav-link">S.S.S.</a>
          </nav>

          {/* Masaüstü Hızlı İletişim Butonları */}
          <div className="desktop-header-actions">
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleMapClick}
              className="btn-header-map"
              title="Google Haritalar"
            >
              <MapPin size={14} /> Harita
            </a>
            <a 
              href={`tel:${siteConfig.phoneRaw}`} 
              onClick={handlePhoneClick}
              className="btn-header-phone"
            >
              <Phone size={14} /> {siteConfig.phoneDisplay}
            </a>
          </div>

          {/* Mobilde Sağ Bölüm: Hızlı Arama Butonu + Menü Butonu */}
          <div className="mobile-header-right">
            <a 
              href={`tel:${siteConfig.phoneRaw}`} 
              onClick={handlePhoneClick}
              className="mobile-quick-call"
              title="Hemen Ara"
            >
              <Phone size={15} />
              <span>Ara</span>
            </a>
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Sade, Hızlı ve Şık Mobil Menü (Header dışına alındı, z-index ve backdrop-filter taşması çözüldü) */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-pane" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-top">
              <div className="mobile-menu-brand-title">
                <strong>Ulusoy İnşaat</strong>
                <span>Yusuf Ulusoy • Kayseri</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Menüyü Kapat"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-menu-items">
              <a href="#urunler" onClick={() => setMobileMenuOpen(false)}>
                <Package size={17} /> <span>Depodaki Malzemeler & Stoklar</span>
              </a>
              <a href="#konum" onClick={() => setMobileMenuOpen(false)}>
                <MapPin size={17} /> <span>Konum & Yol Tarifi (Kayseri)</span>
              </a>
              <a href="#facebook" onClick={() => setMobileMenuOpen(false)}>
                <ExternalLink size={17} /> <span>Facebook Profili</span>
              </a>
              <a href="#sss" onClick={() => setMobileMenuOpen(false)}>
                <HelpCircle size={17} /> <span>Sıkça Sorulan Sorular</span>
              </a>
            </nav>

            <div className="mobile-menu-buttons">
              <a 
                href={`tel:${siteConfig.phoneRaw}`}
                onClick={() => { handlePhoneClick(); setMobileMenuOpen(false); }}
                className="btn-m-call"
              >
                <Phone size={15} /> 0507 320 43 63 (Ara)
              </a>
              <a 
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { handleWaClick(); setMobileMenuOpen(false); }}
                className="btn-m-wa"
              >
                <MessageCircle size={15} /> WhatsApp Fiyat Hattı
              </a>
            </div>
          </div>
        </div>
      )}


      {/* SADE, ŞIK VE GÜVEN VEREN HERO (İLK HOŞGELDİNİZ) BÖLÜMÜ */}
      <section className="hero-clean">
        <div className="container hero-container">
          <div className="hero-main-card">
            <div className="hero-badge-tag">
              <span className="badge-bullet"></span>
              Kayseri & Çevresi • Yusuf Ulusoy Güvencesiyle
            </div>

            <h1 className="hero-main-heading">
              İkinci El İnşaat Malzemeleri & Ekipman Alım-Satımı
            </h1>

            <p className="hero-main-desc">
              Teleskopik demir direk, kalıp altı iskele, ithal & yerli plywood, inşaat kerestesi, harç karma makinesi (betoniyer), şantiye klimaları ve ekipmanları. 
              <strong> Değerinde nakit alım, uygun fiyata satış ve şantiyenize teslimat.</strong>
            </p>

            {/* Şık, Modern ve Hem Webde Hem Mobilde Kusursuz Buton Düzeni */}
            <div className="hero-buttons-group">
              <a
                href={`tel:${siteConfig.phoneRaw}`}
                onClick={handlePhoneClick}
                className="btn-hero-call"
                title="Yusuf Ulusoy'u Ara"
              >
                <Phone size={17} />
                <span>{siteConfig.phoneDisplay} (Hemen Ara)</span>
              </a>

              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWaClick}
                className="btn-hero-wa"
                title="WhatsApp ile Bilgi Al"
              >
                <MessageCircle size={17} />
                <span>WhatsApp ile Fiyat Al</span>
              </a>

              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMapClick}
                className="btn-hero-map"
                title="Google Haritalar"
              >
                <Navigation size={15} />
                <span>Depoyu Haritada Gör ↗</span>
              </a>
            </div>


            {/* Güven ve Kolaylık Maddeleri */}
            <div className="hero-features-bar">
              <div className="feat-chip">
                <CheckCircle2 size={16} className="feat-icon" />
                <span>Değerinde Nakit Alım</span>
              </div>
              <div className="feat-chip">
                <CheckCircle2 size={16} className="feat-icon" />
                <span>Yerinde Kontrol & Teslimat</span>
              </div>
              <div className="feat-chip">
                <Clock size={16} className="feat-icon" />
                <span>Haftanın 7 Günü Açık</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÜRÜNLER & GÜNCEL STOKLAR BÖLÜMÜ */}
      <main className="catalog-section" id="urunler">
        <div className="container">
          <div className="catalog-header">
            <div>
              <span className="catalog-label">GÜNCEL STOKLAR</span>
              <h2 className="catalog-title">Depoda Hazır Malzemeler</h2>
            </div>
            <p className="catalog-hint">
              Malzemenin fotoğraflarını ve detaylarını görmek için karta tıklayın.
            </p>
          </div>

          {/* Arama ve Kategori Filtre Çubuğu */}
          <div className="filter-wrapper">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="catalog-search-input"
                placeholder="Malzeme, direk, iskele, klima ara..."
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
              />
              {search && (
                <button 
                  className="search-clear-btn" 
                  onClick={() => setSearch('')}
                  title="Aramayı Temizle"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Yatay Kaydırılabilir Kategoriler */}
            <div className="category-scroll-strip">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ürünler Grid (MODAL YERİNE DOĞRUDAN SAYFAYA GİDER) */}
          <div className="products-card-grid">
            {filtered.map(product => {
              const imgList = parseImages(product.images || product.image);
              const coverImg = imgList[0] || product.image || '';
              return (
                <Link 
                  key={product.id} 
                  to={`/urun/${product.id}`}
                  className="product-simple-card"
                  title={`${product.title} detaylarını gör`}
                >
                  <div className="card-media">
                    {coverImg ? (
                      <img 
                        src={coverImg} 
                        alt={product.title} 
                        className="card-image" 
                        loading="lazy" 
                      />
                    ) : (
                      <div className="card-no-photo">Görsel Yok</div>
                    )}
                    <span className="card-badge-category">{product.category}</span>
                    {imgList.length > 1 && (
                      <span className="card-badge-count">
                        📷 {imgList.length} Fotoğraf
                      </span>
                    )}
                  </div>

                  <div className="card-content">
                    <h3 className="card-item-title">{product.title}</h3>
                    <p className="card-item-desc">{product.description}</p>
                    
                    <div className="card-status-line">
                      <span className="status-stock-tag">● {product.stock || 'Mevcut'}</span>
                      <span className="status-cond-tag">{product.condition || '2. El'}</span>
                    </div>

                    <div className="card-action-bar">
                      <span className="card-cta-text">
                        İncele <ArrowRight size={14} className="card-cta-arrow" />
                      </span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          trackAction('whatsapp_tiklama', {
                            productTitle: product.title,
                            productId: product.id,
                            text: `Karttan WhatsApp tıklandı: ${product.title}`
                          });
                          window.open(waLink(product.title), '_blank', 'noopener,noreferrer');
                        }}
                        className="card-quick-wa-btn"
                        title="WhatsApp ile Bu Malzemeyi Sor"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>

          {/* Boş Arama Durumu */}
          {filtered.length === 0 && (
            <div className="catalog-empty-card">
              <h3>Aradığınız kriterde malzeme bulunamadı.</h3>
              <p>
                Depomuza her gün yeni teleskopik direk, iskele, kereste, plywood ve şantiye ekipmanı gelmektedir.
              </p>
              <a 
                href={`tel:${siteConfig.phoneRaw}`} 
                onClick={handlePhoneClick}
                className="btn-hero-primary"
                style={{ marginTop: 14 }}
              >
                <Phone size={16} /> Yusuf Ulusoy'u Ara: {siteConfig.phoneDisplay}
              </a>
            </div>
          )}
        </div>
      </main>

      {/* KONUM & DEPO BÖLÜMÜ */}
      <section className="depot-section" id="konum">
        <div className="container">
          <div className="depot-card-box">
            <div className="depot-info-col">
              <span className="catalog-label">KONUM VE ADRES</span>
              <h2 className="depot-heading">Ulusoy İnşaat — Yusuf Ulusoy</h2>
              <p className="depot-lead">
                Depomuz Kayseri merkezdedir. Tüm malzemeleri şahsen gelip yerinde görebilir, adet ve ölçü kontrolünü yaparak teslim alabilirsiniz.
              </p>

              <div className="depot-contact-list">
                <div className="depot-contact-row">
                  <MapPin size={20} className="depot-icon" />
                  <div>
                    <strong>Depo Adresi:</strong>
                    <span>{siteConfig.addressFull} ({siteConfig.addressDetail})</span>
                  </div>
                </div>

                <div className="depot-contact-row">
                  <Phone size={20} className="depot-icon" />
                  <div>
                    <strong>Yetkili Kişi:</strong>
                    <span>{siteConfig.ownerName} — {siteConfig.phoneDisplay}</span>
                  </div>
                </div>

                <div className="depot-contact-row">
                  <Clock size={20} className="depot-icon" />
                  <div>
                    <strong>Çalışma Saatleri:</strong>
                    <span>{siteConfig.workingHours}</span>
                  </div>
                </div>
              </div>

              <div className="depot-buttons-row">
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleMapClick}
                  className="btn-depot-nav"
                >
                  <Navigation size={17} /> Haritada Yol Tarifi Al
                </a>
                <a
                  href={`tel:${siteConfig.phoneRaw}`}
                  onClick={handlePhoneClick}
                  className="btn-depot-call"
                >
                  <Phone size={17} /> Telefonla Bilgi Al
                </a>
              </div>
            </div>

            <div className="depot-map-col">
              <iframe
                title="Ulusoy İnşaat Kayseri Haritası"
                src={siteConfig.mapsEmbedUrl}
                className="depot-iframe"
                loading="lazy"
                allowFullScreen
              />
              <div className="map-tap-hint">
                <span>📍 Ulusoy İnşaat Kayseri</span>
                <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer">Büyük Harita ↗</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FACEBOOK SHOWCASE BÖLÜMÜ */}
      <section className="fb-section" id="facebook">
        <div className="container">
          <div className="fb-box">
            <div className="fb-box-head">
              <div className="fb-badge-f">f</div>
              <div>
                <div className="fb-title-line">
                  <h3>Yusuf Ulusoy / Ulusoy İnşaat Facebook Profili</h3>
                  <span className="fb-check">✓ Doğrulanmış</span>
                </div>
                <p className="fb-sub-text">
                  Şantiyelerden yeni gelen yüklemeler, canlı fotoğraflar ve günlük malzeme duyuruları için profilimizi ziyaret edin.
                </p>
              </div>
              <a 
                href={siteConfig.facebookPageUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-fb-link"
              >
                Facebook'ta Gör <ExternalLink size={14} />
              </a>
            </div>

            <div className="fb-features-grid">
              <div className="fb-feat-card">
                <span className="fb-feat-emoji">📸</span>
                <div>
                  <strong>Canlı Fotoğraflar</strong>
                  <small>Gelen direk, iskele ve kereste yüklemeleri</small>
                </div>
              </div>
              <div className="fb-feat-card">
                <span className="fb-feat-emoji">⚡</span>
                <div>
                  <strong>Hızlı Cevap</strong>
                  <small>Messenger veya telefon ile anında iletişim</small>
                </div>
              </div>
              <div className="fb-feat-card">
                <span className="fb-feat-emoji">🏗️</span>
                <div>
                  <strong>Nakit Malzeme Alımı</strong>
                  <small>Kayseri şantiyelerinden toplu alım paylaşımları</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="faq-block" id="sss">
        <div className="container">
          <div className="faq-head">
            <span className="catalog-label">BİLGİLENDİRME</span>
            <h2 className="catalog-title">Sıkça Sorulan Sorular</h2>
          </div>
          <div className="faq-cards-list">
            {faqList.map((faq, idx) => (
              <div key={idx} className="faq-card">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-cols">
            <div className="footer-col-main">
              <div className="footer-logo-line">
                <img src="/logo.svg" alt="Logo" className="footer-logo-img" />
                <strong>Ulusoy İnşaat — Yusuf Ulusoy</strong>
              </div>
              <p className="footer-desc-text">{siteConfig.description}</p>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMapClick}
                className="footer-map-link"
              >
                <MapPin size={14} /> Harita Konumu: Ulusoy İnşaat ↗
              </a>
            </div>

            <div className="footer-col-nav">
              <h4>İletişim & Konum</h4>
              <ul>
                <li><strong>Yetkili:</strong> {siteConfig.ownerName}</li>
                <li><strong>İşletme:</strong> {siteConfig.companyName}</li>
                <li><strong>Telefon:</strong> {siteConfig.phoneDisplay}</li>
                <li><strong>Şehir:</strong> Kayseri</li>
                <li><strong>Çalışma:</strong> {siteConfig.workingHours}</li>
              </ul>
            </div>

            <div className="footer-col-nav">
              <h4>Hızlı Menü</h4>
              <ul>
                <li><a href="#urunler">Ürün Kataloğu</a></li>
                <li><a href="#konum">Konum & Yol Tarifi</a></li>
                <li><a href="#facebook">Facebook Profili</a></li>
                <li><a href="#sss">Sıkça Sorulan Sorular</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-copyright">
            © {currentYear} {siteConfig.companyName} — {siteConfig.ownerName} | Kayseri İkinci El İnşaat Malzemeleri
          </div>
        </div>
      </footer>

      {/* MOBİL FLOATING ACTION BUTONLARI (TELEFON & WHATSAPP) */}
      <div className="fab-action-dock">
        <a 
          href={`tel:${siteConfig.phoneRaw}`} 
          onClick={handlePhoneClick}
          className="fab-dock-btn fab-btn-phone" 
          title="Yusuf Ulusoy'u Ara"
        >
          <Phone size={20} />
          <span className="fab-label">Hemen Ara</span>
        </a>
        <a 
          href={waLink()} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={handleWaClick}
          className="fab-dock-btn fab-btn-whatsapp" 
          title="WhatsApp'tan Yaz"
        >
          <MessageCircle size={20} />
          <span className="fab-label">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
