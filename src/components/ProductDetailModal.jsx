import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Phone, MessageCircle, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../siteConfig';

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : []);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Klavye okları ve ESC ile kontrol
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const waLink = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Merhaba Yusuf Bey, Ulusoy İnşaat sitenizdeki "${product.title}" hakkında bilgi ve fiyat almak istiyorum.`
  )}`;

  return (
    <div className="product-modal-backdrop" onClick={onClose}>
      <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Kapat butonu */}
        <button className="product-modal-close" onClick={onClose} title="Kapat (ESC)">
          <X size={20} />
        </button>

        <div className="product-modal-grid">
          {/* Sol Kolon: Çoklu Fotoğraf Kaydırıcı (Slider) */}
          <div className="product-gallery">
            <div className="main-image-wrap">
              {images.length > 0 ? (
                <img
                  src={images[currentIndex]}
                  alt={`${product.title} - Fotoğraf ${currentIndex + 1}`}
                  className="main-gallery-img"
                />
              ) : (
                <div className="no-image-placeholder">Fotoğraf Yok</div>
              )}

              {/* Ok butonları (1'den fazla fotoğraf varsa) */}
              {images.length > 1 && (
                <>
                  <button className="slider-arrow slider-prev" onClick={handlePrev} title="Önceki Fotoğraf">
                    <ChevronLeft size={22} />
                  </button>
                  <button className="slider-arrow slider-next" onClick={handleNext} title="Sonraki Fotoğraf">
                    <ChevronRight size={22} />
                  </button>
                  <div className="slider-counter">
                    {currentIndex + 1} / {images.length}
                  </div>
                </>
              )}

              <span className="gallery-badge">{product.category}</span>
            </div>

            {/* Küçük Önizleme Resimleri (Thumbnails) */}
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <img src={img} alt={`Küçük resim ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ Kolon: Ürün Detayları & İletişim */}
          <div className="product-details-pane">
            <div className="product-modal-tag-row">
              <span className="badge-condition">{product.condition || 'Temiz 2. El'}</span>
              <span className="badge-stock">● {product.stock || 'Depoda Mevcut'}</span>
            </div>

            <h2 className="product-modal-title">{product.title}</h2>

            <div className="product-modal-trust">
              <span><ShieldCheck size={16} /> Ulusoy İnşaat Garantisi</span>
              <span><CheckCircle2 size={16} /> Yerinde Kontrol & Test</span>
            </div>

            <div className="product-modal-desc-block">
              <h4>Ürün Açıklaması</h4>
              <p>{product.description || 'Detaylı bilgi için lütfen iletişime geçin.'}</p>
            </div>

            <div className="product-modal-meta-box">
              <div className="meta-row">
                <span className="meta-label">Yetkili Satıcı:</span>
                <span className="meta-value">{siteConfig.ownerName}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">İşletme:</span>
                <span className="meta-value">{siteConfig.companyName}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Konum / Şehir:</span>
                <span className="meta-value">{siteConfig.city} (Eski / Yeni Sanayi)</span>
              </div>
            </div>

            {/* Hızlı Aksiyon Butonları */}
            <div className="product-modal-actions">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modal-action btn-modal-wa"
              >
                <MessageCircle size={18} /> WhatsApp ile Fiyat & Bilgi Al
              </a>

              <a
                href={`tel:${siteConfig.phoneRaw}`}
                className="btn-modal-action btn-modal-call"
              >
                <Phone size={18} /> Yusuf Ulusoy'u Ara: {siteConfig.phoneDisplay}
              </a>

              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modal-action btn-modal-map"
              >
                <MapPin size={18} /> Depomuzda İncele (Google Haritalar)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
