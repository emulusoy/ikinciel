import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Eye, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  Search, 
  Share2,
  ExternalLink,
  Users
} from 'lucide-react';
import { siteConfig } from './siteConfig';
import { initialProducts, categories, faqList } from './data/products';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [visitorCount, setVisitorCount] = useState(482);
  const [activeUsers, setActiveUsers] = useState(14);
  const [searchQuery, setSearchQuery] = useState("");

  // Ziyaretçi Sayacı (Gerçek zamanlı ve localStorage destekli)
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem('kayseri_site_visitors');
      if (storedCount) {
        const nextCount = parseInt(storedCount, 10) + 1;
        setVisitorCount(nextCount);
        localStorage.setItem('kayseri_site_visitors', nextCount.toString());
      } else {
        const initial = 482;
        setVisitorCount(initial);
        localStorage.setItem('kayseri_site_visitors', initial.toString());
      }
    } catch (e) {
      console.error(e);
    }

    // Aktif kullanıcı dalgalanması (gerçekçi sosyal kanıt)
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const val = prev + delta;
        return val < 9 ? 11 : val > 24 ? 18 : val;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Filtreleme
  const filteredProducts = initialProducts.filter(item => {
    const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // WhatsApp Link Oluşturucu
  const getWhatsappLink = (productTitle = null) => {
    const message = productTitle 
      ? `Merhaba, sitenizdeki "${productTitle}" malzemesi hakkında fiyat ve detay öğrenmek istiyorum.`
      : siteConfig.whatsappDefaultMessage;
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="site-wrapper">
      {/* 1. ÜST BİLGİ & CANLI SAYAÇ BARI */}
      <div className="top-notice-bar">
        <div className="container notice-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="counter-badge">
              <span className="pulse-dot"></span>
              Şu An Sitede {activeUsers} Kişi İnceleme Yapıyor
            </span>
            <span>📍 Kayseri & Çevre İllere Aynı Gün Sevkiyat</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#cbd5e1' }}>
              <Eye size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Bugün Toplam <strong>{visitorCount}</strong> Ziyaretçi
            </span>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
              📞 7/24 Açık Telefon
            </span>
          </div>
        </div>
      </div>

      {/* 2. ANA HEADER */}
      <header className="main-header">
        <div className="container header-inner">
          <a href="#" className="brand-logo-area">
            <div className="brand-icon-box">
              🏗️
            </div>
            <div>
              <div className="brand-title">KAYSERİ İKİNCİ EL</div>
              <div className="brand-subtitle">İNŞAAT MALZEMELERİ PAZARI</div>
            </div>
          </a>

          {/* Masaüstü Hızlı İletişim Butonları */}
          <div className="header-actions">
            <a 
              href={`tel:${siteConfig.phoneRaw}`} 
              className="btn-header-call"
              title="Doğrudan Ara"
            >
              <Phone size={22} />
              <span>{siteConfig.phoneDisplay}</span>
            </a>
            <a 
              href={getWhatsappLink()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-header-whatsapp"
              title="WhatsApp İle Yaz"
            >
              <MessageCircle size={22} />
              <span>WhatsApp'tan Yaz</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. HERO (GİRİŞ) BÖLÜMÜ - GOOGLE SEO ODAKLI */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-kayseri-badge">
              🏆 Kayseri'nin 1 Numaralı 2. El İnşaat Malzemesi Tedarikçisi
            </div>
            
            <h1 className="hero-heading">
              Kayseri İkinci El <span>İnşaat Malzemesi</span> Alım & Satımı
            </h1>

            <p className="hero-description">
              Teleskopik demir direk, kalıp altı iskele, plywood, inşaat kerestesi, sac kalıp panosu ve şantiye makineleri. 
              <strong> Değerinde nakit alım, temiz ve bakımlı malzeme, yerinde anında teslim!</strong>
            </p>

            {/* BÜYÜK VE NET ARAMA BUTONLARI (30-80 YAŞ İÇİN RAHAT DOKUNUŞ) */}
            <div className="hero-cta-group">
              <a 
                href={`tel:${siteConfig.phoneRaw}`} 
                className="btn-huge-call"
              >
                <Phone size={28} />
                <span>HEMEN ARA: {siteConfig.phoneDisplay}</span>
              </a>

              <a 
                href={getWhatsappLink()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-huge-whatsapp"
              >
                <MessageCircle size={28} />
                <span>WHATSAPP İLE FİYAT AL</span>
              </a>
            </div>

            {/* Güven ve Hizmet Noktaları */}
            <div className="trust-points-row">
              <div className="trust-item">
                <CheckCircle2 size={20} className="trust-item-icon" />
                <span>Nakit Ödeme ile Yerinde Malzeme Alımı</span>
              </div>
              <div className="trust-item">
                <Truck size={20} className="trust-item-icon" />
                <span>Kayseri İçi Kendi Aracımızla Teslim</span>
              </div>
              <div className="trust-item">
                <ShieldCheck size={20} className="trust-item-icon" />
                <span>Görüp, Deneyip, Sayarak Teslim Alma</span>
              </div>
            </div>
          </div>

          {/* Hero Canlı Sayaç & Bilgi Kartı */}
          <div className="hero-live-card">
            <div className="live-card-header">
              <div className="live-card-title">
                <TrendingUp size={22} color="#fbbf24" />
                <span>GÜNCEL ŞANTİYE & MALZEME TALEBİ</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-number">{visitorCount}</span>
                <span className="stat-label">Bugün Sitede İnceleyen</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{activeUsers} Kişi</span>
                <span className="stat-label">Şu An Canlı Bakan</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">10.000+</span>
                <span className="stat-label">Hazır Teleskopik Direk</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">%100</span>
                <span className="stat-label">Usta Memnuniyeti</span>
              </div>
            </div>

            <div className="live-card-alert">
              <Users size={20} />
              <span>Kayseri ve çevre şantiyelerden her gün yeni 2. el malzeme girişimiz olmaktadır.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KATEGORİ SEÇİMİ VE ARAMA */}
      <section className="category-filter-bar" id="urunler">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="category-pill-list">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Hızlı Arama Kutusu */}
            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto', maxWidth: '360px' }}>
              <input
                type="text"
                placeholder="Malzeme ara (Örn: Direk, Plywood)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  borderRadius: '8px',
                  border: '2px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none',
                  fontWeight: '600'
                }}
              />
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. MALZEMELER VİTRİNİ */}
      <main className="products-section">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Depoda Hazır Malzemeler</span>
            <h2 className="section-title">Kayseri İkinci El İnşaat Malzemesi Çeşitleri</h2>
            <p className="section-subtitle">
              Aşağıdaki tüm ürünler Kayseri depomuzda fiziksel olarak mevcuttur. Dilediğiniz zaman gelip yerinde görebilir, sayarak teslim alabilirsiniz.
            </p>
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img 
                    src={product.image} 
                    alt={`Kayseri ${product.title}`} 
                    className="product-image"
                    loading="lazy"
                  />
                  <span className="product-badge">{product.badge}</span>
                  <div className="product-views-tag">
                    <Eye size={14} />
                    <span>{product.viewsCount} kişi baktı</span>
                  </div>
                </div>

                <div className="product-body">
                  <div className="product-category-row">
                    <span className="product-category">{product.category}</span>
                    <span className="product-condition">{product.condition}</span>
                  </div>

                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-specs">
                    <div className="spec-line">
                      <span className="spec-label">Ölçü/Tip:</span>
                      <span className="spec-value">{product.size}</span>
                    </div>
                    <div className="spec-line">
                      <span className="spec-label">Stok:</span>
                      <span className="spec-value" style={{ color: '#16a34a' }}>● {product.stock}</span>
                    </div>
                  </div>

                  {/* Ürün Butonları (Büyük & Kolay Tıklanabilir) */}
                  <div className="product-card-actions">
                    <a 
                      href={`tel:${siteConfig.phoneRaw}`} 
                      className="btn-card-call"
                      title="Telefonla Bilgi Al"
                    >
                      <Phone size={18} />
                      <span>HEMEN ARA</span>
                    </a>

                    <a 
                      href={getWhatsappLink(product.title)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-card-whatsapp"
                      title="WhatsApp ile Fiyat Sor"
                    >
                      <MessageCircle size={18} />
                      <span>FİYAT SOR</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '12px' }}>
              <h3>Aradığınız kriterde malzeme bulunamadı.</h3>
              <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
                Depomuzdaki diğer malzemeler için lütfen bizi doğrudan arayın veya WhatsApp'tan yazın.
              </p>
              <a 
                href={`tel:${siteConfig.phoneRaw}`} 
                className="btn-huge-call" 
                style={{ marginTop: '1.5rem', display: 'inline-flex' }}
              >
                <Phone size={22} />
                <span>0532 000 00 00 Nolu Telefonu Arayın</span>
              </a>
            </div>
          )}
        </div>
      </main>

      {/* 6. FACEBOOK GÜNCEL PAYLAŞIMLAR & ANLIK VİTRİN ALANI */}
      <section className="facebook-section" id="facebook">
        <div className="container">
          <div className="facebook-card-wrapper">
            <div className="fb-header-row">
              <div className="fb-brand-title">
                <div className="fb-logo-circle">f</div>
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#1e293b' }}>Facebook Sayfamızdaki Güncel Malzemeler</h3>
                  <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 600 }}>
                    Yeni gelen 2. el şantiye malzemelerini anlık olarak Facebook'ta paylaşıyoruz.
                  </p>
                </div>
              </div>

              <a 
                href={siteConfig.facebookPageUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="fb-btn-link"
              >
                <Share2 size={20} />
                <span>Facebook'ta Takip Et & İncele</span>
                <ExternalLink size={18} />
              </a>
            </div>

            {/* Facebook Son Paylaşılan Gönderiler Vitrini */}
            <div className="fb-posts-grid">
              <div className="fb-post-item">
                <div className="fb-post-header">
                  <div className="fb-avatar">🏗️</div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>Kayseri 2. El İnşaat Malzemeleri</div>
                    <div className="fb-post-time">Bugün paylaşıldı • Kayseri</div>
                  </div>
                </div>
                <div className="fb-post-text">
                  📢 YENİ GELDİ! Talas şantiyesinden temiz 1.500 adet 3.50m teleskopik demir direk depomuza inmiştir. Mekanizmaları yağlı ve kullanıma hazır. Yerinde görmek için arayınız!
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80" 
                  alt="Facebook son paylaşılan direkler" 
                  className="fb-post-image"
                />
                <div className="fb-post-footer">
                  <span>👍 84 Beğeni</span>
                  <a href={siteConfig.facebookPageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', fontWeight: 800 }}>
                    Facebook'ta Gör →
                  </a>
                </div>
              </div>

              <div className="fb-post-item">
                <div className="fb-post-header">
                  <div className="fb-avatar">🏗️</div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>Kayseri 2. El İnşaat Malzemeleri</div>
                    <div className="fb-post-time">Dün paylaşıldı • Kayseri</div>
                  </div>
                </div>
                <div className="fb-post-text">
                  🔥 SICAK FIRSAT: 18mm Huş 2. el plywood panolar. Beton artıkları temizlenmiş, sağlam ve gönyeli. Toplu alımlarda kamyon bazlı nakliye kolaylığı sağlıyoruz.
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80" 
                  alt="Facebook plywood paylaşımı" 
                  className="fb-post-image"
                />
                <div className="fb-post-footer">
                  <span>👍 62 Beğeni</span>
                  <a href={siteConfig.facebookPageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', fontWeight: 800 }}>
                    Facebook'ta Gör →
                  </a>
                </div>
              </div>

              <div className="fb-post-item">
                <div className="fb-post-header">
                  <div className="fb-avatar">🏗️</div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>Kayseri 2. El İnşaat Malzemeleri</div>
                    <div className="fb-post-time">3 gün önce • Kayseri</div>
                  </div>
                </div>
                <div className="fb-post-text">
                  🚛 NAKİT ALIM: Şantiyenizde işi biten direk, iskele, çiroz, pano ve keresteleriniz adresinizde yerinde incelenip nakit alınır. Bir telefonla gelip bakalım.
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80" 
                  alt="Facebook malzeme alımı" 
                  className="fb-post-image"
                />
                <div className="fb-post-footer">
                  <span>👍 115 Beğeni</span>
                  <a href={siteConfig.facebookPageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', fontWeight: 800 }}>
                    Facebook'ta Gör →
                  </a>
                </div>
              </div>
            </div>

            {/* Facebook Resmi Sayfa Iframe Gömülü Alanı (Facebook linki girilince aktifleşir) */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <iframe 
                title="Facebook Sayfası"
                src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(siteConfig.facebookPageUrl)}&tabs=timeline&width=500&height=350&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                width="100%" 
                height="350" 
                style={{ border: 'none', overflow: 'hidden', maxWidth: '650px', margin: '0 auto', display: 'block', borderRadius: '12px' }} 
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SIKÇA SORULAN SORULAR & KAYSERİ YEREL SEO ALANI */}
      <section className="faq-seo-section" id="sss">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Bilgilendirme</span>
            <h2 className="section-title">Sıkça Sorulan Sorular</h2>
            <p className="section-subtitle">Kayseri ikinci el inşaat malzemesi alım ve satımı hakkında merak edilenler</p>
          </div>

          <div className="faq-list">
            {faqList.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">❓ {faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* Google Arama Motoru İçin Kayseri Semt ve Anahtar Kelime Alanı */}
          <div className="local-seo-box">
            <h3 className="local-seo-title">📍 Kayseri ve Tüm İlçelerinde Hizmetinizdeyiz</h3>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.7' }}>
              <strong>Kayseri ikinci el inşaat malzemesi</strong> arayan müteahhitler, kalıp ustaları ve bireysel müşterilerimiz için 
              Eski Sanayi, Yeni Sanayi, Kocasinan, Melikgazi, Talas, Hacılar, İncesu, Develi, Yahyalı, Bünyan, Pınarbaşı ve Organize Sanayi Bölgeleri başta olmak üzere 
              tüm Kayseri ve çevre illere (Sivas, Yozgat, Nevşehir, Niğde) hızlı teslimat ve yerinde nakit alım imkanı sunuyoruz.
            </p>

            <div className="local-keywords-tags">
              <span className="seo-badge">Kayseri ikinci el teleskopik direk</span>
              <span className="seo-badge">Kayseri 2. el kalıp altı iskele</span>
              <span className="seo-badge">Kayseri satılık plywood</span>
              <span className="seo-badge">Kayseri inşaat kerestesi 5x10</span>
              <span className="seo-badge">Kayseri sac kalıp panosu</span>
              <span className="seo-badge">Kayseri şantiye gırgır vinç</span>
              <span className="seo-badge">Kayseri betoniyer harç karma</span>
              <span className="seo-badge">Eski sanayi inşaat malzemecileri</span>
              <span className="seo-badge">Kocasinan 2. el inşaat malzemesi</span>
              <span className="seo-badge">Melikgazi kalıp malzemesi</span>
              <span className="seo-badge">Talas kiralık satılık iskele</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER (İLETİŞİM & ADRES) */}
      <footer className="site-footer" id="iletisim">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>🏗️</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                  {siteConfig.businessName}
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {siteConfig.description}
              </p>
              <div style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.2)', padding: '0.4rem 0.85rem', borderRadius: '6px', color: '#fbbf24', fontWeight: 700 }}>
                ✓ Kayseri Yerel Aile İşletmesi
              </div>
            </div>

            <div>
              <h4 className="footer-heading">İletişim & Konum</h4>
              <ul className="footer-contact-list">
                <li className="footer-contact-item">
                  <Phone size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Telefon:</strong><br />
                    <a href={`tel:${siteConfig.phoneRaw}`} style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem' }}>
                      {siteConfig.phoneDisplay}
                    </a>
                  </div>
                </li>
                <li className="footer-contact-item">
                  <MapPin size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Adres:</strong><br />
                    <span>{siteConfig.addressFull}</span>
                  </div>
                </li>
                <li className="footer-contact-item">
                  <Clock size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Çalışma Saatleri:</strong><br />
                    <span>{siteConfig.workingHours}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Hızlı Bağlantılar</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '1.05rem' }}>
                <li><a href="#urunler" style={{ color: '#cbd5e1' }}>• Malzemeler ve Fiyatlar</a></li>
                <li><a href="#facebook" style={{ color: '#cbd5e1' }}>• Facebook Güncel Paylaşımlar</a></li>
                <li><a href="#sss" style={{ color: '#cbd5e1' }}>• Sıkça Sorulan Sorular</a></li>
                <li><a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer" style={{ color: '#86efac', fontWeight: 700 }}>• WhatsApp Teklif Hattı</a></li>
                <li><a href={siteConfig.facebookPageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', fontWeight: 700 }}>• Facebook Resmi Sayfamız</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} {siteConfig.businessName} - Tüm Hakları Saklıdır.</p>
            <p style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
              Kayseri İkinci El İnşaat Malzemesi Arama Optimizasyonu (SEO) ve Cloudflare Uyumlu Altyapı
            </p>
          </div>
        </div>
      </footer>

      {/* 9. MOBİL SABİT DOKUNMATİK ÇUBUK (30-80 YAŞ İÇİN TEK DOKUNUŞLA ÇAĞRI VE WHATSAPP) */}
      <div className="sticky-bottom-bar">
        <a 
          href={`tel:${siteConfig.phoneRaw}`} 
          className="btn-sticky-call"
          title="Hemen Telefonla Ara"
        >
          <Phone size={24} />
          <span>HEMEN ARA</span>
        </a>

        <a 
          href={getWhatsappLink()} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-sticky-whatsapp"
          title="WhatsApp İle Yaz"
        >
          <MessageCircle size={24} />
          <span>WHATSAPP</span>
        </a>
      </div>
    </div>
  );
}
