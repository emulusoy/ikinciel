import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Phone, MessageCircle, MapPin, ShieldCheck, 
  CheckCircle2, ChevronLeft, ChevronRight, Share2, Clock
} from 'lucide-react';
import { siteConfig } from '../siteConfig';
import { fetchProducts, parseImages } from '../services/productService';
import { trackPageView, trackProductClick, trackAction } from '../services/analyticsService';

const currentYear = new Date().getFullYear();

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetchProducts().then(data => {
      setProducts(data);
      const found = data.find(p => String(p.id) === String(id));
      setProduct(found || null);
      setLoading(false);

      if (found) {
        document.title = `${found.title} - ${siteConfig.titleSuffix}`;
        trackProductClick(found);
      } else {
        trackPageView(`/urun/${id}`);
      }
    });
  }, [id]);

  const images = product ? parseImages(product.images || product.image) : [];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePhoneClick = () => {
    if (product) {
      trackAction('telefon_arama', {
        productTitle: product.title,
        productId: product.id,
        text: `Ürün detayından arandı: ${product.title}`
      });
    }
  };

  const handleWhatsAppClick = () => {
    if (product) {
      trackAction('whatsapp_tiklama', {
        productTitle: product.title,
        productId: product.id,
        text: `Ürün detayından WhatsApp açıldı: ${product.title}`
      });
    }
  };

  const handleMapClick = () => {
    if (product) {
      trackAction('harita_navigasyon', {
        productTitle: product.title,
        productId: product.id,
        text: `Depo harita konumu açıldı`
      });
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: `${product.title} - ${siteConfig.companyName}`,
      text: `${product.title} - Kayseri İkinci El İnşaat Malzemesi`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  // İlgili / Diğer Ürünler
  const relatedProducts = products
    .filter(p => String(p.id) !== String(id))
    .sort((a, b) => {
      if (product && a.category === product.category && b.category !== product.category) return -1;
      if (product && b.category === product.category && a.category !== product.category) return 1;
      return 0;
    })
    .slice(0, 8);

  const waLink = product
    ? `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
        `Merhaba, Ulusoy İnşaat sitenizdeki "${product.title}" hakkında bilgi almak istiyorum.`
      )}`
    : `https://wa.me/${siteConfig.whatsappNumber}`;


  if (loading) {
    return (
      <div className="product-page-loading">
        <div className="loading-spinner"></div>
        <p>Ürün bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h2>Ürün Bulunamadı</h2>
          <p style={{ color: '#64748b', marginTop: 8, marginBottom: 20 }}>
            Aradığınız ürün depomuzda tükenmiş veya kaldırılmış olabilir.
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            <ArrowLeft size={16} /> Tüm Malzemeleri İncele
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page-wrapper">
      {/* ÜST SADE, TEMİZ VE MOBİLDE ŞIK NAVBAR */}
      <header className="detail-navbar">
        <div className="container detail-navbar-inner">
          <Link to="/" className="detail-nav-back" title="Tüm Malzemelere Dön">
            <ArrowLeft size={18} />
            <span className="back-label-desktop">Tüm Malzemeler</span>
            <span className="back-label-mobile">Geri</span>
          </Link>

          <Link to="/" className="detail-nav-brand">
            <img src="/logo.svg" alt="Logo" className="detail-brand-img" />
            <span className="detail-brand-name">Ulusoy İnşaat</span>
          </Link>

          <div className="detail-nav-actions">
            <button onClick={handleShare} className="detail-icon-btn" title="Paylaş">
              <Share2 size={16} />
              <span className="detail-share-hint">{copied ? 'Kopyalandı' : ''}</span>
            </button>
            <a 
              href={`tel:${siteConfig.phoneRaw}`} 
              onClick={handlePhoneClick}
              className="detail-call-chip"
              title="Doğrudan Ara"
            >
              <Phone size={14} />
              <span className="call-chip-text">Ara</span>
            </a>
          </div>
        </div>
      </header>

      {/* Ana Ürün İçeriği */}
      <main className="product-main-content">
        <div className="container">
          {/* Sade Breadcrumb */}
          <div className="detail-breadcrumb">
            <Link to="/">Malzeme Kataloğu</Link>
            <span className="bc-sep">/</span>
            <span className="bc-cat">{product.category}</span>
            <span className="bc-sep">/</span>
            <span className="bc-name">{product.title}</span>
          </div>

          <div className="product-view-layout">
            
            {/* SOL: Çoklu Fotoğraf Galerisi (SAĞ KARTLA EŞİT UZUNLUKTA) */}
            <div className="product-gallery-card">
              <div className="gallery-main-viewport">
                {images.length > 0 ? (
                  <img
                    src={images[activeImageIndex] || images[0]}
                    alt={`${product.title} - Görsel ${activeImageIndex + 1}`}
                    className="gallery-active-image"
                  />
                ) : (
                  <div className="gallery-no-img">Fotoğraf Eklenmemiş</div>
                )}

                {/* Çoklu Fotoğraf Navigasyon Okları */}
                {images.length > 1 && (
                  <>
                    <button 
                      className="gallery-nav-arrow arrow-left" 
                      onClick={handlePrevImage}
                      aria-label="Önceki Görsel"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      className="gallery-nav-arrow arrow-right" 
                      onClick={handleNextImage}
                      aria-label="Sonraki Görsel"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="gallery-counter-pill">
                      📷 {activeImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}

                <div className="gallery-cat-pill">
                  {product.category}
                </div>
              </div>

              {/* Küçük Resimler (Thumbnails) */}
              {images.length > 1 && (
                <div className="gallery-thumbnail-row">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      className={`thumb-item ${idx === activeImageIndex ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={imgUrl} alt={`Küçük resim ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Sol Galeri Alt Güvence Çubuğu (Kart Boyutlarını Eşitleyen Blok) */}
              <div className="gallery-trust-footer">
                <div className="gtf-item">
                  <ShieldCheck size={16} className="gtf-icon" />
                  <span>Depomuzda yerinde kontrol edip teslim alabilirsiniz.</span>
                </div>
                <div className="gtf-item">
                  <MapPin size={16} className="gtf-icon" />
                  <span>Kayseri ve çevre illere nakit alım & adrese sevkiyat.</span>
                </div>
              </div>
            </div>

            {/* SAĞ: Ürün Detayları ve İletişim Kartı */}
            <div className="product-info-panel">
              <div className="product-status-row">
                <span className="status-pill status-condition">
                  ✓ {product.condition || 'Temiz 2. El'}
                </span>
                <span className="status-pill status-stock">
                  ● {product.stock || 'Depoda Mevcut'}
                </span>
              </div>

              <h1 className="product-page-title">{product.title}</h1>

              <div className="trust-highlights">
                <div className="trust-item">
                  <ShieldCheck size={18} className="trust-icon" />
                  <div>
                    <strong>Kontrol Edilmiş Malzeme</strong>
                    <small>Depomuzda yerinde inceleme imkanı</small>
                  </div>
                </div>
                <div className="trust-item">
                  <CheckCircle2 size={18} className="trust-icon" />
                  <div>
                    <strong>Uygun Fiyat & Nakit Alım</strong>
                    <small>Toplu alımlarda ve satışta avantaj</small>
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              <div className="product-desc-box">
                <h2 className="desc-title">Ürün Açıklaması</h2>
                <div className="desc-text">
                  {product.description ? (
                    product.description.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  ) : (
                    <p>Bu ürün hakkında ayrıntılı ölçü, adet ve fiyat bilgisi almak için lütfen Yusuf Ulusoy ile doğrudan iletişime geçin.</p>
                  )}
                </div>
              </div>

              {/* Satıcı & Depo Bilgisi */}
              <div className="seller-box">
                <div className="seller-header">
                  <div className="seller-avatar">YU</div>
                  <div>
                    <h3 className="seller-name">{siteConfig.ownerName}</h3>
                    <p className="seller-role">{siteConfig.companyName} • Kayseri</p>
                  </div>
                </div>
                <div className="seller-meta">
                  <div className="meta-line">
                    <MapPin size={15} />
                    <span>{siteConfig.addressFull} ({siteConfig.addressDetail})</span>
                  </div>
                  <div className="meta-line">
                    <Clock size={15} />
                    <span>{siteConfig.workingHours}</span>
                  </div>
                </div>
              </div>

              {/* Büyük İletişim Aksiyon Butonları */}
              <div className="product-action-stack">
                <a
                  href={`tel:${siteConfig.phoneRaw}`}
                  onClick={handlePhoneClick}
                  className="btn-action-primary"
                >
                  <Phone size={19} />
                  <span>Yusuf Ulusoy'u Ara: {siteConfig.phoneDisplay}</span>
                </a>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="btn-action-wa"
                >
                  <MessageCircle size={19} />
                  <span>WhatsApp ile Fiyat & Bilgi Al</span>
                </a>

                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleMapClick}
                  className="btn-action-map"
                >
                  <MapPin size={18} />
                  <span>Depomuzu Haritada Gör & Yol Tarifi Al</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* DİĞER ÜRÜNLER / BENZER MALZEMELER BÖLÜMÜ */}
      <section className="related-products-section">
        <div className="container">
          <div className="related-head">
            <div>
              <div className="section-label">DİĞER GÜNCEL STOKLAR</div>
              <h2 className="related-title">Depomuzdaki Diğer Malzemeler</h2>
            </div>
            <Link to="/" className="btn-all-products">
              Tüm Kataloğu Gör →
            </Link>
          </div>

          <div className="related-grid">
            {relatedProducts.map(rel => {
              const relImages = parseImages(rel.images || rel.image);
              const relCover = relImages[0] || rel.image || '';
              return (
                <Link
                  key={rel.id}
                  to={`/urun/${rel.id}`}
                  className="related-card"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="related-card-img-wrap">
                    {relCover ? (
                      <img src={relCover} alt={rel.title} className="related-card-img" loading="lazy" />
                    ) : (
                      <div className="related-card-no-img">Görsel Yok</div>
                    )}
                    <span className="related-card-badge">{rel.category}</span>
                    {relImages.length > 1 && (
                      <span className="related-multi-badge">📷 {relImages.length}</span>
                    )}
                  </div>
                  <div className="related-card-body">
                    <h3 className="related-card-title">{rel.title}</h3>
                    <div className="related-card-meta">
                      <span className="stock-dot">● {rel.stock || 'Mevcut'}</span>
                      <span className="condition-tag">{rel.condition || '2. El'}</span>
                    </div>
                    <span className="related-link-text">İncele & Fotoğraflar →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            © {currentYear} {siteConfig.companyName} — {siteConfig.ownerName} | Kayseri İkinci El İnşaat Malzemeleri
          </div>
        </div>
      </footer>

      {/* Mobil Hızlı İletişim FAB Bar */}
      <div className="mobile-detail-sticky-bar">
        <a 
          href={`tel:${siteConfig.phoneRaw}`}
          onClick={handlePhoneClick}
          className="sticky-btn-call"
        >
          <Phone size={17} /> Ara ({siteConfig.phoneDisplay})
        </a>
        <a 
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="sticky-btn-wa"
        >
          <MessageCircle size={17} /> WhatsApp
        </a>
      </div>
    </div>
  );
}
